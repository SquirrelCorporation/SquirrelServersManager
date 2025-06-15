import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

/**
 * Creates and initializes a NestJS application for testing
 * @returns Object containing the NestJS application and module reference
 */
export async function createTestingApp() {
  // Create the testing module with the AppModule
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  // Create and initialize the application
  const app: INestApplication = moduleRef.createNestApplication();
  await app.init();

  return { app, moduleRef };
}

/**
 * Creates a supertest instance for the given NestJS application
 * @param app NestJS application instance
 * @returns Supertest request object configured for the application
 */
export function getTestingRequest(app: INestApplication) {
  return request(app.getHttpServer());
}

/**
 * Closes the NestJS application and its dependencies
 * @param app NestJS application instance
 * @param moduleRef TestingModule reference
 */
export async function closeTestingApp(app: INestApplication, moduleRef: TestingModule) {
  if (app) {
    await app.close();
  }
  if (moduleRef) {
    await moduleRef.close();
  }
}
