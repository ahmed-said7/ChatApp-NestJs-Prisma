import { Module } from "@nestjs/common";
import { GroupController } from "./group.controller";
import { GroupService } from "./group.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    providers:[GroupService],
    controllers:[GroupController],
    imports:[PrismaModule]
})
export class GroupModule {};