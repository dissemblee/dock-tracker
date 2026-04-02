import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private client: S3Client;

  constructor(private configService: ConfigService) {
    this.client = new S3Client({
      region: 'us-east-1',
      endpoint: this.configService.get<string>('S3_ENDPOINT', 'http://s3:9000'),
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true,
    });
  }

  bucket = 'documents';

  async upload(key: string, file: Buffer, mime: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mime,
      }),
    );
  }

  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getSignedUrl(key: string, expires = 60): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return getSignedUrl(this.client, command, {
      expiresIn: expires,
    }) as Promise<string>;
  }
}
