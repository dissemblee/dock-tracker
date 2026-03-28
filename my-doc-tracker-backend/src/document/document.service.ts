import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { DocumentModel } from './document.model';
import { S3Service } from 'src/shared/s3/S3.service';
import { buildKey } from 'src/shared/s3/buildKey';
import { fileTypeFromBuffer } from 'file-type';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UserService } from 'src/user/user.service';
import { UpdateDocumentDto } from './dto/update-document.dto';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(DocumentModel) private documentModel: typeof DocumentModel,
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

  private async assertOwner(documentId: number, userId: number) {
    const doc = await this.documentModel.findByPk(documentId);
    if (!doc) throw new NotFoundException('Документ не найден');
    if (doc.userId !== userId) throw new ForbiddenException('Нет доступа');
    return doc;
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

  async create(dto: CreateDocumentDto, file: UploadedFile, userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new BadRequestException('Пользователь не найден');

    const detected = await this.validateFile(file);
    const key = buildKey(userId, detected.ext);

    let uploaded = false;

    return await this.sequelize.transaction(async (t: Transaction) => {
      try {
        await this.s3.upload(key, file.buffer, detected.mime);
        uploaded = true;

        const doc = await this.documentModel.create(
          {
            userId,
            ...dto,
            fileKey: key,
            fileName: file.originalname,
            mimeType: detected.mime,
            size: file.size,
            uploadedAt: new Date(),
          } as any,
          { transaction: t },
        );

        return {
          ...doc.toJSON(),
          status: this.calcStatus(doc.expiresAt, doc.notifyBefore),
        };
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

    return {
      ...doc.toJSON(),
      status: this.calcStatus(doc.expiresAt, doc.notifyBefore),
    };
  }

  async list(userId: number) {
    const docs = await this.documentModel.findAll({ where: { userId } });

    return docs.map((d) => ({
      ...d.toJSON(),
      status: this.calcStatus(d.expiresAt, d.notifyBefore),
    }));
  }

  async updateMeta(documentId: number, dto: UpdateDocumentDto, userId: number) {
    const doc = await this.assertOwner(documentId, userId);

    await doc.update(dto);

    return {
      ...doc.toJSON(),
      status: this.calcStatus(doc.expiresAt, doc.notifyBefore),
    };
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
}
