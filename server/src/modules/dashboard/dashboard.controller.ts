import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto, UpdateDashboardDto, DashboardWidgetDto } from './dto';

@ApiTags('dashboards')
@Controller('dashboards')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dashboard' })
  async create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardService.create(createDashboardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dashboards' })
  async findAll() {
    return this.dashboardService.findAll();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current dashboard' })
  async getCurrentDashboard() {
    return this.dashboardService.getCurrentDashboard();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dashboard by ID' })
  async findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dashboard' })
  async update(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
    @Request() req: any,
  ) {
    // Add who modified the dashboard
    updateDashboardDto.lastModifiedBy = req.user.email;
    return this.dashboardService.update(id, updateDashboardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete dashboard' })
  async remove(@Param('id') id: string) {
    await this.dashboardService.remove(id);
    return { message: 'Dashboard deleted successfully' };
  }

  @Patch(':dashboardId/pages/:pageId/widgets')
  @ApiOperation({ summary: 'Update widgets for a specific page' })
  async updateWidgets(
    @Param('dashboardId') dashboardId: string,
    @Param('pageId') pageId: string,
    @Body() widgets: DashboardWidgetDto[],
  ) {
    return this.dashboardService.updateWidgets(dashboardId, pageId, widgets);
  }
}