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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/shared/jwt/jwt-auth.guard';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import type { Request, Response } from 'express';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: UploadedFile,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number };
    return await this.documentService.create(createDocumentDto, file, user.id);
  }

  @Get()
  async findAll(
    @Query() query: DocumentQueryDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number };
    return await this.documentService.list(user.id, query);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number };
    return await this.documentService.findOne(id, user.id);
  }

  @Get(':id/image-url')
  async getImageUrl(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number };
    return await this.documentService.getPresignedImageUrl(id, user.id);
  }

  @Get(':id/image')
  async getImage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user as { id: number };
    const { buffer, contentType } = await this.documentService.getImageFile(id, user.id);
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
    const user = req.user as { id: number };
    return await this.documentService.updateMeta(id, updateDocumentDto, user.id);
  }

  @Put(':id/file')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedFile,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number };
    return await this.documentService.replaceFile(id, file, user.id);
  }

  @Get(':id/download-url')
  async getDownloadUrl(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number };
    return await this.documentService.getDownloadUrl(id, user.id);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number };
    return await this.documentService.delete(id, user.id);
  }

  @Get('expiring/today')
  async findExpiringToday(): Promise<any[]> {
    return this.documentService.findExpiringToday();
  }
}
