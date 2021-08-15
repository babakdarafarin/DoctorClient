import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ClientService {
  constructor(
    @Inject('ANIMALS_SERVICE') private readonly client: ClientProxy
  ){

  }
  
  async getHello() {
    await this.client.emit('ANIMALS_CREATED', {data: ['rabbit']})    
  }
}
