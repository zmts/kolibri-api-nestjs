import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CommonModule } from '@libs/common';
import { appConfig } from '@libs/config';
import { GlobalExceptionProvider } from '@libs/core';

import { StatusModule } from './modules/status/status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig],
    }),
    CommonModule,
    StatusModule,
  ],
  providers: [GlobalExceptionProvider],
})
export class AppModule {}
