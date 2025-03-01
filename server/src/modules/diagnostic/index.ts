import { DiagnosticService } from './services/diagnostic.service';

// This is a compatibility layer for legacy code
let diagnosticService: DiagnosticService | null = null;

export function setDiagnosticService(service: DiagnosticService) {
  diagnosticService = service;
}

export default {
  run: async (device: any, deviceAuth: any) => {
    if (!diagnosticService) {
      throw new Error('DiagnosticService not initialized');
    }
    return diagnosticService.run(device, deviceAuth);
  },
};
