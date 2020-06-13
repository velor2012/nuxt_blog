import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Injectable } from '@nestjs/common';
import Article from '../../article/article.model';
import * as _ from 'lodash';

@Injectable()
export class ESService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async create(id: string, obj: Object, index: string) {
    let res = await this.elasticsearchService.create({
      id: id,
      index: index,
      type: '_doc',
      refresh: 'true',
      body: obj,
    });
    return res;
  }
  async update(id: string, obj: Object, index: string) {
    let { _id, __v, ...doc } = obj as any;
    let res = await this.elasticsearchService.update({
      id: id,
      index: index,
      refresh: 'true',
      body: {
        doc: doc,
      },
    });
    return res;
  }
  async delete(id: string, index: string) {
    let res = await this.elasticsearchService.delete({
      id: id,
      index: index,
      type: '_doc',
      refresh: 'true',
    });
    return res;
  }

  async searchArticle(keyword: string, pageSize: number, page: number) {
    let from = (page - 1) * pageSize;
    let res = await this.elasticsearchService.search({
      index: 'article',
      body: {
        "_source": false, 
        "from": from,
        "size": pageSize, 
        "query":{
          "bool": {
                "should": [
                  {
                    "wildcard": {
                      "title": `*${keyword}*`,
                    }
                  },
                  {
                    "wildcard": {
                      "resume": `*${keyword}*`,
                    }
                  },
                  {
                    "wildcard": {
                      "content": `*${keyword}*`,
                    }
                  },
                  {
                    "query_string": {
                      "fields": ["title","resume","content"],
                      "query": keyword
                    }
                  }
                ]
          }
        }
        , "highlight": {
          "fields": {
            "title": {},
            "resume": {}
            , "content": {}
          }
        }
      }
    });
    return _.get(res, 'body.hits');
  }
  async searchNote(keyword: string, pageSize: number, page: number) {
    let from = (page - 1) * pageSize;
    let res = await this.elasticsearchService.search({
      index: 'note',
      body: {
        "_source": false, 
        "from": from,
        "size": pageSize, 
        "query":{
          "bool": {
            "should": [
              {
                    "nested": {
                      "path": "subDoc",
                      "query": {
                        "bool": {
                        "should": [
                          {
                            "wildcard": {
                              "subDoc.content": `*${keyword}*`,
                            }
                          },
                          {
                            "wildcard": {
                              "subDoc.title": `*${keyword}*`,
                            }
                          },
                          {
                            "query_string": {
                              "fields": ["subDoc.title","subDoc.content"],
                              "query": keyword
                            }
                          }
                        ]
                      }
                    }
                  }
              },
              {
                "wildcard": {
                  "name": `*${keyword}*`,
                }
              },
              {
                "wildcard": {
                  "resume": `*${keyword}*`,
                }
              },
              {
                "query_string": {
                  "fields": ["resume", "name"],
                  "query": keyword
                }
              }
            ]
          }
        }
        , "highlight": {
          "fields": {
            "resume": {}
            , "name": {}
          }
        }
      }
    });
    return _.get(res, 'body.hits');
  }

  async searchSubDoc(keyword: string, pageSize: number, page: number) {
    let from = (page - 1) * pageSize;
    let res = await this.elasticsearchService.search({
      index: 'note',
      body: {
        "_source": false, 
        "from": from,
        "size": pageSize, 
        "query":{
            "nested": {
              "path": "subDoc",
              "query": {
                "bool": {
                "should": [
                  {
                    "wildcard": {
                      "subDoc.content":`*${keyword}*`,
                    }
                  },
                  {
                    "wildcard": {
                      "subDoc.title":`*${keyword}*`,
                    }
                  },
                  {
                    "query_string": {
                      "fields": ["subDoc.title","subDoc.content"],
                      "query": keyword
                    }
                  }
                ]
              }
            }
            , "inner_hits": {
              "highlight": {
                "fields": {
                  "subDoc.content": {},
                  "subDoc.title": {}
                }
              }
            }
          }
        }
      
      }
    });
    return _.get(res, 'body.hits');
  }
}
