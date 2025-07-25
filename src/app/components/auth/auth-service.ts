import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private _http:HttpClient){

  }
  register(email:any):Observable<any>{
    const url = 'auth/register'
    return this._http.post(`${environment.baseUrl}${url}`,email);
  }
  verfiyOTP(data:any){
    const url = 'auth/verifyOtp'
    return this._http.post(`${environment.baseUrl}${url}`,data);
  }
  resendOTP(data:any){
    const url = 'auth/resendOtp'
    return this._http.post(`${environment.baseUrl}${url}`,data);
  }
}
