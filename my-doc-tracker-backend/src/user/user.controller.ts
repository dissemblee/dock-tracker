import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserModel } from "./user.model";

@Controller(`users`)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<UserModel[]> {
    return this.userService.findAll();
  }
}