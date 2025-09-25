import 'dotenv/config';

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000/api';
const ORIGINAL_PATH = process.env.SAMPLE_IMAGE_PATH ?? '/input/example.jpg';
const MAX_ATTEMPTS = Number(process.env.SAMPLE_TASK_MAX_ATTEMPTS ?? 20);
const POLL_INTERVAL_MS = Number(process.env.SAMPLE_TASK_POLL_INTERVAL_MS ?? 2000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  console.info(`📤 Creating task with originalPath ${ORIGINAL_PATH}`);

  const createResponse = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalPath: ORIGINAL_PATH }),
  });

  if (!createResponse.ok) {
    const body = await createResponse.text();
    throw new Error(`Failed to create task (${createResponse.status}): ${body}`);
  }

  const { taskId, status, price } = await createResponse.json();
  console.info(`Task created: ${taskId} (status=${status}, price=${price})`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    await sleep(POLL_INTERVAL_MS);

    const getResponse = await fetch(`${BASE_URL}/tasks/${taskId}`);
    if (!getResponse.ok) {
      const body = await getResponse.text();
      throw new Error(`Failed to retrieve task (${getResponse.status}): ${body}`);
    }

    const task = await getResponse.json();
    console.info(` Attempt ${attempt} -> status=${task.status}`);

    if (task.status === 'completed') {
      console.info(`Task completed! Variants (${task.images.length}):`);
      task.images.forEach((image) => {
        console.info(`resolution=${image.resolution}, path=${image.path}, format=${image.format}`);
      });
      return task;
    }

    if (task.status === 'failed') {
      console.error(`Task failed: ${task.error ?? 'Unknown error'}`);
      return task;
    }
  }

  console.warn('Reached max attempts without completion. Task may still be processing.');
  return null;
};

run().catch((error) => {
  console.error('Unexpected error:', error);
  process.exitCode = 1;
});
