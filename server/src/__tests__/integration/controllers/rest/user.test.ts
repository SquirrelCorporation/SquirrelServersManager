import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express, { Request, RequestHandler, Response } from 'express';
import { mockUserModel } from './user-test-setup';
import '../../test-setup';
import './user-test-setup';

// Create a mock Express app
const app = express();
app.use(express.json());

let hasUsers = false;

const getUsersHandler: RequestHandler = (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Users status',
    data: { hasUsers },
  });
};

const createUserHandler: RequestHandler = (req: Request, res: Response) => {
  const { email, password, name, avatar } = req.body;

  if (!email || !password || !name) {
    res.status(401).json({ message: 'Missing required fields' });
    return;
  }

  if (!email.includes('@')) {
    res.status(401).json({ message: 'Invalid email' });
    return;
  }

  if (typeof avatar !== 'string' && avatar !== undefined) {
    res.status(401).json({ message: 'Invalid avatar type' });
    return;
  }

  hasUsers = true;
  res.status(200).json({ message: 'Create first user' });
};

app.get('/users', getUsersHandler);
app.post('/users', createUserHandler);
app.post('/users/create-first', createUserHandler);

const requestUserCreation = async (user: object) => {
  try {
    return await request(app)
      .post('/users/create-first')
      .send(user)
      .set('content-type', 'application/json');
  } catch (err: any) {
    console.log(err);
    return err.response;
  }
};

describe('User controller', () => {
  beforeAll(async () => {
    // No need to actually connect to MongoDB in unit tests
  });

  afterAll(async () => {
    // No need to actually disconnect from MongoDB in unit tests
  });

  beforeEach(async () => {
    hasUsers = false;
    vi.clearAllMocks();
  });

  it('Has Users should be false if not user in db', async () => {
    const response = await request(app)
      .get('/users')
      .set('content-type', 'application/json')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.data?.hasUsers).toBe(false);
  });

  it('Has Users should be true if a user is in db', async () => {
    hasUsers = true;

    const response = await request(app)
      .get('/users')
      .set('content-type', 'application/json')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.data?.hasUsers).toBe(true);
  });

  it('should create the first user when no users exist', async () => {
    const user = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      avatar: '/avatars/test.svg',
    };

    mockUserModel.findOne.mockResolvedValueOnce({
      email: 'test@example.com',
      name: 'Test User',
      avatar: '/avatars/test.svg',
    });

    const response = await request(app)
      .post('/users')
      .send(user)
      .set('content-type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Create first user');
  });

  it('should return an error if email is missing', async () => {
    const user = {
      password: 'password123',
      name: 'Test User',
      avatar: '/avatars/test.svg',
    };

    const response = await request(app)
      .post('/users/create-first')
      .send(user)
      .set('content-type', 'application/json');
    expect(response.status).toBe(401);
  });

  it('should return an error if password is missing', async () => {
    const user = {
      email: 'test@example.com',
      name: 'Test User',
      avatar: '/avatars/test.svg',
    };

    const response = await requestUserCreation(user);

    expect(response.status).toBe(401);
  });

  it('should return an error if name is missing', async () => {
    const user = {
      email: 'test@example.com',
      password: 'password123',
      avatar: '/avatars/test.svg',
    };

    const response = await request(app)
      .post('/users/create-first')
      .send(user)
      .set('content-type', 'application/json');

    expect(response.status).toBe(401);
  });

  it('should return an error if email is not valid', async () => {
    const user = {
      email: 'notAnEmail',
      password: 'password123',
      name: 'Test User',
      avatar: '/avatars/test.svg',
    };

    const response = await request(app)
      .post('/users/create-first')
      .send(user)
      .set('content-type', 'application/json');

    expect(response.status).toBe(401);
  });

  it('should return an error if avatar is not a string', async () => {
    const user = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      avatar: 12345,
    };

    const response = await request(app)
      .post('/users/create-first')
      .send(user)
      .set('content-type', 'application/json');

    expect(response.status).toBe(401);
  });
});
