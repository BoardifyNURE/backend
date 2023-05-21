import { Module } from '@nestjs/common';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { Request } from 'express';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';
import { TasksModule } from './tasks/tasks.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    BoardsModule,
    ColumnsModule,
    TasksModule,
    TodosModule,
    GoogleRecaptchaModule.forRoot({
      secretKey: '6LeSsCAmAAAAAED2kfruPY80sSNb1j9EXLaoontP',
      response: (req: Request) => req.headers.recaptcha as string,
      score: 0.9,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
