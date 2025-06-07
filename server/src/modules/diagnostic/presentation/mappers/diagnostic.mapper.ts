import { Injectable } from '@nestjs/common';
import { DiagnosticReport, DiagnosticResult } from '../../domain/entities/diagnostic.entity';
import { DiagnosticReportDto, DiagnosticResultDto } from '../dtos/diagnostic.dto';

@Injectable()
export class DiagnosticMapper {
  toDto(entity: DiagnosticReport): DiagnosticReportDto {
    const dto = new DiagnosticReportDto();
    dto.deviceId = entity.deviceId;
    dto.timestamp = entity.timestamp;
    dto.results = {} as any;

    // Map each result
    Object.entries(entity.results).forEach(([key, value]) => {
      const resultDto = new DiagnosticResultDto();
      resultDto.success = value.success;
      resultDto.severity = value.severity;
      resultDto.message = value.message;
      resultDto.data = value.data;

      dto.results[key as keyof typeof dto.results] = resultDto;
    });

    return dto;
  }

  toEntity(dto: DiagnosticReportDto): DiagnosticReport {
    const entity: DiagnosticReport = {
      deviceId: dto.deviceId,
      timestamp: dto.timestamp,
      results: {} as Record<any, DiagnosticResult>,
    };

    // Map each result
    Object.entries(dto.results).forEach(([key, value]) => {
      entity.results[key] = {
        success: value.success,
        severity: value.severity,
        message: value.message,
        data: value.data,
      };
    });

    return entity;
  }
}
