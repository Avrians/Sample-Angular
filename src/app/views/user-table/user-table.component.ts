import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, Pagination } from '../../models/data.model';
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
  paginatedUsers = signal<User[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  Math = Math;

  // State pagination
  pagination = signal<Pagination>({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  });

  // Opsi untuk pageSize
  pageSizeOptions = [5, 10, 25, 50];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    // Menggunakan service dengan pagination
    this.userService
      .getUsersPaginated(
        this.pagination().currentPage,
        this.pagination().pageSize
      )
      .subscribe({
        next: (data) => {
          // Mengupdate totalItems dan totalPages
          const totalPages = Math.ceil(data.total / this.pagination().pageSize);

          this.pagination.update((prev) => ({
            ...prev,
            totalItems: data.total,
            totalPages: totalPages,
          }));

          this.users.set(data.users);
          this.paginatedUsers.set(data.users);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading users', err);
          this.error.set('Failed to load users. Please try again later.');
          this.isLoading.set(false);
        },
      });
  }

  // Ketika pencarian dilakukan, kita perlu mereset pagination
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);

    // Reset pagination ke halaman pertama
    this.pagination.update((prev) => ({
      ...prev,
      currentPage: 1,
    }));

    this.applyFilter();
  }

  // Pisahkan pencarian dan pagination
  applyFilter(): void {
    this.isLoading.set(true);

    // Jika ada search term, filter dari semua data
    if (this.searchTerm()) {
      // Ambil semua data untuk filtering
      this.userService.getUsers().subscribe({
        next: (data) => {
          const filtered = data.users.filter(
            (user) =>
              user.name
                .toLowerCase()
                .includes(this.searchTerm().toLowerCase()) ||
              user.email
                .toLowerCase()
                .includes(this.searchTerm().toLowerCase()) ||
              user.role.toLowerCase().includes(this.searchTerm().toLowerCase())
          );

          // Update pagination dengan jumlah total yang sudah difilter
          const totalPages = Math.ceil(
            filtered.length / this.pagination().pageSize
          );

          this.pagination.update((prev) => ({
            ...prev,
            totalItems: filtered.length,
            totalPages: totalPages,
          }));

          // Paginate the filtered results
          const startIndex =
            (this.pagination().currentPage - 1) * this.pagination().pageSize;
          const endIndex = startIndex + this.pagination().pageSize;
          this.paginatedUsers.set(filtered.slice(startIndex, endIndex));

          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error filtering users', err);
          this.error.set('Failed to filter users. Please try again later.');
          this.isLoading.set(false);
        },
      });
    } else {
      // Jika tidak ada search term, gunakan pagination biasa
      this.loadUsers();
    }
  }

  // Navigasi pagination
  goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.pagination().totalPages ||
      page === this.pagination().currentPage
    ) {
      return;
    }

    this.pagination.update((prev) => ({
      ...prev,
      currentPage: page,
    }));

    if (this.searchTerm()) {
      this.applyFilter();
    } else {
      this.loadUsers();
    }
  }

  // Mengubah jumlah item per halaman
  changePageSize(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value);

    this.pagination.update((prev) => ({
      ...prev,
      pageSize: value,
      currentPage: 1, // Reset ke halaman pertama
    }));

    if (this.searchTerm()) {
      this.applyFilter();
    } else {
      this.loadUsers();
    }
  }

  // Method untuk mendapatkan array halaman untuk ditampilkan di UI
  getPageNumbers(): number[] {
    const totalPages = this.pagination().totalPages;
    const currentPage = this.pagination().currentPage;

    // Logic untuk menampilkan maksimal 5 nomor halaman
    // dengan halaman aktif di tengah jika memungkinkan
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Awal, menampilkan 5 halaman pertama
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    // Akhir, menampilkan 5 halaman terakhir
    if (currentPage > totalPages - 3) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    }

    // Tengah, menampilkan halaman saat ini dan 2 di setiap sisi
    return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
  }

  sortBy(field: keyof User): void {
    const users = [...this.paginatedUsers()];

    this.paginatedUsers.set(
      users.sort((a, b) => {
        if (a[field] < b[field]) return -1;
        if (a[field] > b[field]) return 1;
        return 0;
      })
    );
  }
}
