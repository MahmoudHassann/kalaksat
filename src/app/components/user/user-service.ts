import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
   constructor(private _http:HttpClient){

  }
   updsteUser(data:any){
      const url = 'auth/updateProfile'
      return this._http.post(`${environment.baseUrl}${url}`,data);
    }
}
