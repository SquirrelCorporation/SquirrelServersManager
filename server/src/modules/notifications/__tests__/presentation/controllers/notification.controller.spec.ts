import { beforeEach, describe, expect, it, vi } from 'vitest';
import Events from '../../../../../core/events/events';
import { NotificationController } from '../../../presentation/controllers/notification.controller';
import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationService } from '../../../application/services/notification.service';

// Mock Logger
vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual('@nestjs/common');
  return {
    ...actual,
    Logger: vi.fn().mockImplementation(() => ({
      log: vi.fn(),
      error: vi.fn(),
    })),
  };
});

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  const mockNotifications: Notification[] = [
    {
      message: 'Test message',
      severity: 'info',
      event: Events.AUTOMATION_FAILED,
      module: 'Test',
      seen: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    service = {
      findAllNotSeen: vi.fn().mockResolvedValue(mockNotifications),
      countAllNotSeen: vi.fn().mockResolvedValue(5),
      markAllSeen: vi.fn().mockResolvedValue(undefined),
    } as unknown as NotificationService;

    controller = new NotificationController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllNotSeen', () => {
    it('should return all unseen notifications', async () => {
      const result = await controller.findAllNotSeen();

      expect(service.findAllNotSeen).toHaveBeenCalled();
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('countAllNotSeen', () => {
    it('should return the count of unseen notifications', async () => {
      const result = await controller.countAllNotSeen();

      expect(service.countAllNotSeen).toHaveBeenCalled();
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAllSeen', () => {
    it('should mark all notifications as seen', async () => {
      await controller.markAllSeen();

      expect(service.markAllSeen).toHaveBeenCalled();
    });
  });
});
