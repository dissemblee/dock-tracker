import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeedService } from './seed.service';
import { UserModel } from 'src/user/user.model';

@Module({
  imports: [SequelizeModule.forFeature([UserModel])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
