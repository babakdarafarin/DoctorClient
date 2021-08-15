import { Controller, Post, Get, Delete, Param } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext, Transport } from '@nestjs/microservices';
import { ELKService } from './elk.service';
import { ProfileDto } from './Dtos/profile.dto';
import { SearchDto } from './Dtos/search.dto';

@Controller()
export class ElkController {
  constructor(private readonly elkService: ELKService) {}

  @Get()
  getHello() {
    //return this.elkService.getHello();
  }
  
  @EventPattern('INDEX_DOCTOR')
  async indexDoctors(@Payload() profiles: ProfileDto[]){ //@Ctx() context: RmqContext) {

    await this.elkService.bulkInsertDoctors(profiles)
  }

  @EventPattern('INDEX_DELETE')
  async deleteIndex(@Payload() index: string){ //@Ctx() context: RmqContext) {

    await this.elkService.deleteIndex(index)
  }

  @EventPattern('INDEX_CREATE_DOCTOR')
  async asynccreateDoctorIndex(){ //@Ctx() context: RmqContext) {

    await this.elkService.createDoctorIndex()
  }

  @EventPattern('INDEX_SEARCH')
  async searchIndex(@Payload() searchModel: SearchDto){ //@Ctx() context: RmqContext) {

    return await this.elkService.searchIndexPaged(searchModel.index, searchModel.q, searchModel.from, searchModel.size)
  }

  @EventPattern('BULK_DELETE_DOCTOR')
  async deleteRecords(@Payload() idLists: number[]){ //@Ctx() context: RmqContext) {

    return await this.elkService.deleteBulkDeleteDoctors(idLists)
  }

  @EventPattern('BULK_UPDATE_DOCTOR')
  async updateRecords(@Payload() profiles: ProfileDto[]){ //@Ctx() context: RmqContext) {

    return await this.elkService.updateBulkRecords(profiles)
  }

  updateBulkRecords
}