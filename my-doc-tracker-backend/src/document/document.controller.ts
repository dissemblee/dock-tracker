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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/shared/jwt/jwt-auth.guard';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

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
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return await this.documentService.create(createDocumentDto, file, userId);
  }

  @Get()
  async findAll(@Query('userId', ParseIntPipe) userId: number) {
    return await this.documentService.list(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return await this.documentService.findOne(id, userId);
  }

  @Put(':id/meta')
  async updateMeta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return await this.documentService.updateMeta(id, updateDocumentDto, userId);
  }

  @Put(':id/file')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedFile,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return await this.documentService.replaceFile(id, file, userId);
  }

  @Get(':id/download-url')
  async getDownloadUrl(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return await this.documentService.getDownloadUrl(id, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return await this.documentService.delete(id, userId);
  }

  @Get('expiring/today')
  async findExpiringToday(): Promise<any[]> {
    return this.documentService.findExpiringToday();
  }
}
