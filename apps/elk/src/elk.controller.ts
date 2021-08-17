import { Controller, Response } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ELKService } from './elk.service';
import { ProfileDto } from './Dtos/profile.dto';
import { SearchDto } from './Dtos/search.dto';

@Controller()
export class ElkController {
  constructor(private readonly elkService: ELKService) {}

  @EventPattern('CREATE_DOCTOR_INDEX')
  async CreateDoctorIndex(){

    return await this.elkService.CreateDoctorIndex()
  }
  
  @EventPattern('BULK_CREATE_DOCTOR_PROFILES')
  async BulkCreateDoctorProfiles(@Payload() profiles: ProfileDto[]){

    await this.elkService.BulkCreateDoctorProfiles(profiles)
  }

  @EventPattern('BULK_UPDATE_DOCTOR_PROFILES')
  async BulkUpdateDoctorProfiles(@Payload() profiles: ProfileDto[]){

    return await this.elkService.BulkUpdateDoctorProfiles(profiles)
  }

  @EventPattern('SEARCH_DATA')
  async SearchData(@Payload() searchModel: SearchDto){

    return await this.elkService.SearchData(searchModel.index, searchModel.q, searchModel.from, searchModel.size)
  }

  @EventPattern('DELETE_INDEX')
  async DeleteIndex(@Payload() index: string){

    await this.elkService.DeleteIndex(index)
  }

  @EventPattern('BULK_DELETE_DOCTOR_PROFILES')
  async BulkDeleteDoctorProfiles(@Payload() idLists: number[]){

    return await this.elkService.BulkDeleteDoctorProfiles(idLists)
  } 
}