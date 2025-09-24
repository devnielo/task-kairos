import { createServer } from '@/infrastructure/http/server';
import { logger } from '@/shared/logger';

async function bootstrap(): Promise<void> {
  try {
    const { app, server } = await createServer();
    const address = server.address();
    if (address && typeof address === 'object') {
      logger.info(
        {
          port: address.port,
          address: address.address,
        },
        'HTTP server started',
      );
    } else {
      logger.info('HTTP server started');
    }

    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info({ signal }, 'Received shutdown signal');
        await app.close();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error({ error }, 'Failed to bootstrap application');
    process.exit(1);
  }
}

void bootstrap();
