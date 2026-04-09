import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { DocumentModule } from './document/document.module';
import { SeedModule } from './seed/seed.module';
import { ReminderModule } from './reminder/reminder.module';
import { CompanyMembersModule } from './company/members/company-members.module';
import { CompanyAccessModule } from './shared/company-access-guard/company-access.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
    DocumentModule,
    AuthModule,
    UsersModule,
    CompanyModule,
    CompanyMembersModule,
    SeedModule,
    ReminderModule,
    CompanyAccessModule,
  ],
})
export class AppModule {}
