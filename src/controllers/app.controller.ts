import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { RoutePaths } from '../routes/route-paths';

@Controller(RoutePaths.root)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(RoutePaths.health)
  async health() {
    return this.appService.getHealth();
  }
}
