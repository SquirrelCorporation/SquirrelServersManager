import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Events from 'src/core/events/events';
import { NotificationRepository } from '../../../infrastructure/repositories/notification.repository';
import { NOTIFICATION } from '../../../infrastructure/schemas/notification.schema';

// Mock Logger
vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual('@nestjs/common');
  return {
    ...actual,
    Logger: vi.fn().mockImplementation(() => ({
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    })),
  };
});

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let mockModel: any;

  const mockNotification = {
    _id: 'test-id',
    message: 'Test notification',
    severity: 'info',
    event: Events.AUTOMATION_FAILED,
    module: 'Test',
    seen: false,
    createdAt: new Date(),
    toObject: vi.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    // Create separate spy functions for each exec
    const findExec = vi.fn().mockResolvedValue([mockNotification]);
    const countExec = vi.fn().mockResolvedValue(5);
    const updateExec = vi.fn().mockResolvedValue({ modifiedCount: 3 });

    // Create mock model with all necessary functions
    mockModel = {
      create: vi.fn().mockResolvedValue(mockNotification),
      find: vi.fn().mockReturnThis(),
      countDocuments: vi.fn().mockReturnThis(),
      updateMany: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
    };

    // Define the exec method for different chains
    const sortFn = vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: findExec,
        }),
      }),
    });

    const leanFindFn = vi.fn().mockReturnValue({
      exec: findExec,
    });

    const limitFn = vi.fn().mockReturnValue({
      lean: leanFindFn,
    });

    const leanCountFn = vi.fn().mockReturnValue({
      exec: countExec,
    });

    const leanUpdateFn = vi.fn().mockReturnValue({
      exec: updateExec,
    });

    mockModel.find = vi.fn().mockReturnValue({
      sort: sortFn,
    });

    mockModel.countDocuments = vi.fn().mockReturnValue({
      lean: leanCountFn,
    });

    mockModel.updateMany = vi.fn().mockReturnValue({
      lean: leanUpdateFn,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        {
          provide: getModelToken(NOTIFICATION),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<NotificationRepository>(NotificationRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification and return the created object', async () => {
      const newNotification = {
        message: 'New notification',
        severity: 'info',
        event: Events.AUTOMATION_FAILED,
        module: 'Test',
      };

      const result = await repository.create(newNotification);

      expect(mockModel.create).toHaveBeenCalledWith(newNotification);
      expect(mockNotification.toObject).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });

    it('should log the notification creation', async () => {
      const newNotification = {
        message: 'New notification',
        severity: 'info',
        event: Events.AUTOMATION_FAILED,
        module: 'Test',
      };

      // Spy on logger
      const logSpy = vi.spyOn((repository as any).logger, 'log');

      await repository.create(newNotification);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Creating notification - (event: ${newNotification.event})`),
      );
    });
  });

  describe('findAllNotSeen', () => {
    it('should return all unseen notifications', async () => {
      const result = await repository.findAllNotSeen();

      expect(mockModel.find).toHaveBeenCalledWith({ seen: false });
      expect(result).toEqual([mockNotification]);
    });
  });

  describe('countAllNotSeen', () => {
    it('should return the count of unseen notifications', async () => {
      const result = await repository.countAllNotSeen();

      expect(mockModel.countDocuments).toHaveBeenCalledWith({ seen: false });
      expect(result).toBe(5);
    });
  });

  describe('markAllSeen', () => {
    it('should mark all unseen notifications as seen', async () => {
      await repository.markAllSeen();

      expect(mockModel.updateMany).toHaveBeenCalledWith({ seen: false }, { seen: true });
    });
  });
});
