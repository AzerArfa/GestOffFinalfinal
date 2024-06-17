import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../model/user.model';
import { UserService } from '../services/user.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { UpdateAllUsersComponent } from '../update-all-users/update-all-users.component';
import { HttpResponse } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  allUsers! : User[];
  nomUser! : string;
  currentUser = new User();

  paginatedUsers: User[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(private userService: UserService,
    private dialog:MatDialog) { }

  ngOnInit(): void {
    this.userService.listeUsers().subscribe(data => {
      this.paginatedUsers=data;
      this.users = data;
      this.allUsers = data; // Update allUsers property here
      this.updatePage();
    });
    
  }


  openUpdateUserDialog(userId: string): void {
    const dialogRef = this.dialog.open(UpdateAllUsersComponent, {
      width: '500px',
      data: { id: userId }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.getUserById(userId).subscribe(updatedUser => {
          const fullListIndex = this.users.findIndex(user => user.id === updatedUser.id);
          if (fullListIndex !== -1) {
            this.users[fullListIndex] = updatedUser; // Update the user in the full list
            
            // Calculate the index in the paginated list
            const pageStartIndex = this.paginator.pageIndex * this.paginator.pageSize;
            const paginatedIndex = fullListIndex - pageStartIndex;
            if (paginatedIndex >= 0 && paginatedIndex < this.paginatedUsers.length) {
              this.paginatedUsers[paginatedIndex] = updatedUser; // Update the user in the visible page
            }
          }
        });
      }
    });
  }
  

  getImage(img: any): string {
    return 'data:image/jpeg;base64,' + img;
  }


  
  loadUsers(): void {
    this.userService.listeUsers().subscribe((res) => {
      this.paginatedUsers = res.map(user => {
        console.log('User img:', user.img); // Debug log before modification
        if (user.img && !user.img.startsWith('data:image/jpeg;base64,')) {
          user.img = 'data:image/jpeg;base64,' + user.img;
        }
        console.log(user);
        console.log('Modified user img:', user.img); // Debug log after modification
        return user;
      });
    });
  }

  getRoleNames(user: User): string {
    return user.roles.map(role => role.name).join(', ');
  }

  onKeyUp(filterText: string): void {
    this.paginatedUsers = this.allUsers.filter(item =>
      item.name?.toLowerCase().includes(filterText.toLowerCase())
    );
    this.paginator.pageIndex = 0; // Always reset to the first page on filter change
    this.updatePagination();
  }  
  updatePagination() {
    const pageSize = this.paginator.pageSize;
    const pageIndex = this.paginator.pageIndex;
    this.paginator.length = this.paginatedUsers.length; // Update the total length based on filtered data
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    this.paginatedUsers = this.paginatedUsers.slice(start, end); // Slice the paginatedUsers for current page display
  }
  

  rechercherUsers(): void {
    this.userService.rechercherParNom(this.nomUser).subscribe(users => {
      this.users = users;
      this.updatePage(); // Ensure pagination is reset after searching
      console.log(users);
    });
  }
  

  supprimerUser(id: string): void {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Voulez-vous vraiment supprimer cet utilisateur?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745', // Green color
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.supprimerUser(id).subscribe((response: HttpResponse<any>) => {
          if (response.status === 200) {
            const index = this.users.findIndex(user => user.id === id);
            if (index !== -1) {
              this.users.splice(index, 1);
              this.updatePage();
            }
            Swal.fire('Supprimé!', 'L\'utilisateur a été supprimé.', 'success');
          } else {
            Swal.fire('Erreur!', 'Une erreur s\'est produite lors de la suppression de l\'utilisateur.', 'error');
          }
        }, (error) => {
          Swal.fire('Erreur!', 'Une erreur s\'est produite lors de la suppression de l\'utilisateur.', 'error');
        });
      }
    });
  }



  ngAfterViewInit(): void {
    this.paginator.page.subscribe((event: PageEvent) => {
      this.updatePage(event);
    });
  }
  
  updatePage(event?: PageEvent) {
    const pageIndex = event ? event.pageIndex : 0;
    const pageSize = event ? event.pageSize : this.paginator.pageSize;
    const length = this.users.length;

    if (pageIndex * pageSize >= length && pageIndex > 0) {
      this.paginator.pageIndex = pageIndex - 1;
    }

    this.paginator.length = length;
    this.paginatedUsers = this.users.slice(
      this.paginator.pageIndex * pageSize,
      (this.paginator.pageIndex + 1) * pageSize
    );
  }
  
}
