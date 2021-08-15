import { Controller, Post, Put, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorDto } from './Dto/doctor.dto';

@Controller('doctor')
export class DoctorController {
    constructor(
        private readonly doctorService: DoctorService,
    ) {}

    @Post()
    async bulkProfileInsert(
        @Body('profiles') profiles : DoctorDto[])
        {
            return await this.doctorService.BulkProfileInsert(profiles)
        }

    @Post('bulkdelete')
    async bulkDelete(
    @Body('ids') ids : number[])
    {
        return await this.doctorService.BulkDeleteDoctors(ids)
    }

    @Put('bulkupdate')
    async bulkUpdate(
        @Body('profiles') profiles : DoctorDto[])
        {
            return await this.doctorService.BulkUpdateIndex(profiles)
        }

    @Get('createdoctorindex')
    async createDoctorIndex()
    {
      return await this.doctorService.CreateDoctorIndex()
    }    

    @Get()
    async search(
        @Query('i') i: string,
        @Query('q') q: string,
        @Query('from') from?: number, 
        @Query('size') size?: number) 
        {
            return await this.doctorService.SearchIndexPaged(i, q, from | 0, size | 1000);
        }

    @Delete(':index')
    async deleteByIndex(@Param('index') index: string) {

      return await this.doctorService.DeleteIndex(index);
    }
}
