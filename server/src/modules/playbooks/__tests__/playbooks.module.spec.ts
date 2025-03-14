import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaybooksModule } from '../playbooks.module';
import { PlaybookService } from '../application/services/playbook.service';
import { PlaybooksRegisterService } from '../application/services/playbooks-register.service';
import { PLAYBOOK_REPOSITORY } from '../domain/repositories/playbook-repository.interface';
import { PLAYBOOKS_REGISTER_REPOSITORY } from '../domain/repositories/playbooks-register-repository.interface';
import { PlaybooksRegisterEngineService } from '../application/services/engine/playbooks-register-engine.service';
import { PlaybookController } from '../presentation/controllers/playbook.controller';
import { PlaybooksRepositoryController } from '../presentation/controllers/playbooks-repository.controller';
import { closeInMongodConnection, rootMongooseTestModule } from '../../common-test-helpers';

describe('PlaybooksModule', () => {
  let playbooksModule: PlaybooksModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([]), // Mock schemas
        PlaybooksModule,
      ],
    })
      .overrideProvider(PLAYBOOK_REPOSITORY)
      .useValue({})
      .overrideProvider(PLAYBOOKS_REGISTER_REPOSITORY)
      .useValue({})
      .compile();

    playbooksModule = moduleRef.get<PlaybooksModule>(PlaybooksModule);
  });

  it('should be defined', () => {
    expect(playbooksModule).toBeDefined();
  });

  it('should provide PlaybookService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        PlaybooksModule,
      ],
    })
      .overrideProvider(PLAYBOOK_REPOSITORY)
      .useValue({})
      .overrideProvider(PLAYBOOKS_REGISTER_REPOSITORY)
      .useValue({})
      .compile();

    const service = moduleRef.get<PlaybookService>(PlaybookService, { strict: false });
    expect(service).toBeDefined();
  });

  it('should provide PlaybooksRegisterService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        PlaybooksModule,
      ],
    })
      .overrideProvider(PLAYBOOK_REPOSITORY)
      .useValue({})
      .overrideProvider(PLAYBOOKS_REGISTER_REPOSITORY)
      .useValue({})
      .compile();

    const service = moduleRef.get<PlaybooksRegisterService>(PlaybooksRegisterService, { strict: false });
    expect(service).toBeDefined();
  });

  it('should provide PlaybooksRegisterEngineService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        PlaybooksModule,
      ],
    })
      .overrideProvider(PLAYBOOK_REPOSITORY)
      .useValue({})
      .overrideProvider(PLAYBOOKS_REGISTER_REPOSITORY)
      .useValue({})
      .compile();

    const service = moduleRef.get<PlaybooksRegisterEngineService>(PlaybooksRegisterEngineService, { strict: false });
    expect(service).toBeDefined();
  });

  it('should provide PlaybookController', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        PlaybooksModule,
      ],
    })
      .overrideProvider(PLAYBOOK_REPOSITORY)
      .useValue({})
      .overrideProvider(PLAYBOOKS_REGISTER_REPOSITORY)
      .useValue({})
      .compile();

    const controller = moduleRef.get<PlaybookController>(PlaybookController, { strict: false });
    expect(controller).toBeDefined();
  });

  it('should provide PlaybooksRepositoryController', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        PlaybooksModule,
      ],
    })
      .overrideProvider(PLAYBOOK_REPOSITORY)
      .useValue({})
      .overrideProvider(PLAYBOOKS_REGISTER_REPOSITORY)
      .useValue({})
      .compile();

    const controller = moduleRef.get<PlaybooksRepositoryController>(PlaybooksRepositoryController, { strict: false });
    expect(controller).toBeDefined();
  });

  afterEach(async () => {
    await closeInMongodConnection();
  });
});