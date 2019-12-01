import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Client } from 'elasticsearch-browser';
import {Observable, throwError, from} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {DashboardFilter} from "../models/dashboard-filter";
import {SearchWrapper} from "../models/search-wrapper";
import {SearchResult} from "../models/search-result";
import {AppSettings} from "../app-settings";

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {

  private client: Client;

  constructor(private http: HttpClient) {
    this.client = new Client({
      host: environment.esBaseApi,
      log: 'trace'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

  isConnected(): any {
    return this.client.ping({
      requestTimeout: Infinity,
      body: 'hello world!'
    }).pipe(catchError(this.handleError));
  }


  searchDocuments(_filter: DashboardFilter): Observable<SearchWrapper> {

    const searchPayload = {
      index: AppSettings.ES_INDEX,
      // filterPath: ['hits.hits._source', 'hits.total', '_scroll_id'],
      body: {
        'query': this.buildQuery(_filter),
        'from': (_filter.page - 1) * AppSettings.ES_PAGE_SIZE | 0,
        'size': AppSettings.ES_PAGE_SIZE,
        'highlight' : {
          "pre_tags" : ["<mark>"],
          "post_tags" : ["</mark>"],
          "fields" : {
            "content" : {}
          }
        },
        'aggs': {
          "by_filetype": {
            "terms": {
              "field": "file.extension"
            }
          },
          "by_tag": {
            "terms": {
              "field": "lodestone.tags"
            }
          }
        }
      },
      // '_source': ['fullname', 'address']
    }

    const sort = this.buildSort(_filter)
    if(sort){
      searchPayload.body['sort'] = sort
    }

    const postFilter = this.buildPostFilter(_filter)
    if(postFilter){
      searchPayload.body['post_filter'] = postFilter;
    }

    return from(this.client.search(searchPayload)) as Observable<SearchWrapper>
  }

  bookmarkDocument(id: string, state: boolean): Observable<any> {
    return from(this.client.update({
      id: id,
      type: '_doc',
      index: AppSettings.ES_INDEX,
      body: {
        // put the partial document under the `doc` key
        doc: {
          'lodestone': {
            'bookmark': state
          }
        }
      }
    }))
  }

  // https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-update.html
  addDocumentTag(id: string, tag: string): Observable<any> {
    console.log("ADDING DOCUMENT TAG", tag)
    return from(this.client.update({
      id: id,
      index: AppSettings.ES_INDEX,
      body: {
        "script" : {
          "source": "if (!ctx._source.lodestone.tags.contains(params.tag)) { ctx._source.lodestone.tags.add(params.tag) }",
          "lang": "painless",
          "params" : {
            "tag" : tag
          }
        }
      }
    }))
  }

  // https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-update.html
  removeDocumentTag(id: string, tag: string): Observable<any> {
    console.log("REMOVE DOCUMENT TAG", tag)
    return from(this.client.update({
      id: id,
      index: AppSettings.ES_INDEX,
      body: {
        "script" : {
          "source": "if (ctx._source.lodestone.tags.contains(params.tag)) { ctx._source.lodestone.tags.remove(ctx._source.lodestone.tags.indexOf(params.tag)) }",
          "lang": "painless",
          "params" : {
            "tag" : tag
          }
        }
      }
    }))
  }

  getSimilar(id: string): Observable<SearchWrapper> {
    const searchPayload = {
      index: AppSettings.ES_INDEX,
      // filterPath: ['hits.hits._source', 'hits.total', '_scroll_id'],
      body: {
        'query': {
          "more_like_this" : {
            "fields" : ["title", "description"],
            "like" : [
              {
                "_index" : AppSettings.ES_INDEX,
                "_id" : id
              }
            ],
            "min_term_freq" : 1,
            "max_query_terms" : 12
          }
        }
      },
      // '_source': ['fullname', 'address']
    }
    return from(this.client.search(searchPayload)) as Observable<SearchWrapper>
  }

  getById(id: string): Observable<SearchResult> {
    return from(this.client.get({
      index: AppSettings.ES_INDEX,
      type: '_doc',
      id: id
    })) as Observable<SearchResult>
  }

  getAllDocuments(): Observable<SearchWrapper> {
    return from(this.client.search({
      index: AppSettings.ES_INDEX,
      body: {
        'query': {
          'match_all': {}
        }
      }
    })) as Observable<SearchWrapper>;
  }

  getAggregations(): Observable<SearchWrapper> {
    return from(this.client.search({
      index: AppSettings.ES_INDEX,
      body: {
        'size': 0,
        'aggregations': {
          "by_timerange": {
            "stats": {
              "field": "file.created"
            }
          },
          "by_filesize": {
            "stats": {
              "field": "file.filesize"
            }
          },
        },
      }
    })) as Observable<SearchWrapper>;
  }

  // private buildFilter(_filter: DashboardFilter): any {
  //   if(!_filter.fileTypes && !_filter.tags){
  //     return null
  //   }
  //
  //   var filterObj = {
  //     "filter": {
  //       "terms": {
  //         "tags": ["employee", "training"]
  //       }
  //     }
  //   }
  // }

  private buildPostFilter(_filter: DashboardFilter): any {

    if(_filter.fileTypes && _filter.fileTypes.length){
      return { "terms":  { "file.extension": _filter.fileTypes } }
    } else {
      return null
    }

  }

  private buildQuery(_filter: DashboardFilter): any {
    var mustContain = []; //AND
    var shouldContain = []; // OR
    var filterRules = []; // does not score, AND


    if(!_filter.query){
      mustContain.push({
        'match_all': {}
      })
    } else {
      mustContain.push({
        'simple_query_string': {
          "query": _filter.query,
          "default_operator": "and"
        }
      })
    }



    // for(let tag of _filter.tags){
    //   filterRules.push({ "term":  { "file.extension": fileType }})
    // }

    if(_filter.timeRange && _filter.fileSizes.length){

      filterRules.push({
        "range": {
            "file.created": {
                "gte": _filter.timeRange[0],
                "lte": _filter.timeRange[1]
            }
        }
      })
    }

    if(_filter.fileSizes && _filter.fileSizes.length){

      filterRules.push({
        "range": {
          "file.filesize": {
            "gte": _filter.fileSizes[0],
            "lte": _filter.fileSizes[1]
          }
        }
      })
    }

    if(_filter.bookmark){

      filterRules.push({
        "term": {
          "lodestone.bookmark": _filter.bookmark
        }
      })
    }


    console.log("QUERY BUILD WITH RULES:", mustContain, filterRules, shouldContain);


    return {
      "bool": {
        "must": mustContain,
        "must_not": [],
        "should": shouldContain,
        "filter": filterRules
      }
    }
  }

  private buildSort(_filter: DashboardFilter): any {
    var sortObj;
    if(!_filter.sortBy){
      return null;
    }


    if(_filter.sortBy == 'new'){
      sortObj = [{
        "file.created": {
          "order": "desc",
          // "nested": {
          //   "path": "file"
          // }
        }
      }]
    }
    else if (_filter.sortBy == 'title'){
      sortObj = [{
        "file.filename": {
          "order": "desc",
          // "nested": {
          //   "path": "file"
          // }
        }
      }]
    }
    else if (_filter.sortBy == 'size'){
      sortObj = [{
        "file.filesize": {
          "order": "desc",
          // "nested": {
          //   "path": "file"
          // }
        }
      }]
    }
    else if (_filter.sortBy == 'relevance'){
      sortObj = null
    }

    return sortObj
  }
}
