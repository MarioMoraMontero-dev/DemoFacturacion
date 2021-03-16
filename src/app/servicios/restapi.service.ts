import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError,of } from 'rxjs';
import { Token } from '../interfaces/token';
import { map } from 'rxjs/operators';
const endpoint = 'https://demoincompany.my.salesforce.com/services/';

@Injectable({
  providedIn: 'root'
})
export class RestapiService {

  constructor(private http: HttpClient) { }
  body = new HttpParams()
  .set('username', 'omni@incompany.cr')
  .set('password', '@Incompany2021FtO5mzRubciPdL9h0ZUjefy3')
  .set('grant_type', 'password')
  .set('client_id', '3MVG9l2zHsylwlpQoIS3Ly3XghVVuow7LSJKUTiCdaTUsd50CC8_1EBW.n6Qu6wip9Xy3AbOctwSbYvv8L_kK')
  .set('client_secret', 'F524C5F73005BBC3FD6629ECBD0B274B8B07C93E011E73809C67C85D812E98B9');


  getToken(): Observable<any>{
    return this.http.post<any>(endpoint+'oauth2/token',this.body).pipe(
      map((data: Token[]) => {
       console.log("Salida Data: "+data);
        
        return data;
      }), catchError( error => {
        return throwError( 'Error' );
      })
   )
    
  }


  postaddFactura(token:string,factura:any ): Observable<any>{
    const header2 = new HttpHeaders()
    .append("Content-Type","application/json")
    .append("Authorization","OAuth "+ token);
    return this.http.post<any>(endpoint+'apexrest/addFactura/',factura,{headers: header2})
  }
}
