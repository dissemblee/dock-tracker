import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction, FindOptions, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

import { DocumentModel } from './document.model';
import { S3Service } from 'src/shared/s3/S3.service';
import { buildKey } from 'src/shared/s3/buildKey';
import { fileTypeFromBuffer } from 'file-type';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UserService } from 'src/user/user.service';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import { UserModel, WorkMode } from 'src/user/user.model';
import { CompanyMemberModel } from 'src/company/company-member.model';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/** Результат группировки документов по владельцу */
export interface DocumentGroupedByOwner {
  owner: {
    id: number;
    name: string;
    email: string;
    isCompany: boolean;
  };
  documents: any[];
  totalCount: number;
}

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(DocumentModel) private documentModel: typeof DocumentModel,
    @InjectModel(CompanyMemberModel)
    private companyMemberModel: typeof CompanyMemberModel,
    private readonly s3: S3Service,
    private readonly userService: UserService,
    private readonly sequelize: Sequelize,
  ) {}

  private calcStatus(expiresAt: Date, notifyBefore: number) {
    const now = new Date();
    if (expiresAt < now) return 'EXPIRED';

    const notifyDate = new Date(expiresAt);
    notifyDate.setDate(notifyDate.getDate() - notifyBefore);

    if (notifyDate <= now) return 'EXPIRING';
    return 'ACTIVE';
  }

  private withStatus(doc: DocumentModel) {
    return {
      ...doc.toJSON(),
      status: this.calcStatus(doc.expiresAt, doc.notifyBefore),
    };
  }

  private async assertOwner(documentId: number, userId: number) {
    const doc = await this.documentModel.findByPk(documentId);
    if (!doc) throw new NotFoundException('Документ не найден');
    if (doc.userId !== userId) throw new ForbiddenException('Нет доступа');
    return doc;
  }

  /**
   * Проверить, что пользователь имеет доступ к документам компании
   */
  private async assertCompanyAccess(companyId: number, userId: number) {
    const membership = await this.companyMemberModel.findOne({
      where: { userId, companyId },
    });

    if (!membership) {
      throw new ForbiddenException('Вы не состоите в этой компании');
    }

    return membership;
  }

  private async validateFile(file: UploadedFile) {
    if (!file) throw new BadRequestException('Файл не передан');
    if (!file.size) throw new BadRequestException('Файл пустой');

    const detected = await fileTypeFromBuffer(file.buffer);
    if (!detected) throw new BadRequestException('Тип файла не определён');

    const allowed = ['pdf', 'png', 'jpg', 'jpeg'];
    if (!allowed.includes(detected.ext))
      throw new BadRequestException('Недопустимый тип файла');

    return detected;
  }

  async create(
    dto: CreateDocumentDto,
    file: UploadedFile,
    userId: number,
    workMode?: WorkMode,
    activeCompanyId?: number | null,
  ) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new BadRequestException('Пользователь не найден');

    const detected = await this.validateFile(file);
    const key = buildKey(userId, detected.ext);

    // Определяем, к какому контексту относится документ
    const isCompanyDoc = workMode === WorkMode.COMPANY && !!activeCompanyId;

    let uploaded = false;

    return await this.sequelize.transaction(async (t: Transaction) => {
      try {
        await this.s3.upload(key, file.buffer, detected.mime);
        uploaded = true;

        const doc = await this.documentModel.create(
          {
            userId,
            companyId: isCompanyDoc ? activeCompanyId : null,
            isCompanyDocument: isCompanyDoc,
            title: dto.title,
            expiresAt: new Date(dto.expiresAt),
            notifyBefore: dto.notifyBefore,
            fileKey: key,
            fileName: file.originalname,
            mimeType: detected.mime,
            size: file.size,
            uploadedAt: new Date(),
          } as any,
          { transaction: t },
        );

        return this.withStatus(doc);
      } catch {
        if (uploaded) await this.s3.delete(key);
        throw new InternalServerErrorException('Ошибка сохранения документа');
      }
    });
  }

  async findOne(documentId: number, userId: number) {
    const doc = await this.documentModel.findOne({
      where: { id: documentId, userId },
    });

    if (!doc) {
      throw new NotFoundException('Документ не найден');
    }

    return this.withStatus(doc);
  }

  /**
   * Список документов с учётом режима (personal / company).
   *
   * - mode=personal: WHERE ownerId = currentUserId AND (companyId IS NULL OR isCompanyDocument = false)
   * - mode=company: WHERE companyId = activeCompanyId (+ опционально ownerId, isCompanyDocument)
   */
  async list(userId: number, query: DocumentQueryDto) {
    const {
      limit = 10,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      status,
      search,
      mode = 'personal',
      companyId,
      ownerId,
      isCompanyDocument,
    } = query;

    const where: WhereOptions<DocumentModel> = {};

    if (mode === 'company' && companyId) {
      // Корпоративный режим: фильтрация по companyId
      where.companyId = companyId;

      if (ownerId) {
        // Фильтр по конкретному сотруднику
        where.userId = ownerId;
      }

      if (isCompanyDocument !== undefined) {
        where.isCompanyDocument = isCompanyDocument;
      }
    } else {
      // Личный режим: только документы пользователя
      where.userId = userId;
      where.companyId = { [Op.or]: [null, { [Op.ne]: null }] };
      where.isCompanyDocument = { [Op.ne]: true };
    }

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    const findOptions: FindOptions = {
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      include: [UserModel],
    };

    const docs = await this.documentModel.findAll(findOptions);

    const documents = docs.map((d) => this.withStatus(d));

    if (status) {
      return documents.filter((d) => d.status === status);
    }

    return documents;
  }

  /**
   * Иерархический список документов компании, сгруппированный по владельцам.
   * Возвращает структуру:
   * [
   *   { owner: { id, name, email, isCompany: true }, documents: [...], totalCount: N },
   *   { owner: { id, name, email, isCompany: false }, documents: [...], totalCount: N },
   *   ...
   * ]
   */
  async listGroupedByOwner(
    companyId: number,
    userId: number,
    query: DocumentQueryDto,
  ): Promise<DocumentGroupedByOwner[]> {
    // Проверяем доступ
    await this.assertCompanyAccess(companyId, userId);

    const { limit = 50, search, status } = query;

    const where: WhereOptions<DocumentModel> = { companyId };

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    const docs = await this.documentModel.findAll({
      where,
      limit,
      order: [['createdAt', 'DESC']],
      include: [UserModel],
    });

    // Группируем по владельцу
    const groups = new Map<number, DocumentGroupedByOwner>();

    // Добавляем «компанию» как владельца для общих документов
    groups.set(-1, {
      owner: { id: -1, name: 'Документы компании', email: '', isCompany: true },
      documents: [],
      totalCount: 0,
    });

    for (const doc of docs) {
      const docData = this.withStatus(doc);

      // Фильтр по статусу
      if (status && docData.status !== status) continue;

      const ownerId = doc.isCompanyDocument ? -1 : doc.userId;

      if (!groups.has(ownerId)) {
        const user = doc.user;
        groups.set(ownerId, {
          owner: {
            id: user?.id ?? ownerId,
            name: user?.name ?? 'Неизвестный',
            email: user?.email ?? '',
            isCompany: false,
          },
          documents: [],
          totalCount: 0,
        });
      }

      const group = groups.get(ownerId)!;
      group.documents.push(docData);
      group.totalCount++;
    }

    return Array.from(groups.values()).filter((g) => g.totalCount > 0);
  }

  async updateMeta(documentId: number, dto: UpdateDocumentDto, userId: number) {
    const doc = await this.assertOwner(documentId, userId);

    await doc.update(dto);

    return this.withStatus(doc);
  }

  async replaceFile(documentId: number, file: UploadedFile, userId: number) {
    const doc = await this.assertOwner(documentId, userId);
    const detected = await this.validateFile(file);

    const newKey = buildKey(userId, detected.ext);
    const oldKey = doc.fileKey;

    let uploaded = false;

    await this.sequelize.transaction(async (t) => {
      try {
        await this.s3.upload(newKey, file.buffer, detected.mime);
        uploaded = true;

        await doc.update(
          {
            fileKey: newKey,
            fileName: file.originalname,
            mimeType: detected.mime,
            size: file.size,
          },
          { transaction: t },
        );

        await this.s3.delete(oldKey);
      } catch {
        if (uploaded) await this.s3.delete(newKey);
        throw new InternalServerErrorException('Ошибка замены файла');
      }
    });

    return doc;
  }

  async getDownloadUrl(
    documentId: number,
    userId: number,
  ): Promise<{
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
  }> {
    const doc = await this.assertOwner(documentId, userId);

    const url = await this.s3.getSignedUrl(doc.fileKey, 60);

    return {
      url,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      size: doc.size,
    };
  }

  async delete(documentId: number, userId: number): Promise<void> {
    const doc = await this.assertOwner(documentId, userId);

    await this.sequelize.transaction(async (t) => {
      await doc.destroy({ transaction: t });
      await this.s3.delete(doc.fileKey);
    });
  }

  async findExpiringToday(): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const docs = await this.documentModel.findAll();

    return docs.filter((d) => {
      const notify = new Date(d.expiresAt);
      notify.setDate(notify.getDate() - d.notifyBefore);
      notify.setHours(0, 0, 0, 0);
      return notify.getTime() === today.getTime();
    });
  }

  async getPresignedImageUrl(documentId: number, userId: number): Promise<{ url: string }> {
    const doc = await this.assertOwner(documentId, userId);

    const isImage = doc.mimeType.startsWith('image/');
    if (!isImage) {
      throw new BadRequestException('Документ не является изображением');
    }

    const url = await this.s3.getSignedUrl(doc.fileKey, 60);

    return { url };
  }

  async getImageFile(documentId: number, userId: number): Promise<{ buffer: Buffer; contentType: string }> {
    const doc = await this.assertOwner(documentId, userId);

    const isImage = doc.mimeType.startsWith('image/');
    if (!isImage) {
      throw new BadRequestException('Документ не является изображением');
    }

    return await this.s3.getFile(doc.fileKey);
  }
}
