import { beforeEach, describe, expect, it, vi } from 'vitest';
import Events from '../../../../core/events/events';
import { NotificationService } from '../../services/notification.service';

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
  let mockModel: any;
  let mockEventEmitter: any;

  beforeEach(() => {
    mockModel = {
      create: vi.fn().mockResolvedValue({
        ...mockNotification,
        toObject: () => mockNotification,
      }),
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([mockNotification]),
      }),
      countDocuments: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(1),
      }),
      updateMany: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(null),
      }),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    service = new NotificationService(mockModel, mockEventEmitter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification and emit an event', async () => {
      const result = await service.create(mockNotification);

      expect(mockModel.create).toHaveBeenCalledWith(mockNotification);
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

      expect(mockModel.find).toHaveBeenCalledWith({ seen: false });
      expect(result).toEqual([mockNotification]);
    });
  });

  describe('countAllNotSeen', () => {
    it('should return the count of unseen notifications', async () => {
      const result = await service.countAllNotSeen();

      expect(mockModel.countDocuments).toHaveBeenCalledWith({ seen: false });
      expect(result).toEqual(1);
    });
  });

  describe('markAllSeen', () => {
    it('should mark all notifications as seen and emit an event', async () => {
      await service.markAllSeen();

      expect(mockModel.updateMany).toHaveBeenCalledWith({ seen: false }, { seen: true });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        Events.UPDATED_NOTIFICATIONS,
        'Updated Notification',
      );
    });
  });
});
