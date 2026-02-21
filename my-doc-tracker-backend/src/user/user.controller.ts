import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserModel } from "./user.model";
import { JwtAuthGuard } from "src/shared/jwt/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller(`users`)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<UserModel[]> {
    return this.userService.findAll();
  }
  
  @Get('current')
  async getCurrentUser(@Req() req: Request): Promise<UserModel | null> {
    const userId = (req as any).user.id;
    return this.userService.currentUser(userId);
  }
}