import { 
    ConnectedSocket, MessageBody, OnGatewayConnection, 
    OnGatewayDisconnect, SubscribeMessage, 
    WebSocketGateway, WebSocketServer 
} from "@nestjs/websockets";
import { Server } from "socket.io";
import * as cookie from "cookie";
import * as cookieParser from "cookie-parser";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthSocket, HandleSocketService } from "./store.service";
import { OnEvent } from "@nestjs/event-emitter";
import { IUser } from "src/user/user.service";


interface IMessage {
    id:number;
    creator:IUser;
    content: string;
    creatorId:number;
    conversationId:number;
    conversation:{
        name:string;
        creatorId:number;
        recipientId:number;
        creator:IUser;
        recipient:IUser;
    };
}

interface IGroup {
    id:number;
    name:string;
    creatorId:number;
    creator:IUser;
    users:IUser[];
}

interface IMessageGroup {
    id:number;
    content:string;
    createdAt:number;
    groupId:number;
    group:IGroup;
    creator:IUser;
    creatorId:number;
};



@WebSocketGateway()
export class WebSocketMessages implements OnGatewayConnection , OnGatewayDisconnect {
    constructor(
        private prisma:PrismaService,
        private HandleSocket:HandleSocketService ){};
    async handleConnection(client: AuthSocket, ...args: any[]) {
        const cookies=client.handshake.headers.cookie;
        if(!cookies){
            client._error(new Error("No cookies"));
            client.disconnect(true);
        };
        const { Chat_Session_Id }=cookie.parse(cookies);
        if(!Chat_Session_Id){
            client._error(new Error("no sessions cookies"));
            client.disconnect(true);
        };
        const sessionId=cookieParser.signedCookie(Chat_Session_Id,"secret1234567890") as string;
        const session=await this.prisma.session.findFirst({ where : { id:sessionId } });
        if( !session || !session.data ){
            client._error(new Error("No data session found"));
            client.disconnect(true);
        }
        const { passport  } = JSON.parse(session.data) as { passport? : { user? : number } };
        if( !passport || !passport.user){
            client._error(new Error("user is not authenticated"));
            client.disconnect(true);
        };
        const user=await this.prisma.user.findFirst({ where: { id : passport.user }});
        if(!user){
            client._error(new Error("user not found"));
            client.disconnect(true);
        };
        client.user = user;
        this.HandleSocket.setSocket(user.id,client);
    };
    
    async handleDisconnect(client: AuthSocket) {
        if(client.user?.id){
            this.HandleSocket.deleteSocket(client.user.id);
        }
    };
    @WebSocketServer()
    server:Server;

    @OnEvent("message.created")
    emitMessageCreated(message:IMessage){
        const roomId=`conversationId-${message.conversationId}`;
        const recipient=
        message.creatorId == message.conversation.creatorId ?
            this.HandleSocket.getSocket(message.conversation.recipientId):
            this.HandleSocket.getSocket(message.conversation.creatorId);
        if( recipient && recipient.rooms.has(roomId) ){
            delete message.conversation;
            recipient.emit("onConversationMessage",message);
        }else if( recipient ){
            delete message.conversation.creator;
            delete message.conversation.recipient;
            recipient.emit("Message",message);
        };
    };
    
    @OnEvent("message.updated")
    emitMessageUpdated(message:IMessage){
        const roomId=`conversationId-${message.conversationId}`
        const recipient=
        message.creatorId == message.conversation.creatorId ?
            this.HandleSocket.getSocket(message.conversation.recipientId):
            this.HandleSocket.getSocket(message.conversation.creatorId)
        if( recipient && recipient.rooms.has(roomId) ){
            delete message.conversation;
            recipient.emit("onConversationMessageUpdated",message);
        }else if( recipient ){
            delete message.conversation.creator;
            delete message.conversation.recipient;
            recipient.emit("MessageUpdated",message);
        };
    };
    
    @OnEvent("message.deleted")
    emitMessageDeleted(message:IMessage){
        const roomId=`conversationId-${message.conversationId}`
        const recipient=
        message.creatorId == message.conversation.creatorId ?
            this.HandleSocket.getSocket(message.conversation.recipientId):
            this.HandleSocket.getSocket(message.conversation.creatorId)
        if( recipient && recipient.rooms.has(roomId) ){
            delete message.conversation;
            recipient.emit("onConversationMessageDeleted",message);
        }else if( recipient ){
            delete message.conversation.creator;
            delete message.conversation.recipient;
            recipient.emit("MessageDeleted",message);
        };
    };

    @SubscribeMessage("onConversationJoin")
    onConversationJoin(
        @MessageBody() body : { conversationId:number } ,
        @ConnectedSocket() socket : AuthSocket
    ){
        const roomId=`conversationId-${body.conversationId}`;
        socket.join(roomId);
        socket.to(roomId).emit("userJoined");
    };

    @SubscribeMessage("onConversationLeave")
    onConversationLeave(
        @MessageBody() body : { conversationId:number } ,
        @ConnectedSocket() socket : AuthSocket
    ){
        const roomId=`conversationId-${body.conversationId}`;
        if(socket.rooms.has(roomId)){
            socket.to(roomId).emit("userLeft");
            socket.leave(roomId);
        };
    };

    @SubscribeMessage('onTypingStart')
    onTypingStart(
        @MessageBody() body : { conversationId:number } ,
        @ConnectedSocket() socket : AuthSocket
    ){
        const roomId=`conversationId-${body.conversationId}`
        if(socket.rooms.has(roomId)){
            socket.to(roomId).emit("onTypingStart");
        };
    };

    @SubscribeMessage('onTypingStop')
    onTypingStop(
        @MessageBody() body : { conversationId:number } ,
        @ConnectedSocket() socket : AuthSocket
    ){
        const roomId=`conversationId-${body.conversationId}`;
        if( socket.rooms.has(roomId) ){
            socket.to(roomId).emit("onTypingStop" );
        };
    };

    @OnEvent("group.created")
    groupCreated(group: IGroup){
        group.users
            .forEach( ({id}) => {
                const recipient=this.HandleSocket.getSocket(id);
                if(recipient){
                    recipient.emit("group.created",group);
                };
        });
    };

    @OnEvent("message.group.created")
    MessageGroupCreated(message:IMessageGroup){
        const rooms=this.server.sockets.adapter.rooms;
        const roomId=`groupId-${message.groupId}`;
        if( rooms.get(roomId) ){
            this.server.to(roomId).emit("onGroupMessageCreated",message)
        };
        message.group.users
            .forEach( (user) => {
            const recipient=this.HandleSocket.getSocket(user.id);
            if( recipient && !recipient.rooms.has(roomId) ){
                recipient.emit("message.group.created",message);
            };
        });
    };

    @OnEvent("message.group.updated")
    MessageGroupUpdated(message:IMessageGroup){
        const rooms=this.server.sockets.adapter.rooms;
        const roomId=`groupId-${message.groupId}`;
        if( rooms.get(roomId) ){
            this.server.to(roomId).emit("onGroupMessageUpdated",message)
        };
        message.group.users
            .forEach( (user) => {
            const recipient=this.HandleSocket.getSocket(user.id);
            if( recipient && !recipient.rooms.has(roomId) ){
                recipient.emit("message.group.updated",message);
            };
        });
    };

    @OnEvent("message.group.deleted")
    MessageGroupDeleted(message:IMessageGroup){
        const rooms=this.server.sockets.adapter.rooms;
        const roomId=`groupId-${message.groupId}`;
        if( rooms.get(roomId) ){
            this.server.to(roomId).emit("onGroupMessageDeleted",message)
        };
        message.group.users
            .forEach( (user) => {
            const recipient=this.HandleSocket.getSocket(user.id);
            if( recipient && !recipient.rooms.has(roomId) ){
                recipient.emit("message.group.deleted",message);
            };
        });
    };

    @SubscribeMessage("onGroupJoin")
    onGroupJoin(
        @MessageBody() body : { groupId : number } ,
        @ConnectedSocket() socket : AuthSocket
    ){
        const roomId=`groupId-${body.groupId}`;
        socket.join(roomId);
        socket.to(roomId).emit("userJoinedGroup",{user:socket.user});
    };

    @SubscribeMessage("onGroupLeave")
    onGroupLeave(
        @MessageBody() body : { groupId:number } ,
        @ConnectedSocket() socket : AuthSocket
    ){
        const roomId=`groupId-${body.groupId}`;
        if(socket.rooms.has(roomId)){
            socket.to(roomId).emit("userLeftGroup",{user:socket.user});
            socket.leave(roomId);
        };
    };
    @OnEvent("group.user.added")
    UserGroupAdded(
        body : { user:IUser, group : IGroup } 
    ){
        const recipient=this.HandleSocket.getSocket(body.user.id);
        if(recipient){
            recipient.emit("user.added",{ group:body.group });
        };
        const rooms=this.server.sockets.adapter.rooms;
        const roomId=`groupId-${body.group.id}`;
        if( rooms.has(roomId) ){
            this.server.to(roomId).emit("onGroupUserAdded",{ user:body.user });
        };
        body.group.users.forEach( (user) => {
            const recipient=this.HandleSocket.getSocket(user.id);
            if( recipient && !recipient.rooms.has(roomId) ){
                recipient.emit("group.user.added", body );
            };
        });
    };
    @OnEvent("group.user.removed")
    UserGroupRemoved(
        body : { user:IUser, group : IGroup } 
    ){
        const recipient=this.HandleSocket.getSocket(body.user.id);
        if(recipient){
            recipient.emit("user.removed",{ group:body.group });
        };
        const rooms=this.server.sockets.adapter.rooms;
        const roomId=`groupId-${body.group.id}`;
        if( rooms.has(roomId) ){
            this.server.to(roomId).emit("onGroupUserRemoved",{ user:body.user });
        };
        body.group.users.forEach( (user) => {
            const recipient=this.HandleSocket.getSocket(user.id);
            if( recipient && !recipient.rooms.has(roomId) ){
                recipient.emit("group.user.removed", body );
            };
        });
        if( rooms.has(roomId) && recipient.rooms.has(roomId) ){
            recipient.leave(roomId);
        };
    };
    @OnEvent("group.user.owner")
    changeGroupOwner(body: { group:IGroup  }){
        const recipient=this.HandleSocket.getSocket(body.group.creatorId);
        if(recipient){
            recipient.emit("user.owner", body );
        };
        const rooms=this.server.sockets.adapter.rooms;
        const roomId=`groupId-${body.group.id}`;
        if( rooms.has(roomId) ){
            this.server.to(roomId).emit("onGroupUserOwner",{ user:body.group.creator});
        };
        const users=body.group
        .users.filter( ( user ) => { return user.id != body.group.creatorId } );
        users.forEach( (user) => {
            const recipient=this.HandleSocket.getSocket(user.id);
            if( recipient && !recipient.rooms.has(roomId) ){
                recipient.emit("group.user.owner", body );
            };
        });
    };
    @OnEvent("group.user.left")
    GroupUserLeft( body: { group:IGroup,user:IUser  } ){
        const recipient=this.HandleSocket.getSocket(body.user.id);
        if(recipient){
            recipient.emit("user.left",{ group:body.group });
        };
        const rooms=this.server.sockets.adapter.rooms;
        const roomId=`groupId-${body.group.id}`;
        if( rooms.has(roomId) ){
            this.server.to(roomId).emit("onGroupUserLeft",{ user:body.user });
        };
        body.group.users.forEach( (user) => {
            const recipient=this.HandleSocket.getSocket(user.id);
            if( recipient && !recipient.rooms.has(roomId) ){
                recipient.emit("group.user.left", body );
            };
        });
        if( rooms.has(roomId) && recipient.rooms.has(roomId) ){
            recipient.leave(roomId);
        };
    };
    @OnEvent("user.request.rejected")
    requestRejected(body:{ sender:IUser ,receiverId:number }){
        const socket=this.HandleSocket.getSocket(body.receiverId);
        if(socket){
            socket.emit("user.request.rejected",{user:body.sender});
        }
    };
    @OnEvent("user.request.accepted")
    requestAccepted(body:{ sender:IUser ,receiverId:number }){
        const socket=this.HandleSocket.getSocket(body.receiverId);
        if(socket){
            socket.emit("user.request.accepted",{user:body.sender});
        }
    };
    @OnEvent("user.request.received")
    requestRecieved(body:{ sender:IUser ,receiverId:number }){
        const socket=this.HandleSocket.getSocket(body.receiverId);
        if(socket){
            socket.emit("user.request.received",{user:body.sender});
        }
    };
    @OnEvent("getOnlineUser")
    async getOnlineUser(@ConnectedSocket() socket:AuthSocket ){
        const userId=socket.user.id;
        const user=await this.prisma.user.findFirst({
            where : {id:userId},
            select : {
                sender:true,
                reciver:true
            }
        });
        const onlineUsers=[];
        const offlineUsers=[];
        user.sender.forEach((user)=>{
            const recipient=this.HandleSocket.getSocket(user.id);
            if( recipient ){
                onlineUsers.push(user)
            }else {
                offlineUsers.push(user);
            };
        })
        user.reciver.forEach((user)=>{
            const recipient=this.HandleSocket.getSocket(user.id);
            if( recipient ){
                onlineUsers.push(user)
            }else {
                offlineUsers.push(user);
            };
        })
        socket.emit("onlineUsers",{onlineUsers,offlineUsers});
    };
};