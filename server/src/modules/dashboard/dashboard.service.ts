import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { DashboardRepository } from './repository/dashboard.repository';
import { CreateDashboardDto, UpdateDashboardDto } from './dto';
import { Dashboard } from './entities/dashboard.entity';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async create(createDashboardDto: CreateDashboardDto): Promise<Dashboard> {
    // Check if dashboard with same name exists
    const existing = await this.dashboardRepository.findByName(createDashboardDto.name);
    if (existing) {
      throw new ConflictException(`Dashboard with name "${createDashboardDto.name}" already exists`);
    }

    return this.dashboardRepository.create(createDashboardDto);
  }

  async findAll(): Promise<Dashboard[]> {
    return this.dashboardRepository.findAll();
  }

  async findOne(id: string): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.findOne(id);
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID "${id}" not found`);
    }
    return dashboard;
  }

  async update(id: string, updateDashboardDto: UpdateDashboardDto): Promise<Dashboard> {
    const existing = await this.findOne(id);
    
    // Prevent updating system dashboards name
    if (existing.isSystem && updateDashboardDto.name) {
      throw new ConflictException('Cannot update name of system dashboard');
    }

    // Check for name conflicts if updating name
    if (updateDashboardDto.name && updateDashboardDto.name !== existing.name) {
      const nameExists = await this.dashboardRepository.findByName(updateDashboardDto.name);
      if (nameExists) {
        throw new ConflictException(`Dashboard with name "${updateDashboardDto.name}" already exists`);
      }
    }

    const updated = await this.dashboardRepository.update(id, updateDashboardDto);
    if (!updated) {
      throw new NotFoundException(`Dashboard with ID "${id}" not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const dashboard = await this.findOne(id);
    
    // Prevent deleting system dashboards
    if (dashboard.isSystem) {
      throw new ConflictException('Cannot delete system dashboard');
    }

    const result = await this.dashboardRepository.remove(id);
    if (!result) {
      throw new NotFoundException(`Dashboard with ID "${id}" not found`);
    }
  }

  async getCurrentDashboard(): Promise<Dashboard> {
    // For now, return the default dashboard or create one if it doesn't exist
    let dashboard = await this.dashboardRepository.findDefaultDashboard();
    
    if (!dashboard) {
      this.logger.log('Creating default dashboard');
      dashboard = await this.dashboardRepository.createDefaultDashboard();
    }

    return dashboard;
  }

  async updateWidgets(
    dashboardId: string, 
    pageId: string, 
    widgets: any[]
  ): Promise<Dashboard> {
    const dashboard = await this.findOne(dashboardId);
    
    const pageIndex = dashboard.pages.findIndex(page => page.id === pageId);
    if (pageIndex === -1) {
      throw new NotFoundException(`Page with ID "${pageId}" not found in dashboard`);
    }

    // Update the widgets for the specific page
    dashboard.pages[pageIndex].widgets = widgets;

    const updated = await this.dashboardRepository.update(dashboardId, dashboard);
    if (!updated) {
      throw new NotFoundException(`Dashboard with ID "${dashboardId}" not found`);
    }
    return updated;
  }
}