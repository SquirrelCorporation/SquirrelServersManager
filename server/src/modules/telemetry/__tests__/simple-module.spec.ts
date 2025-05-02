import { describe, it, expect } from 'vitest';
import { TelemetryModule } from '../telemetry.module';
import { TelemetryService } from '../telemetry.service';

describe('TelemetryModule', () => {
  it('should have TelemetryService as a provider', () => {
    const providers = Reflect.getMetadata('providers', TelemetryModule);
    expect(providers).toContain(TelemetryService);
  });

  it('should export TelemetryService', () => {
    const exports = Reflect.getMetadata('exports', TelemetryModule);
    expect(exports).toContain(TelemetryService);
  });
});