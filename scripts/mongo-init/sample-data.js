const dbName =
  (typeof _getEnv === 'function' && _getEnv('MONGO_DB')) ||
  (typeof process !== 'undefined' && process.env.MONGO_DB) ||
  'image_processing';

db = db.getSiblingDB(dbName);

db.createCollection('tasks');
db.createCollection('images');

db.tasks.createIndex({ status: 1, updatedAt: -1 });
db.tasks.createIndex({ originalPath: 1 });
db.images.createIndex({ taskId: 1, resolution: 1 }, { unique: true });
db.images.createIndex({ hash: 1 });

const now = new Date();
const inserted = db.tasks.insertOne({
  originalPath: '/input/sample-image.jpg',
  status: 'completed',
  price: 23.4,
  error: null,
  images: [
    {
      resolution: 1024,
      path: '/output/sample-image/1024/abc123def456.jpg',
      hash: 'abc123def456',
      format: 'jpeg',
    },
    {
      resolution: 800,
      path: '/output/sample-image/800/def456abc123.jpg',
      hash: 'def456abc123',
      format: 'jpeg',
    },
  ],
  createdAt: now,
  updatedAt: now,
});

db.images.insertMany([
  {
    taskId: inserted.insertedId,
    resolution: 1024,
    path: '/output/sample-image/1024/abc123def456.jpg',
    hash: 'abc123def456',
    format: 'jpeg',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: inserted.insertedId,
    resolution: 800,
    path: '/output/sample-image/800/def456abc123.jpg',
    hash: 'def456abc123',
    format: 'jpeg',
    createdAt: now,
    updatedAt: now,
  },
]);
