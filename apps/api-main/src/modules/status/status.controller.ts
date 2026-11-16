import { Controller, Get } from '@nestjs/common';

import { ApiResponse } from '@libs/core';

import { StatusService } from './status.service';
import type { StatusInfo } from './types/status-info.type';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  getStatus(): ApiResponse<StatusInfo> {
    return new ApiResponse({ data: this.statusService.getStatus() });
  }
}
