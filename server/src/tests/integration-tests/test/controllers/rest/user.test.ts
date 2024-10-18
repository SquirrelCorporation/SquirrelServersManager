import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { UsersModel } from '../../../../../data/database/model/User'; // Adjust the path to your User model
import app from '../../server';

const requestUserCreation = async (user: object) => {
  try {
    return await request(app)
      .post('/users/create-first')
      .send(user)
      .set('content-type', 'application/json');
  } catch (err: any) {
    console.log(err);
    // The error message we need is inside `err.response`
    return err.response;
  }
};

describe('User controller', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env['MONGO_URI'] as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await mongoose.connection.db?.dropDatabase();
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
    // Add a user to the database
    const newUser = new UsersModel({
      name: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      avatar: 'test',
      role: 'admin',
    });
    await newUser.save();

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

    const response = await request(app)
      .post('/users')
      .send(user)
      .set('content-type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Create first user');

    // Verify that the user is actually created in the DB
    const createdUser = await UsersModel.findOne({ email: 'test@example.com' });
    expect(createdUser).not.toBeNull();
    expect(createdUser).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
      avatar: '/avatars/test.svg',
    });
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
      avatar: 12345, // Invalid type for avatar
    };

    const response = await request(app)
      .post('/users/create-first')
      .send(user)
      .set('content-type', 'application/json');

    expect(response.status).toBe(401);
  });
});
