import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { Playbooks } from 'src/types/typings';

export class EditPlaybookDto {
  @ApiProperty({ description: 'Playbook content' })
  @IsString()
  content!: string;
}

export class AddExtraVarDto {
  @ApiProperty({ description: 'Extra variable to add' })
  @IsObject()
  extraVar!: API.ExtraVar;
}

export class ExecutePlaybookDto {
  @ApiProperty({ description: 'Target devices', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  target?: string[];

  @ApiProperty({ description: 'Extra variables', required: false })
  @IsOptional()
  @IsObject()
  extraVars?: API.ExtraVars;

  @ApiProperty({
    description: 'Execution mode',
    required: false,
    enum: SsmAnsible.ExecutionMode,
  })
  @IsOptional()
  @IsEnum(SsmAnsible.ExecutionMode)
  mode?: SsmAnsible.ExecutionMode;
}

export class ExecutePlaybookOnInventoryDto {
  @ApiProperty({ description: 'Inventory targets', required: false })
  @IsOptional()
  @IsObject()
  inventoryTargets?: Playbooks.All & Playbooks.HostGroups;

  @ApiProperty({ description: 'Extra variables', required: false })
  @IsOptional()
  @IsObject()
  extraVars?: API.ExtraVars;

  @ApiProperty({ description: 'Execution UUID', required: false })
  @IsOptional()
  @IsString()
  execUuid?: string;
}

export class PlaybookExecutionResponseDto {
  @ApiProperty({ description: 'Execution ID' })
  execId!: string;
}

export class PlaybookLogsResponseDto {
  @ApiProperty({ description: 'Execution ID' })
  execId!: string;

  @ApiProperty({ description: 'Execution logs' })
  execLogs!: any;
}

export class PlaybookStatusResponseDto {
  @ApiProperty({ description: 'Execution ID' })
  execId!: string;

  @ApiProperty({ description: 'Execution statuses' })
  execStatuses!: any;
}

export class PlaybookActionResponseDto {
  @ApiProperty({ description: 'Success status' })
  success!: boolean;
}
