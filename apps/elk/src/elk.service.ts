import { Injectable, NotFoundException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ProfileDto } from './Dtos/profile.dto';
import { SearchResult, SearchResultDto } from './Dtos/search-result.dto';

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
                    "index.max_ngram_diff" : 17,
                    "analysis": {
                        "filter": {
                            "autocomplete_filter": {                                
                                //"type": "edge_ngram",
                                "type": "nGram",
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
        
        let results : SearchResultDto = {
            resultsByNames : {} as SearchResult[],
            resultsByAbouts : {} as SearchResult[]
        }
        
        let res1 = await this.elasticsearchService.search({
            index: index,
            body: {
              query: {
                multi_match: {
                    query: q,
                    fields: ['firstname','lastname'],
                    //fuzziness: 'AUTO'
                }
              }
            }
          })

          let resultsByNames = [] as SearchResult[]
          for(let i of res1.body.hits.hits)
          {
              resultsByNames.push({
                  id : i._source.id,
                  firstname : i._source.firstname, 
                  lastname : i._source.lastname,
                  about : i._source.about,
                  score : i._score
                  
              })
          }

          results.resultsByNames = resultsByNames


          let res2 = await this.elasticsearchService.search({
            index: index,
            body: {
              query: {
                multi_match: {
                    query: q,
                    fields: ['about']
                    //fuzziness: 'AUTO'
                }
              }
            }
          })

          let resultsByAbouts = [] as SearchResult[]
          for(let i of res2.body.hits.hits)
          {
            resultsByAbouts.push({
                  id : i._source.id,
                  firstname : i._source.firstname, 
                  lastname : i._source.lastname,
                  about : i._source.about,
                  score : i._score
              })
          }

          results.resultsByAbouts = resultsByAbouts
          
          return results
    }

    async deleteIndex(index: string){
        return await this.elasticsearchService.indices.delete({index: index})
        .then(res => ({status: 'success', data: res}))
        .catch(err => { throw new Error('Failed to bulk delete data'); });
    }

    async deleteBulkDeleteDoctors(idsList : number[]){
        
        //bulk?
        idsList.forEach((id) => {
            this.elasticsearchService.deleteByQuery({
                index: 'doctors',
                body: {
                  query: {
                    match: {
                      id: id,
                    }
                  }
                }
              })
        })

        //refresh index

        
    }

    async updateBulkRecords(input : ProfileDto[]){

        //bulk?
        this.elasticsearchService.update({ 
            index: "doctors",  
            id: "1", 
            body: { 
                // put the partial document under the `doc` key 
                doc: input[0]
            } 
        }) 
        
    }

}