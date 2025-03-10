import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/data.model';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
})
export class UserTableComponent implements OnInit {
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data.users);
        this.filteredUsers.set(data.users);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.error.set('Failed to load users. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);

    if (!value) {
      this.filteredUsers.set(this.users());
      return;
    }

    const filtered = this.users().filter(
      (user) =>
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase()) ||
        user.role.toLowerCase().includes(value.toLowerCase())
    );

    this.filteredUsers.set(filtered);
  }

  sortBy(field: keyof User): void {
    const users = [...this.filteredUsers()];

    this.filteredUsers.set(
      users.sort((a, b) => {
        if (a[field] < b[field]) return -1;
        if (a[field] > b[field]) return 1;
        return 0;
      })
    );
  }
}
