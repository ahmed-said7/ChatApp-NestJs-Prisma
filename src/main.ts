import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Session, ValidationPipe } from '@nestjs/common';
import * as session from "express-session";
import * as passport from "passport";
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
          new ValidationPipe({  
            whitelist:true,
            transform:true,
            transformOptions: {enableImplicitConversion:true} 
      }));
  app.use(session({
    secret: "secret1234567890",
    saveUninitialized: false,
    resave: false,
    cookie:{
      maxAge : 3600000*24
    },
    name:"Chat_Session_Id"
    ,
    store : new PrismaSessionStore(
      new PrismaClient() as any,
      {
        sessionModelName:"session",
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  }))
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(3000);
};
bootstrap();
