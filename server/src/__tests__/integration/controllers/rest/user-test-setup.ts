import { vi } from 'vitest';

// Mock UserModel for tests
export const mockUserModel = {
  findOne: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue({
    _id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatar: '/avatars/test.svg',
  }),
  save: vi.fn().mockResolvedValue(true),
  exec: vi.fn().mockResolvedValue(null),
};

// Mock mongoose model
vi.mock('mongoose', () => {
  return {
    model: vi.fn().mockReturnValue(mockUserModel),
  };
});

// Make the mock available globally
(global as any).mockUserModel = mockUserModel;
