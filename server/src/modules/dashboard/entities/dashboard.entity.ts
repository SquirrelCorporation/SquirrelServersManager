import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DashboardDocument = Dashboard & Document;

@Schema({
  collection: 'dashboards',
})
export class WidgetSettings {
  @Prop({ required: false })
  statistics_type?: string;

  @Prop({ required: false })
  statistics_source?: string[];

  @Prop({ required: false })
  statistics_metric?: string;

  @Prop({ required: false })
  icon?: string;

  @Prop({ required: false })
  backgroundColor?: string;

  @Prop({ required: false })
  title?: string;

  @Prop({ required: false })
  customText?: string;

  @Prop({ required: false, type: Object })
  customSettings?: Record<string, any>;
}

@Schema({
  timestamps: true,
})
export class DashboardWidget {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  widgetType!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  size!: string;

  @Prop({ required: true })
  position!: number;

  @Prop({ required: false, type: WidgetSettings })
  settings?: WidgetSettings;
}

@Schema({
  timestamps: true,
})
export class DashboardPage {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  order!: number;

  @Prop({ required: true, type: [DashboardWidget] })
  widgets!: DashboardWidget[];

  @Prop({ required: false })
  isDefault?: boolean;
}

@Schema({
  collection: 'dashboards',
  timestamps: true,
})
export class Dashboard {
  _id?: string;

  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, type: [DashboardPage] })
  pages!: DashboardPage[];

  @Prop({ required: true, default: true })
  isActive!: boolean;

  @Prop({ required: false, default: false })
  isSystem?: boolean; // System dashboards cannot be deleted

  @Prop({ required: false })
  lastModifiedBy?: string;
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard);