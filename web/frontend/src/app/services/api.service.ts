import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import { environment } from '../../environments/environment';

import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {StatusResult} from "../models/status-result";
import {Tag} from "../models/tag";
import {SyncResult} from "../models/sync-result";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

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

  // Unauthenticated functions
  fetchTags(): Observable<Tag> {
    return this.http.get<Tag>((environment.apiBase ? environment.apiBase: '') + '/api/v1/data/tags.json')
      .pipe(catchError(this.handleError));
  }

  syncStorage(): Observable<SyncResult[]> {
    return this.http.post<SyncResult[]>((environment.apiBase ? environment.apiBase: '') + '/api/v1/sync/bucket', {})
      .pipe(catchError(this.handleError));
  }

  processDocument(storageBucket, storageKey): Observable<any> {
    return this.http.post<any>((environment.apiBase ? environment.apiBase: '') + `/api/v1/sync/file/${storageBucket}/${storageKey}`, {})
      .pipe(catchError(this.handleError));
  }

  fetchStatus(): Observable<StatusResult> {
    return this.http.get<StatusResult>((environment.apiBase ? environment.apiBase: '') + '/api/v1/status')
      .pipe(catchError(this.handleError));
  }

  fetchStatusErrors(): Observable<[]> {
    return this.http.get<[]>((environment.apiBase ? environment.apiBase: '') + '/api/v1/status/errors')
      .pipe(catchError(this.handleError));
  }


  fetchDocumentData(path: string, respType): Observable<HttpResponse<ArrayBuffer>> {
    return this.http.get(path, {
      responseType: respType,
      observe: 'response'
    })
      .pipe(catchError(this.handleError));

    // var cacheKey = this.cacheKey('GET', url, params);
    // return this.cacheService.get(cacheKey) || this.cacheService.put(cacheKey, this.authHttp.get(url,{ search: params })
    //         .map(this.extractData)
    //         .catch(this.handleError))
  }


  // Helper functions

  transformTagsAutocomplete(availableTags: Tag): any[] {
    let tagsAutoComplete = []
    //add untagged tag
    tagsAutoComplete.push({
      id: 'untagged',
      name: 'untagged',
      group: 'custom'
    })
    for(let tagGroup of availableTags.tags){
      tagsAutoComplete.push({
        id: `${tagGroup.label}`,
        name: tagGroup.label,
        group: tagGroup.label
      })

      if (!tagGroup.tags){
        continue
      }

      for(let tagName of tagGroup.tags){
        tagsAutoComplete.push({
          id: `${tagGroup.label}.${tagName.label}`,
          name: tagName.label,
          group: tagGroup.label
        })
      }
    }



    return tagsAutoComplete
  }
}
