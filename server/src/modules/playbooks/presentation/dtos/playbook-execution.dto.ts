import { ApiProperty } from '@nestjs/swagger';
import { API } from 'ssm-shared-lib';

export class PlaybookExecutionDto implements API.ExecId {
  @ApiProperty({
    description: 'The unique identifier for the execution',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  execId!: string;
}

export class PlaybookExecutionLogDto implements API.ExecLogs {
  @ApiProperty({
    description: 'The unique identifier for the execution',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  execId!: string;

  @ApiProperty({
    description: 'The logs for the execution',
    example: [
      {
        content: 'This is a test message',
        createdAt: new Date(),
        stdout: 'This is a test message',
        ident: '123e4567-e89b-12d3-a456-426614174001',
        logRunnerId: '123e4567-e89b-12d3-a456-426614174001',
      },
    ],
  })
  execLogs!: API.ExecLog[];
}

export class PlaybookExecutionStatusDto implements API.ExecStatuses {
  @ApiProperty({
    description: 'The unique identifier for the execution',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  execId!: string;

  @ApiProperty({
    description: 'The statuses for the execution',
    example: [
      {
        ident: '123e4567-e89b-12d3-a456-426614174001',
        status: 'success',
        createdAt: new Date(),
      },
    ],
  })
  execStatuses!: API.ExecStatus[];
}
