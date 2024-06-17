  import { Component, OnInit, ViewChild } from '@angular/core';
  import { User } from '../model/user.model';
  import { UserService } from '../services/user.service';
  import { AppeloffreService } from '../services/appeloffre.service';
  import { AuthService } from '../services/auth.service';
  import { DemandeAjoutEntreprise } from '../model/demandeajoutentreprise.model';
  import { DemandeRejoindreEntreprise } from '../model/demanderejoindreentreprise.model';
  import { ToastrService } from 'ngx-toastr';
  import Swal from 'sweetalert2';
  import { UpdateEntrepriseComponent } from '../update-entreprise/update-entreprise.component';
  import { UpdateUserComponent } from '../update-user/update-user.component';
  import { MatDialog } from '@angular/material/dialog';
  import { RequestDialogComponent } from '../request-dialog/request-dialog.component';
  import { EntrepriseRequestDialogComponent } from '../entreprise-request-dialog/entreprise-request-dialog.component';
  import { PasswordUpdateDialogComponent } from '../password-update-dialog/password-update-dialog.component';
  import { MatPaginator, PageEvent } from '@angular/material/paginator';

  @Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
  })
  export class ProfileComponent implements OnInit {
    currentUser = new User();
    isAdmin!: boolean;
    isSuperAdmin!: boolean;
    creationRequests: DemandeAjoutEntreprise[] = [];
    joinRequests: DemandeRejoindreEntreprise[] = [];
    paginatedjoinRequests: any[] = [];
    userId!: string;
    pendingRequests: DemandeAjoutEntreprise[] = [];
    sortOption: string = 'entreprises';
    sortedList: any[] = [];
    paginatedCreationRequests: any[] = [];
    searchTerm: string = '';
    filteredList: any[] = [];
    paginatedsortedList: any[] = [];
    remainingDays: number | null = null;


    @ViewChild("MatPaginator1") paginator!: MatPaginator;
    @ViewChild("MatPaginator2") paginator1!: MatPaginator;
    @ViewChild("MatPaginator3") paginator2!: MatPaginator;

    constructor(
      private userService: UserService,
      private authService: AuthService,
      private appeloffreService: AppeloffreService,
      private toastr: ToastrService,
      private dialog:MatDialog
    ) {}

    ngOnInit(): void {
      this.authService.getUserId().subscribe({
        next: (userId) => {
          if (userId) {
            this.userId = userId;
            this.loadCurrentUser(userId);
            this.isAdmin = this.authService.isAdmin();
            this.isSuperAdmin = this.authService.isSuperAdmin();
            console.log(this.isSuperAdmin);

            if (this.isAdmin) {
              this.loadJoinRequests();
            } else if (this.isSuperAdmin) {
              this.loadCreationRequests();
            }
            this.loadPendingRequests(userId);
          } else {
            console.error('User ID not found');
          }
        },
        error: (err) => console.error('Failed to get user ID:', err)
      });
    }
    openRequestDialog(request: any): void {
      const dialogRef = this.dialog.open(RequestDialogComponent, {
        width: '400px',
        data: { user: request }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }

    
    openPasswordUpdateDialog(): void {
      const dialogRef = this.dialog.open(PasswordUpdateDialogComponent, {
        width: '400px',
        data: { email: this.currentUser.email } // Pre-fill email if necessary
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.passwordChanged) {
          // Set remainingDays to a value that hides the warning
          this.remainingDays = 8; // any value > 7 will work
          this.authService.refreshUserInfo(this.currentUser);
          console.log('The dialog was closed and password was changed');
        } else {
          console.log('The dialog was closed without changing the password');
        }
      });
    }
    
    
    
    sortList(): void {
      if (this.sortOption === 'entreprises') {
        this.sortedList = [
          ...this.currentUser.entreprises,
          ...this.pendingRequests.map(request => ({ ...request, status: 'pending' }))
          
        ];
        this.updatePage()
      } else {
        this.sortedList = [
          ...this.pendingRequests.map(request => ({ ...request, status: 'pending' })),
          ...this.currentUser.entreprises
        ];
        this.updatePage()
      }
    }
    loadPendingRequests(userId: string): void {
      this.userService.getRequestsByUserId(userId).subscribe({
        next: (requests) => {
          this.pendingRequests = requests;
          this.sortList();
        
        },
        error: (err) => console.error('Failed to fetch pending requests:', err)
      });
    }
    openUpdateEntrepriseDialog(entrepriseId: string): void {
      const dialogRef = this.dialog.open(UpdateEntrepriseComponent, {
        width: '500px',
        data: { entrepriseId }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.loadCurrentUser(this.userId);
      });
    }


    openUpdateUserDialog(userId: string): void {
      const dialogRef = this.dialog.open(UpdateUserComponent, {
        width: '500px',
        data: { id: userId } // Pass the userId parameter here
      });

      dialogRef.afterClosed().subscribe(result => {
        this.loadCurrentUser(this.userId);
      });
    }
    loadCreationRequests(): void {
      this.userService.getAllCreationRequests().subscribe({
        next: (requests) => {
          this.creationRequests = requests;
          this.updatePage3(); // Call updatePage3 to initialize pagination
        },
        error: (err) => console.error('Failed to fetch creation requests:', err)
      });
    }
    

    approveCreation(requestId: string, userId: string) {
      this.userService.approveCreationRequest(requestId, userId).subscribe({
        next: (response) => {
          this.toastr.success('Demande de création approuvée avec succès', "Entreprise", {
            timeOut: 5000,
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
          });
          console.log('Demande de création approuvée avec succès:', response);
          this.loadCreationRequests();
        },
        error: (error) => {
          this.toastr.error("Échec de l'approbation de la demande de création", "Entreprise", {
            timeOut: 5000,
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
          });
          console.error("Échec de l'approbation de la demande de création", error);
          const errorMessage = error.error.error || error.message;
          console.log('Error message from the server:', errorMessage);
        }
      });
    }

    rejectCreation(requestId: string) {
      this.userService.rejectCreationRequest(requestId).subscribe({
        next: () => {
          console.log('Creation request rejected successfully.');
          this.toastr.success('Demande de création rejetée avec succès', "Entreprise", {
            timeOut: 5000,
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
          });
          this.loadCreationRequests();
        },
        error: (error) => {
          console.error('Failed to reject creation request:', error);
          this.toastr.error('Échec du rejet de la demande de création', "Entreprise", {
            timeOut: 5000,
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
          });
        }
      });
    }

    approveJoin(requestId: string) {
      this.userService.approveJoinRequest(requestId).subscribe({
        next: (response) => {
          console.log('Join request approved:', response);
          this.loadJoinRequests();
          this.toastr.success("Demande d'adhésion approuvée ", "Entreprise", {
            timeOut: 5000,
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
          });
        },
        error: (error) => {
          this.toastr.error("Échec de l'approbation de la demande d'adhésion", "Entreprise", {
            timeOut: 5000,
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
          });
          console.error('Failed to approve join request', error);
          console.log('Error response:', error.error.text);
        }
      });
    }

    rejectJoin(requestId: string) {
      this.userService.rejectJoinRequest(requestId).subscribe({
        next: (response) => {
          this.toastr.success("Demande d'adhésion rejetée avec succès", "Entreprise", {
            timeOut: 5000,
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
          });
          console.log('Join request rejected');
          this.loadJoinRequests();
        },
        error: (err) => {
          console.error('Failed to reject join request', err);
          this.toastr.error("Échec du rejet de la demande d'adhésion", "Entreprise", {
            timeOut: 5000,
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
          });
        }
      });
    }

    loadJoinRequests(): void {
      this.userService.getAllJoinRequests(this.userId).subscribe({
        next: (requests) => {
          this.joinRequests = requests;
          this.joinRequests.forEach(request => {
            this.userService.getUserById(request.userId).subscribe(user => {
              request.userName = user.name;
              request.userPrenom = user.prenom;
              request.userDatenais = user.datenais;
              request.userLieunais = user.lieunais;
              request.userImg = user.img;
            });
          });
          this.updatePage2()
        },
        error: (err) => console.error('Failed to fetch join requests:', err)
      });
    }
    

    loadCurrentUser(userId: string): void {
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.sortList();
        },
        error: (error) => {
          console.error('Error loading user data:', error);
        }
      });
    }

    formatDate(date: Date): string {
      if (!date) {
        return '';
      }

      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date:', date);
        return '';
      }
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'long', day: 'numeric'
      };
      return new Intl.DateTimeFormat('fr-FR', options).format(dateObj);
    }

    supprimerEntreprise(id: string): void {
      if (this.authService.isAdmin()) {
        console.log('Checking appeloffres for entreprise with ID (admin):', id);
        this.appeloffreService.getAppelOffresByEntrepriseId(id).subscribe({
          next: (appeloffres) => {
            if (appeloffres && appeloffres.length > 0) {
              this.toastr.warning('Vous devez supprimer les offres associés à cette entreprise avant de pouvoir la supprimer.', 'Erreur', {
                timeOut: 5000,
                closeButton: true,
                progressBar: true,
                positionClass: 'toast-top-right',
              });
            } else {
              this.deleteEntreprise(id);
            }
          },
          error: (error) => {
            console.warn('Error checking appeloffres for entreprise (admin):', error);
          }
        });
      } else {
        console.log('Directly deleting entreprise without checking appeloffres (non-admin):', id);
        this.deleteEntreprise(id);
      }
    }

    openCreationRequestDialog(request: DemandeAjoutEntreprise): void {
      const dialogRef = this.dialog.open(EntrepriseRequestDialogComponent, {
        width: '400px',
        data: { demande: request }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }
    
    deleteEntreprise(id: string): void {
      Swal.fire({
        title: 'Êtes-vous sûr?',
        text: 'Voulez-vous vraiment supprimer cette entreprise?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745', // Green color
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer!',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.userService.supprimerEntreprise(id).subscribe({
            next: (response) => {
              console.log('Delete response:', response);
              if (response.status === 200) {
                this.toastr.success("Entreprise supprimée avec succès", "Entreprise", {
                  timeOut: 5000,
                  closeButton: true,
                  progressBar: true,
                  positionClass: 'toast-top-right',
                });
                console.log('Entreprise deleted successfully');
                this.loadCurrentUser(this.userId); // Reload the page after successful deletion
              } else {
                this.handleDeleteError(response);
              }
            },
            error: (error) => {
              console.error('Error deleting entreprise:', error);
              this.toastr.error("Erreur lors de la suppression de l'entreprise", "Entreprise", {
                timeOut: 5000,
                closeButton: true,
                progressBar: true,
                positionClass: 'toast-top-right',
              });
              this.loadCurrentUser(this.userId); // Reload the page even if an error occurs
            }
          });
        }
      });
    }
    
    handleDeleteError(response: any): void {
      console.error('Unexpected delete response:', response);
      this.toastr.error("Erreur inattendue lors de la suppression de l'entreprise", "Entreprise", {
        timeOut: 5000,
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right',
      });
    }
    


    updatePage(event?: PageEvent): void {
      const pageIndex = event ? event.pageIndex : this.paginator.pageIndex;
      const pageSize = event ? event.pageSize : this.paginator.pageSize;
      this.paginator.pageIndex = pageIndex;
      this.paginator.pageSize = pageSize;
      this.paginator.length = this.sortedList.length;
      this.paginatedsortedList = this.sortedList.slice(
        pageIndex * pageSize,
        pageIndex * pageSize + pageSize
      );
    }
    

    updatePage2(event?: PageEvent) {
      const pageIndex = event ? event.pageIndex : 0;
      const pageSize = event ? event.pageSize : 5; // default page size
      this.paginator1.pageIndex = pageIndex;
      this.paginator1.pageSize = pageSize;
      this.paginator1.length = this.joinRequests.length;
      this.paginatedjoinRequests = this.joinRequests.slice(
        pageIndex * pageSize,
        pageIndex * pageSize + pageSize
      );
    }
    updatePage3(event?: PageEvent) {
      const pageIndex = event ? event.pageIndex : 0;
      const pageSize = event ? event.pageSize : 5; // default page size
      this.paginator2.pageIndex = pageIndex;
      this.paginator2.pageSize = pageSize;
      this.paginator2.length = this.creationRequests.length;
      this.paginatedCreationRequests = this.creationRequests.slice(
        pageIndex * pageSize,
        pageIndex * pageSize + pageSize
      );
    }
    filterEntreprises(): void {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.paginatedsortedList = this.sortedList.filter(item =>
        item.name?.toLowerCase().includes(searchTermLower) || item.nom?.toLowerCase().includes(searchTermLower)
      );
      this.paginator.pageIndex = 0; // Always reset to the first page on filter change
      this.updatePagination();
    }
    updatePagination() {
      const pageSize = this.paginator.pageSize;
      const pageIndex = this.paginator.pageIndex;
      this.paginator.length = this.paginatedsortedList.length; // Update the total length based on filtered data
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      this.paginatedsortedList = this.paginatedsortedList.slice(start, end); // Slice the paginatedUsers for current page display
    }
  }