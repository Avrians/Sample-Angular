import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

  // Method pagination dari data JSON lokal
  // Ini mensimulasikan pagination server-side
  getUsersPaginated(
    page: number,
    pageSize: number
  ): Observable<{ users: User[]; total: number }> {
    return this.http.get<{ users: User[] }>(this.jsonUrl).pipe(
      map((response) => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = response.users.slice(startIndex, endIndex);

        return {
          users: paginatedUsers,
          total: response.users.length,
        };
      })
    );
  }

  // Nanti bisa diganti dengan API endpoint yang mendukung pagination
  // getUsersFromApi(page: number, pageSize: number): Observable<{users: User[], total: number}> {
  //   return this.http.get<{users: User[], total: number}>(`https://api.example.com/users?page=${page}&pageSize=${pageSize}`);
  // }
}
