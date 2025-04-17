import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { ApiStandardResponse } from '../../../../infrastructure/decorators/api-standard-response.decorator';
import { Notification } from '../../domain/entities/notification.entity';

export const NOTIFICATIONS_TAG = 'Notifications';

export class NotificationsCountDto {
  @ApiProperty({ example: 5, description: 'Number of unseen notifications' })
  count: number = 0;
}

export function GetNotificationsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all unseen notifications',
      description: 'Retrieves a list of all notifications that have not been marked as seen.',
    }),
    ApiStandardResponse(Array<Notification>, 'List of unseen notifications retrieved successfully'),
  );
}

export function GetNotificationsCountDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get count of unseen notifications',
      description: 'Returns the total number of notifications that have not been marked as seen.',
    }),
    ApiStandardResponse(Object, 'Count of unseen notifications retrieved successfully'),
  );
}

export function MarkNotificationsSeenDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Mark all notifications as seen',
      description: 'Updates all unseen notifications to mark them as seen.',
    }),
    ApiStandardResponse(Object, 'All notifications marked as seen successfully'),
  );
}
