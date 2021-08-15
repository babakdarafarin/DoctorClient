import { Inject, Injectable } from '@nestjs/common';
//import { Model } from 'mongoose'
//import { InjectModel } from "@nestjs/mongoose";
//import { ELKService } from '../ELK/ELK.service';
import { DoctorDto } from './Dto/doctor.dto';
//import { Doctor } from 'src/models/doctor.model';
//import { RedisService } from '../redis/redis.service';
import { ProfileDto } from './Dto/profile.dto';
import { ClientProxy } from '@nestjs/microservices';
import { SearchDto } from './Dto/search.dto';
import { promisify } from 'util';

@Injectable()
export class DoctorService {

    constructor(
        // private readonly elkService : ELKService,
        // private readonly redisService : RedisService,
        //@InjectModel('Doctor') private readonly doctorModel: Model<Doctor>
        @Inject('ELK_SERVICE') private readonly client: ClientProxy
        ){}

    async BulkProfileInsert(profiles: DoctorDto[]) {

        //elk another method
        // const ELKdata = [] as IndexedData[]
        // let tempELKObj = {} as IndexedData
        
        // tempELKObj = {
        //     data : profiles.map((profile) => ({
        //         'id' : profile.id, 
        //         'firstname' : profile.firstname,
        //         'lastname'  : profile.lastname,
        //         'about'     : profile.about
        //     })), 
        //     index : 'doctors', 
        //     type : 'ToBeFilled'} as IndexedData
        
        // ELKdata.push(tempELKObj)

        // tempELKObj = {
        //     data : profiles.map((profile) => ({'id' : profile.id, 'professions' : profile.professions})), 
        //     index : 'professions', 
        //     type : 'ToBeFilled'} as IndexedData
        
        // ELKdata.push(tempELKObj)

        // tempELKObj = {
        //     data : profiles.map((profile) => ({'id' : profile.id, 'about' : profile.about})), 
        //     index : 'abouts', 
        //     type : 'ToBeFilled'} as IndexedData
        
        // ELKdata.push(tempELKObj)

        // await this.elkService.bulkInsert(ELKdata)

        //elk
        const tempELKData = [] as ProfileDto[]
        
        profiles.map((profile) => {

            let tempProfile = {} as ProfileDto
            
            tempProfile.id = profile.id
            tempProfile.firstname = profile.firstname
            tempProfile.lastname = profile.lastname
            tempProfile.about = profile.about

            tempELKData.push(tempProfile)
        })

        await this.client.emit('INDEX_DOCTOR', tempELKData)    

        // await this.elkService.createDoctorIndex()
        // await this.elkService.bulkInsertDoctors(tempELKData)

        //mongo
        // const mongoData = [] as Doctor[]        
        // profiles.forEach((profile) => {
        //     mongoData.push(new this.doctorModel({
        //         id : profile.id,
        //         gender : profile.gender,
        //         visit: profile.visit,
        //         language : profile.language,
        //         createdAt: new Date()
        //     }))
        // })
        // this.doctorModel.insertMany(mongoData)

        return true

        }

    async SearchIndexPaged(index : string, q: string, from?: number, size?: number) {
      
      const searchModel = {} as SearchDto

      searchModel.index = index
      searchModel.q = q
      searchModel.from = from 
      searchModel.size = size

      // let res = [] as any[]
      // const m = await this.client.send('INDEX_SEARCH', searchModel)
      // .subscribe(result => {
      //   //console.log('fdsa')
        
      //   res.push(result)
      //   return res
      // });

      return await this.client.send('INDEX_SEARCH', searchModel).toPromise()
      
    }

    async CreateDoctorIndex(){
      await this.client.emit('INDEX_CREATE_DOCTOR', {})    
    }

    async BulkDeleteDoctors(ids : number[]){
      await this.client.emit('BULK_DELETE_DOCTOR', ids)    
    }

    async DeleteIndex(index : string){
      await this.client.emit('INDEX_DELETE', index)    
    }

    async BulkUpdateIndex(profiles : DoctorDto[]){
      await this.client.emit('BULK_UPDATE_DOCTOR', profiles)    
    }
}



