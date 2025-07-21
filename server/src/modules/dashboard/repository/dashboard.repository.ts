import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dashboard, DashboardDocument } from '../entities/dashboard.entity';
import { CreateDashboardDto, UpdateDashboardDto } from '../dto';

@Injectable()
export class DashboardRepository {
  private readonly logger = new Logger(DashboardRepository.name);

  constructor(
    @InjectModel(Dashboard.name) private dashboardModel: Model<DashboardDocument>,
  ) {}

  async create(createDashboardDto: CreateDashboardDto): Promise<Dashboard> {
    const createdDashboard = new this.dashboardModel(createDashboardDto);
    return createdDashboard.save();
  }

  async findAll(): Promise<Dashboard[]> {
    return this.dashboardModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<Dashboard | null> {
    return this.dashboardModel.findById(id).exec();
  }

  async findByName(name: string): Promise<Dashboard | null> {
    return this.dashboardModel.findOne({ name }).exec();
  }

  async update(id: string, updateDashboardDto: UpdateDashboardDto): Promise<Dashboard | null> {
    return this.dashboardModel
      .findByIdAndUpdate(id, 
        { 
          ...updateDashboardDto,
          lastModifiedBy: updateDashboardDto.lastModifiedBy,
        }, 
        { new: true }
      )
      .exec();
  }

  async remove(id: string): Promise<Dashboard | null> {
    return this.dashboardModel.findByIdAndDelete(id).exec();
  }

  async findDefaultDashboard(): Promise<Dashboard | null> {
    return this.dashboardModel.findOne({ 
      isActive: true,
      'pages.isDefault': true 
    }).exec();
  }

  async createDefaultDashboard(): Promise<Dashboard> {
    const defaultDashboard: CreateDashboardDto = {
      name: 'Default Dashboard',
      description: 'System default dashboard',
      isActive: true,
      isSystem: false,
      pages: [
        {
          id: 'default-page',
          name: 'Dashboard Overview',
          order: 0,
          isDefault: true,
          widgets: [
            {
              id: 'welcome-header-widget',
              widgetType: 'welcome-header',
              title: 'Welcome Header',
              size: 'medium-large',
              position: 0,
              settings: {}
            },
            {
              id: 'tips-widget',
              widgetType: 'tips-of-the-day',
              title: 'Tips of the day',
              size: 'small-medium',
              position: 1,
              settings: {}
            },
            {
              id: 'performance-widget',
              widgetType: 'SystemPerformanceCard',
              title: 'System Performance',
              size: 'small',
              position: 2,
              settings: {}
            },
            {
              id: 'availability-widget',
              widgetType: 'AvailabilityCard',
              title: 'System Availability',
              size: 'small',
              position: 3,
              settings: {}
            },
            {
              id: 'containers-widget',
              widgetType: 'ContainersCard',
              title: 'Containers Status',
              size: 'small',
              position: 4,
              settings: {}
            },
            {
              id: 'power-widget',
              widgetType: 'CombinedPowerCard',
              title: 'Combined Power',
              size: 'small',
              position: 5,
              settings: {}
            },
            {
              id: 'main-chart-widget',
              widgetType: 'MainChartCard',
              title: 'Historical Analytics',
              size: 'large',
              position: 6,
              settings: {}
            }
          ]
        }
      ]
    };

    return this.create(defaultDashboard);
  }
}