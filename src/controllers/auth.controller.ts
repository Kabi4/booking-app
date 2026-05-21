import { RoutePaths } from "@/routes/route-paths";
import { Controller } from "@nestjs/common";
import { AuthService } from "@/services/auth.service";
import { Post, Body } from "@nestjs/common";

@Controller(RoutePaths.auth)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(RoutePaths.signup)
  async signup(@Body() body: { email: string, password: string }) {
    return this.authService.singup(body.email, body.password);
  }

  @Post(RoutePaths.signin)
  async signin(@Body() body: { email: string, password: string, role: string }) {
    return this.authService.signin(body.email, body.password, body.role);
  }
}