import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiStandardResponse } from '@infrastructure/decorators/api-standard-response.decorator';
import {
  PlaybookExecutionDto,
  PlaybookExecutionLogDto,
  PlaybookExecutionStatusDto,
} from '@modules/playbooks/presentation/dtos/playbook-execution.dto';
import { PlaybookDto } from '../dtos/playbook.dto';
import { PlaybookExtraVarDto } from '../dtos/playbook-extra-var.dto';

export const PLAYBOOKS_TAG = 'Playbooks';

export const GetPlaybooksDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all playbooks' }),
    ApiStandardResponse(PlaybookDto, 'List of all playbooks with their active repositories'),
  );

export const GetPlaybookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a playbook by id' }),
    ApiStandardResponse(PlaybookDto, 'Playbook details'),
  );

export const EditPlaybookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Edit a playbook' }),
    ApiStandardResponse(PlaybookDto, 'Playbook updated successfully'),
  );

export const DeletePlaybookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a playbook' }),
    ApiStandardResponse(undefined, 'Playbook deleted successfully'),
  );

export const AddExtraVarToPlaybookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Add an extra var to a playbook' }),
    ApiStandardResponse(PlaybookExtraVarDto, 'Extra var added successfully'),
  );

export const DeleteExtraVarFromPlaybookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete an extra var from a playbook' }),
    ApiStandardResponse(undefined, 'Extra var deleted successfully'),
  );

export const ExecPlaybookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Execute a playbook' }),
    ApiStandardResponse(PlaybookExecutionDto, 'Playbook execution started'),
  );

export const ExecPlaybookByQuickRefDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Execute a playbook by quick reference' }),
    ApiStandardResponse(PlaybookExecutionDto, 'Playbook execution started'),
  );

export const ExecPlaybookOnInventoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Execute a playbook on an inventory' }),
    ApiStandardResponse(PlaybookExecutionDto, 'Playbook execution started'),
  );

export const GetExecLogsDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get execution logs' }),
    ApiStandardResponse(PlaybookExecutionLogDto, 'Execution logs retrieved successfully'),
  );

export const GetExecStatusDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get execution status' }),
    ApiStandardResponse(PlaybookExecutionStatusDto, 'Execution status retrieved successfully'),
  );
