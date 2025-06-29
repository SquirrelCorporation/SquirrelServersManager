import { beforeEach, describe, expect, it } from 'vitest';
import { SsmDeviceDiagnostic } from 'ssm-shared-lib';
import { DiagnosticReport, DiagnosticResult } from '../../../domain/entities/diagnostic.entity';
import { DiagnosticMapper } from '../../../presentation/mappers/diagnostic.mapper';
import {
  DiagnosticReportDto,
  DiagnosticResultDto,
} from '../../../presentation/dtos/diagnostic.dto';

describe('DiagnosticMapper', () => {
  let mapper: DiagnosticMapper;
  let mockReport: DiagnosticReport;
  let mockReportDto: DiagnosticReportDto;

  beforeEach(() => {
    mapper = new DiagnosticMapper();

    // Create a mock diagnostic result
    const mockResult: DiagnosticResult = {
      success: true,
      severity: 'success',
      message: 'Test message',
      data: { test: 'data' },
    };

    // Create a mock diagnostic report
    mockReport = {
      deviceId: 'test-device-id',
      timestamp: new Date('2023-01-01T00:00:00Z'),
      results: {
        [SsmDeviceDiagnostic.Checks.SSH_CONNECT]: mockResult,
      } as Record<SsmDeviceDiagnostic.Checks, DiagnosticResult>,
    };

    // Create a mock diagnostic result DTO
    const mockResultDto = new DiagnosticResultDto();
    mockResultDto.success = true;
    mockResultDto.severity = 'success';
    mockResultDto.message = 'Test message';
    mockResultDto.data = { test: 'data' };

    // Create a mock diagnostic report DTO
    mockReportDto = new DiagnosticReportDto();
    mockReportDto.deviceId = 'test-device-id';
    mockReportDto.timestamp = new Date('2023-01-01T00:00:00Z');
    mockReportDto.results = {
      [SsmDeviceDiagnostic.Checks.SSH_CONNECT]: mockResultDto,
    } as Record<SsmDeviceDiagnostic.Checks, DiagnosticResultDto>;
  });

  describe('toDto', () => {
    it('should convert a domain entity to a DTO', () => {
      const dto = mapper.toDto(mockReport);

      expect(dto).toBeInstanceOf(DiagnosticReportDto);
      expect(dto.deviceId).toBe(mockReport.deviceId);
      expect(dto.timestamp).toEqual(mockReport.timestamp);

      const resultKey = Object.keys(mockReport.results)[0];
      expect(dto.results[resultKey]).toBeDefined();
      expect(dto.results[resultKey].success).toBe(mockReport.results[resultKey].success);
      expect(dto.results[resultKey].severity).toBe(mockReport.results[resultKey].severity);
      expect(dto.results[resultKey].message).toBe(mockReport.results[resultKey].message);
      expect(dto.results[resultKey].data).toEqual(mockReport.results[resultKey].data);
    });
  });

  describe('toEntity', () => {
    it('should convert a DTO to a domain entity', () => {
      const entity = mapper.toEntity(mockReportDto);

      expect(entity.deviceId).toBe(mockReportDto.deviceId);
      expect(entity.timestamp).toEqual(mockReportDto.timestamp);

      const resultKey = Object.keys(mockReportDto.results)[0];
      expect(entity.results[resultKey]).toBeDefined();
      expect(entity.results[resultKey].success).toBe(mockReportDto.results[resultKey].success);
      expect(entity.results[resultKey].severity).toBe(mockReportDto.results[resultKey].severity);
      expect(entity.results[resultKey].message).toBe(mockReportDto.results[resultKey].message);
      expect(entity.results[resultKey].data).toEqual(mockReportDto.results[resultKey].data);
    });
  });
});
