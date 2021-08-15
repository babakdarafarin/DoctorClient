import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ANIMALS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'shop',
          queueOptions: {
            durable: false
          },
        },
      },
      {
        name: 'COUNTRIES_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'shop',
          queueOptions: {
            durable: false
          },
        },
      }
    ]),
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
