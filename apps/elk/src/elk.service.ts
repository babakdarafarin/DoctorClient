import { Injectable } from '@nestjs/common';
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

    async CreateDoctorIndex() {
            const alpha = await this.elasticsearchService.indices.create({
                index: 'doctors',
                body: {
                    "settings": {
                        "index.max_ngram_diff" : 17,
                        "analysis": {
                            "filter": {
                                "autocomplete_filter": {                                
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

            console.log(typeof alpha)
    }

    async BulkCreateDoctorProfiles(input : ProfileDto[]) {

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

    async BulkUpdateDoctorProfiles(inputs : ProfileDto[]){

        //move for loop to the painless part
        for(const profile of inputs){
            await this.elasticsearchService.updateByQuery(
                {
                index: "doctors",  
                refresh: true,
                body: {
                    "query": { 
                        "match": 
                        { "id":  profile.id} 
                    },
                    "script": {
                        "lang": 'painless',
                        "source": "if(params.firstname != null) {ctx._source.firstname = params.firstname;}  if(params.lastname != null) {ctx._source.lastname = params.lastname;} if(params.about != null) {ctx._source.about = params.about;}",
                        "params": {
                            "firstname": profile.firstname,
                            "lastname": profile.lastname,
                            "about": profile.about
                          }
                    },
                }
            })
        }
    }

    async SearchData(index : string, q: string, from: number | 0, size: number | 100) {
        
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

    async DeleteIndex(index: string){
        return await this.elasticsearchService.indices.delete({index: index})
        .then(res => ({status: 'success', data: res}))
        .catch(err => { throw new Error('Failed to bulk delete data'); });
    }

    async BulkDeleteDoctorProfiles(idsList : number[]){
        
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
}
