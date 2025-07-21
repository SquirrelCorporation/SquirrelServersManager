import { request } from '@umijs/max';

export interface WidgetSettings {
  statistics_type?: string;
  statistics_source?: string[];
  statistics_metric?: string;
  icon?: string;
  backgroundColor?: string;
  title?: string;
  customText?: string;
  dateRangePreset?: string;
  customDateRange?: any;
  aggregationType?: string;
  colorPalette?: string;
  customColors?: string[];
  customSettings?: Record<string, any>;
}

export interface DashboardWidget {
  id: string;
  widgetType: string;
  title: string;
  size: string;
  position: number;
  settings?: WidgetSettings;
}

export interface DashboardPage {
  id: string;
  name: string;
  order: number;
  widgets: DashboardWidget[];
  isDefault?: boolean;
}

export interface Dashboard {
  _id?: string;
  name: string;
  description?: string;
  pages: DashboardPage[];
  isActive: boolean;
  isSystem?: boolean;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDashboardDto {
  name: string;
  description?: string;
  pages: DashboardPage[];
  isActive?: boolean;
  isSystem?: boolean;
}

export interface UpdateDashboardDto extends Partial<CreateDashboardDto> {}

class DashboardService {
  async create(data: CreateDashboardDto): Promise<Dashboard> {
    const response = await request('/api/dashboards', {
      method: 'POST',
      data,
    });
    return response.data || response;
  }

  async findAll(): Promise<Dashboard[]> {
    const response = await request('/api/dashboards', {
      method: 'GET',
    });
    return response.data || response;
  }

  async findOne(id: string): Promise<Dashboard> {
    const response = await request(`/api/dashboards/${id}`, {
      method: 'GET',
    });
    return response.data || response;
  }

  async getCurrentDashboard(): Promise<Dashboard> {
    const response = await request('/api/dashboards/current', {
      method: 'GET',
    });
    // Extract data from the wrapped response
    return response.data || response;
  }

  async update(id: string, data: UpdateDashboardDto): Promise<Dashboard> {
    const response = await request(`/api/dashboards/${id}`, {
      method: 'PATCH',
      data,
    });
    return response.data || response;
  }

  async remove(id: string): Promise<void> {
    return request(`/api/dashboards/${id}`, {
      method: 'DELETE',
    });
  }

  async updateWidgets(
    dashboardId: string,
    pageId: string,
    widgets: DashboardWidget[]
  ): Promise<Dashboard> {
    const response = await request(`/api/dashboards/${dashboardId}/pages/${pageId}/widgets`, {
      method: 'PATCH',
      data: widgets,
    });
    return response.data || response;
  }
}

export default new DashboardService();