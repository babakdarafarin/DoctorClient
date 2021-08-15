import { Injectable, NotFoundException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ProfileDto } from './Dtos/profile.dto';

@Injectable()
export class ELKService {
    constructor(
        private readonly elasticsearchService: ElasticsearchService
      ) {
            this.elasticsearchService.ping({},{requestTimeout: 3000})
            .then((res) => {console.log('es connected!')})
            .catch((err) => {throw new Error(err)})
      }

    async createDoctorIndex(){
        return await this.elasticsearchService.indices.create({
            index: 'doctors',
            body: {
                "settings": {
                    "analysis": {
                        "filter": {
                            "autocomplete_filter": {                                
                                "type": "edge_ngram",
                                "min_gram": 3,
                                "max_gram": 20
                            }
                        },
                        "analyzer": {
                            "autocomplete": {
                                "type": "custom",
                                "tokenizer": "standard",
                                "filter":[
                                    "lowercase", "autocomplete_filter"
                                ]
                            }
                        },
                    }
                },
                "mappings":{
                    "properties":{
                        "id": {
                            "type":"text",
                            "search_analyzer":"standard"
                        },
                        "firstname": {
                            "type":"text",
                            "analyzer":"autocomplete", 
                            "search_analyzer":"standard"
                        },
                        "lastname": {
                        "type":"text",
                        "analyzer":"autocomplete", 
                        "search_analyzer":"standard"
                        },
                        "about": {
                            "type":"text",
                            "analyzer":"autocomplete", 
                            "search_analyzer":"standard"
                        }
                   }
                }
            }
        })
    }

    async bulkInsertDoctors(input : ProfileDto[]) {

        input.forEach((profile) => {
                this.elasticsearchService.index({
                index: 'doctors',
                refresh: true,
                body: {
                    id: profile.id,
                    firstname: profile.firstname,
                    lastname: profile.lastname,
                    about: profile.about
                }
            })
        })
      }

    async searchIndexPaged(index : string, q: string, from: number | 0, size: number | 100) {
        
        const { body } = await this.elasticsearchService.search({
            index: index,
            body: {
              query: {
                multi_match: {
                    query: q,
                    fields: ['firstname','lastname', 'about'],
                    //fuzziness: 'AUTO'
                }
              }
            }
          })
          
          return body.hits.hits     
    }

    async deleteIndex(index: string){
        return await this.elasticsearchService.indices.delete({index: index})
        .then(res => ({status: 'success', data: res}))
        .catch(err => { throw new Error('Failed to bulk delete data'); });
    }

}