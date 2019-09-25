import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import { environment } from '../../environments/environment';

import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

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

  fetchDocumentData(path: string): Observable<HttpResponse<ArrayBuffer>> {

    return this.http.get(path, {
      responseType: 'arraybuffer',
      observe: 'response'
    })
      .pipe(catchError(this.handleError));

    // var cacheKey = this.cacheKey('GET', url, params);
    // return this.cacheService.get(cacheKey) || this.cacheService.put(cacheKey, this.authHttp.get(url,{ search: params })
    //         .map(this.extractData)
    //         .catch(this.handleError))
  }

}
