import { Module } from '@nestjs/common';
// import { MongooseModule } from "@nestjs/mongoose";
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
// import { ELKModule } from '../ELK/ELK.module';
// import { DoctorSchema } from 'src/models/doctor.model';
// import { RedisModule } from '../redis/redis.module';

@Module({
  // imports: [MongooseModule.forFeature([{name: 'Doctor', schema: DoctorSchema}], 'MainClient'),
  //           ELKModule,
  //           RedisModule],
  imports: [
    ClientsModule.register([
      {
        name: 'ELK_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'rail',
          queueOptions: {
            durable: false
          },
        },
      }
    ]),
  ],
  providers: [DoctorService],
  controllers: [DoctorController]
})
export class DoctorModule {}
