import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Injectable } from '@nestjs/common';
import Article from '../../article/article.model';
import * as _ from 'lodash';

@Injectable()
export class ESService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async create(id:string,obj: Object,index:string) {
        let res = await this.elasticsearchService.create({
            id:id,
            index:index,
            type:'_doc',
            refresh: 'true',
            body: obj
        }
        )
        return res
    }
    async update(id: string, obj: Object, index: string) {
        let { _id, __v, ...doc } = (obj as any);
        let res = await this.elasticsearchService.update({
            id:id,
            index:index,
            refresh: 'true',
            body: {
                doc:doc
            }
        })
        return res
    }
    async delete(id: string, index: string) {
        let res = await this.elasticsearchService.delete({
            id:id,
            index:index,
            type:'_doc',
            refresh: 'true'
        })
        return res
    }
    
    async searchArticle(keyword: string, pageSize: number, page: number) {
    let from = (page-1)*pageSize
    let res =  await this.elasticsearchService.search({
      index: 'article',
      body: {
        _source: false,
        query: {
          query_string: {
            fields: ['content', 'title', 'resume'],
            query: keyword,
          },
        },
        "size": pageSize,
        "from": from,
        highlight: {
          fields: {
                title: {
                    "number_of_fragments" : 0
            },
                resume: {
                    "number_of_fragments" : 0
            },
          },
        },
      },
    });
    return _.get(res,"body.hits") 
  }
    async searchNote(keyword: string, pageSize: number, page: number) {
        let from = (page-1)*pageSize
        let res = await this.elasticsearchService.search({
            index: 'note',
            body: {
                _source: false,
                query: {
                    query_string: {
                        fields: ['subDoc.content', 'subDoc.title','resume','name'],
                        query: keyword,
                    },
                },
                "size": pageSize,
                "from": from,
                highlight: {
                    fields: {
                        name: {
                            "number_of_fragments" : 0
                      },
                        resume: {
                            "number_of_fragments" : 0
                      },
                    },
                  },
            }
        })
        return _.get(res,"body.hits") 
    }

    async searchSubDoc(keyword: string, pageSize: number, page: number) {
        let from = (page-1)*pageSize
    let res = await this.elasticsearchService.search({
      index: 'note',
      body: {
          _source: false,
          "size": pageSize,
          "from": from,
        query: {
          nested: {
            path: 'subDoc',
            query: {
              query_string: {
                fields: ['subDoc.content', 'subDoc.title'],
                query: keyword,
              },
            },
            inner_hits: {
            "_source": ["subDoc.title","subDoc.order"], 
              highlight: {
                fields: {
                      'subDoc.content': {
                        "number_of_fragments" : 0
                  },
                      'subDoc.title': {
                        "number_of_fragments" : 0
                  },
                },
              },
            },
          },
        },
      },
    });
    return _.get(res,"body.hits") 
  }
}
