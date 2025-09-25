import path from 'node:path';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.1.0',
  info: {
    title: 'Image Processing API',
    version: '1.0.0',
    description:
      'API REST for managing image processing tasks and querying their status and pricing.',
  },
  servers: [
    {
      url: '/',
      description: 'Current host',
    },
  ],
};

const apis = [path.join(__dirname, '..', '..', 'infrastructure', '**', '*.ts')];

export const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis,
});
