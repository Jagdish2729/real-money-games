import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaService } from "./prisma.service";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
