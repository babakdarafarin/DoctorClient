import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ELKModule } from './elk.module'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ELKModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'rail',
      queueOptions: {
        durable: false
      },
    },
  });

  app.listen()
}
bootstrap();



