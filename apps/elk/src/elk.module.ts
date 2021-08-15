import { Module } from '@nestjs/common';
import { ElkController } from './elk.controller';
import { ELKService } from './elk.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch'

@Module({
  imports: [
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    })],
  providers: [ELKService],
  exports: [ELKService],
  controllers: [ElkController]
})
export class ELKModule {}
