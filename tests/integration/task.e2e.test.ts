import request from 'supertest';

import { createApp } from '../../src/infrastructure/http/app';
import { TaskModel } from '../../src/infrastructure/database/models/task.model';
import { clearMongoCollections, startMongoMemory, stopMongoMemory } from '../utils/mongo-in-memory';

describe('Task API integration', () => {
  beforeAll(async () => {
    await startMongoMemory();
  });

  afterEach(async () => {
    await clearMongoCollections();
  });

  afterAll(async () => {
    await stopMongoMemory();
  });

  it('creates a task and retrieves it by id', async () => {
    const app = createApp();

    const createResponse = await request(app)
      .post('/api/tasks')
      .send({ originalPath: '/input/example.jpg' })
      .expect(201);

    expect(createResponse.body).toEqual(
      expect.objectContaining({
        taskId: expect.any(String),
        status: 'pending',
        price: expect.any(Number),
      }),
    );

    const storedTask = await TaskModel.findById(createResponse.body.taskId).lean();
    expect(storedTask).not.toBeNull();
    expect(storedTask?.status).toBe('pending');

    const getResponse = await request(app)
      .get(`/api/tasks/${createResponse.body.taskId}`)
      .expect(200);

    expect(getResponse.body).toEqual(
      expect.objectContaining({
        taskId: createResponse.body.taskId,
        status: 'pending',
        originalPath: '/input/example.jpg',
        price: createResponse.body.price,
        images: [],
      }),
    );
  });
});
