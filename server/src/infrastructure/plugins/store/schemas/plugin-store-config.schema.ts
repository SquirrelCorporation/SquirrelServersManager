// server/src/infrastructure/plugins/store/schemas/plugin-store-config.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PluginStoreConfigDocument = PluginStoreConfig & Document;

@Schema({ timestamps: true, collection: 'plugin_store_config' })
export class PluginStoreConfig {
  // We can potentially add a unique identifier or constraint
  // to ensure only one config document exists, but managing that
  // in the service logic might be simpler.

  @Prop({ type: [String], default: [], required: true })
  customRepositories!: string[];
}

export const PluginStoreConfigSchema = SchemaFactory.createForClass(PluginStoreConfig);

// Optional: Ensure only one document can exist using a unique index on a constant field
// PluginStoreConfigSchema.index({ singleton: 1 }, { unique: true });
// If using this, add `@Prop({ type: Number, default: 1, required: true }) singleton: number;` to the class
