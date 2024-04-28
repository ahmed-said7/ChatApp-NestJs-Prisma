import { Module } from '@nestjs/common';
import { AuthModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SocketModule } from './gateways/socket.module';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './groups/group.module';
import { MessageGroupModule } from './messages-groups/message.module';
import { FriendRequestModule } from './requests/friend.module';
import { FriendModule } from './friends/friends.module';


@Module({
  imports: [
    EventEmitterModule.forRoot({global:true})
    ,AuthModule,MessageModule,PrismaModule,ConversationModule,
    SocketModule
    ,ConfigModule.forRoot({isGlobal:true}),
    GroupModule,MessageGroupModule,
    FriendRequestModule,
    FriendModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
