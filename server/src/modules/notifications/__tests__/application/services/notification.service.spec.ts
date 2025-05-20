import { beforeEach, describe, expect, it, vi } from 'vitest';
import Events from '../../../../../core/events/events';
import { NotificationService } from '../../../application/services/notification.service';
import { INotificationRepository } from '../../../domain/repositories/notification-repository.interface';

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

const mockNotification = {
  message: 'Test message',
  severity: 'info' as const,
  event: Events.AUTOMATION_FAILED,
  module: 'Test',
  seen: false,
};

describe('NotificationService', () => {
  let service: NotificationService;
  let mockRepository: INotificationRepository;
  let mockEventEmitter: any;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn().mockResolvedValue(mockNotification),
      findAllNotSeen: vi.fn().mockResolvedValue([mockNotification]),
      countAllNotSeen: vi.fn().mockResolvedValue(1),
      markAllSeen: vi.fn().mockResolvedValue(undefined),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    service = new NotificationService(mockRepository, mockEventEmitter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification and emit an event', async () => {
      const result = await service.create(mockNotification);

      expect(mockRepository.create).toHaveBeenCalledWith(mockNotification);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        Events.UPDATED_NOTIFICATIONS,
        'Updated Notification',
      );
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findAllNotSeen', () => {
    it('should return all unseen notifications', async () => {
      const result = await service.findAllNotSeen();

      expect(mockRepository.findAllNotSeen).toHaveBeenCalled();
      expect(result).toEqual([mockNotification]);
    });
  });

  describe('countAllNotSeen', () => {
    it('should return the count of unseen notifications', async () => {
      const result = await service.countAllNotSeen();

      expect(mockRepository.countAllNotSeen).toHaveBeenCalled();
      expect(result).toEqual(1);
    });
  });

  describe('markAllSeen', () => {
    it('should mark all notifications as seen and emit an event', async () => {
      await service.markAllSeen();

      expect(mockRepository.markAllSeen).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        Events.UPDATED_NOTIFICATIONS,
        'Updated Notification',
      );
    });
  });
});
