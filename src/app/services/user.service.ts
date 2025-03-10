import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/data.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private jsonUrl = 'assets/data/users.json';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(this.jsonUrl);
  }

  // Nanti bisa diganti dengan API endpoint
  // getUsersFromApi(): Observable<{ users: User[] }> {
  //   return this.http.get<{ users: User[] }>('https://api.example.com/users');
  // }
}
