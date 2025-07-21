import { Injectable } from '@nestjs/common';
import { ServerLogEntity } from '../../domain/entities/server-log.entity';
import { ServerLogResponseDto } from '../dtos/server-log-response.dto';

@Injectable()
export class ServerLogPresentationMapper {
  toDto(entity: ServerLogEntity): ServerLogResponseDto {
    const dto = new ServerLogResponseDto();
    dto.level = entity.level;
    dto.time = entity.time;
    dto.pid = entity.pid;
    dto.hostname = entity.hostname;
    dto.msg = entity.msg;
    dto.req = entity.req;
    dto.res = entity.res;
    dto.err = entity.err;
    dto.context = entity.context;
    return dto;
  }
}
