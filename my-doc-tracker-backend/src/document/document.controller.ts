import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  ParseIntPipe,
  Req,
  Res,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/shared/jwt/jwt-auth.guard';
import { DocumentService, DocumentGroupedByOwner } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import type { Request, Response } from 'express';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface JwtUserPayload {
  id: number;
  email: string;
  role: string;
  companyId: number | null;
  workMode?: string;
  activeCompanyId?: number | null;
}

/** Извлечь пользователя из запроса с типизацией */
function getUser(req: Request): JwtUserPayload {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (req as any).user as JwtUserPayload;
}

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}
  private readonly logger = new Logger(DocumentController.name);

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: MulterFile,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: Request,
  ) {
    const user = getUser(req);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const activeCompanyId = user.activeCompanyId ?? null;

    return await this.documentService.create(
      createDocumentDto,
      file,
      user.id,
      activeCompanyId
    );
  }

  @Get()
  async findAll(
    @Query() query: DocumentQueryDto,
    @Req() req: Request,
  ) {
    const user = getUser(req);

    return await this.documentService.list(user.id, query);
  }

  /**
   * Иерархический список документов компании (сгруппированный по сотрудникам)
   */
  @Get('company/:companyId/grouped')
  async findGroupedByOwner(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query() query: DocumentQueryDto,
    @Req() req: Request,
  ): Promise<DocumentGroupedByOwner[]> {
    const user = getUser(req);
    return await this.documentService.listGroupedByOwner(
      companyId,
      user.id,
      query,
    );
  }

  @Get(':id/image-url')
  async getImageUrl(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = getUser(req);
    return await this.documentService.getPresignedImageUrl(id, user.id);
  }

  @Get(':id/image')
  async getImage(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new BadRequestException('Invalid id');
    }
    const user = getUser(req);
    const { buffer, contentType } = await this.documentService.getImageFile(numericId, user);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  }

  @Put(':id/meta')
  async updateMeta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Req() req: Request,
  ) {
    const user = getUser(req);
    return await this.documentService.updateMeta(id, updateDocumentDto, user.id);
  }

  @Put(':id/file')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: MulterFile,
    @Req() req: Request,
  ) {
    const user = getUser(req);
    return await this.documentService.replaceFile(id, file, user.id);
  }

  @Get(':id/download-url')
  async getDownloadUrl(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = getUser(req);
    return await this.documentService.getDownloadUrl(id, user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = getUser(req);
    return await this.documentService.findOne(id, user.id);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = getUser(req);
    return await this.documentService.delete(id, user.id);
  }

  @Get('expiring/today')
  async findExpiringToday(): Promise<any[]> {
    return this.documentService.findExpiringToday();
  }
}
