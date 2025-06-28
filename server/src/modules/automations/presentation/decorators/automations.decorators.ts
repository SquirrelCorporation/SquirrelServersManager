import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Automation } from '../../domain/entities/automation.entity';

export const AUTOMATIONS_TAG = 'Automations';

export const AutomationsControllerDocs = () => applyDecorators(ApiTags(AUTOMATIONS_TAG));

export const GetAllAutomationsDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all automations' }),
    ApiResponse({
      status: 200,
      description: 'List of all automations',
      type: [Automation],
    }),
  );

export const GetAutomationTemplateDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get automation template by ID' }),
    ApiParam({
      name: 'templateId',
      description: 'ID of the automation template',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Automation template',
      type: Object,
    }),
  );

export const GetAutomationDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get automation by UUID' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the automation',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Automation details',
      type: Automation,
    }),
    ApiResponse({
      status: 404,
      description: 'Automation not found',
    }),
  );

export const CreateAutomationDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new automation' }),
    ApiParam({
      name: 'name',
      description: 'Name of the automation',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Automation created successfully',
      type: Automation,
    }),
  );

export const UpdateAutomationDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update an existing automation' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the automation to update',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Automation updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Automation not found',
    }),
  );

export const ExecuteAutomationDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Execute an automation' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the automation to execute',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Automation executed successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Automation not found',
    }),
  );

export const DeleteAutomationDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete an automation' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the automation to delete',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Automation deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Automation not found',
    }),
  );
