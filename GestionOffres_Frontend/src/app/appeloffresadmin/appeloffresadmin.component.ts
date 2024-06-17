import { Component, OnInit } from '@angular/core';
import { AppelOffre } from '../model/appeloffre.model';
import { AppeloffreService } from '../services/appeloffre.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { Entreprise } from '../model/entreprise.model';
import Swal from 'sweetalert2';
import { UpdateappeloffreComponent } from '../updateappeloffre/updateappeloffre.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-appeloffresadmin',
  templateUrl: './appeloffresadmin.component.html',
  styleUrls: ['./appeloffresadmin.component.css']
})
export class AppeloffresadminComponent implements OnInit {
  appeloffres: AppelOffre[] = [];
  isLoading = true; // Track loading state
  entrepriseId: string | null = null;
  entreprise: Entreprise | null = null;
  ownerEmail: string | null = null; // Store owner email

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private appeloffreService: AppeloffreService,
    private route: ActivatedRoute,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.authService.userInfo.subscribe((userInfo) => {
      console.log('UserInfo from AuthService:', userInfo); // Log userInfo object
      if (userInfo && userInfo.email) {
        this.ownerEmail = userInfo.email;
        console.log('Owner email set:', this.ownerEmail); // Verify if email is set
      } else {
        console.warn('userInfo is null or does not have email property');
      }
    });

    this.route.params.subscribe(params => {
      this.entrepriseId = params['id']; // Directly set entrepriseId from route parameters
      if (this.entrepriseId) {
        this.getAppelOffresByEntreprise(this.entrepriseId);
        this.loadEntreprise(this.entrepriseId);
      }
    });
  }

  openUpdateAppelOffreDialog(appelOffreId: string): void {
    const dialogRef = this.dialog.open(UpdateappeloffreComponent, {
      width: '35vw', // Set the width to 80% of the viewport width
      height: '75vh', // Set the height to 80% of the viewport height
      data: { id: appelOffreId }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("dialog closed");
    });
  }

  private loadEntreprise(id: string): void {
    this.userService.getEntrepriseById(id).subscribe({
      next: (entreprise) => {
        if (entreprise && entreprise.users) {
          entreprise.users = this.filterOutOwner(entreprise.users);
        }
        this.entreprise = entreprise;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load entreprise:', error);
        this.isLoading = false;
      }
    });
  }

  supprimerAppelOffre(id: string): void {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Voulez-vous vraiment supprimer cet appel d\'offre?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745', // Green color
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.appeloffreService.deleteAppelOffreAdmin(id).subscribe(() => {
          console.log('Appel d\'offre supprimé');
          this.userService.deleteNotificationsByAppelOffreId(id).subscribe(() => {
            console.log('Notifications supprimées');
            Swal.fire(
              'Supprimé!',
              'L\'appel d\'offre a été supprimé avec succès.',
              'success'
            );
            this.getAppelOffresByEntreprise(this.entrepriseId!); // Reload the offers after successful deletion
          }, (error) => {
            console.warn('Error deleting notifications:', error); // Log as warning instead of error
            Swal.fire(
              'Erreur!',
              'Une erreur s\'est produite lors de la suppression des notifications.',
              'error'
            );
          });
        }, (error) => {
          console.warn('Error deleting appel d\'offre:', error); // Log as warning instead of error
          Swal.fire(
            'Erreur!',
            'Une erreur s\'est produite lors de la suppression de l\'appel d\'offre.',
              'error'
          );
        });
      }
    });
  }

  removeUser(userId: string): void {
    if (this.entrepriseId) {
      Swal.fire({
        title: 'Êtes-vous sûr?',
        text: 'Voulez-vous vraiment supprimer cet utilisateur de l\'entreprise?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer!',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.userService.removeUserFromEntreprise(this.entrepriseId!, userId).subscribe({
            next: () => {
              Swal.fire(
                'Supprimé!',
                'L\'utilisateur a été supprimé avec succès.',
                'success'
              );
              this.loadEntreprise(this.entrepriseId!);
            },
            error: (error) => {
              console.error('Failed to remove user:', error);
              Swal.fire(
                'Erreur!',
                'Une erreur s\'est produite lors de la suppression de l\'utilisateur.',
                'error'
              );
            }
          });
        }
      });
    }
  }

  private getAppelOffresByEntreprise(entrepriseId: string): void {
    this.appeloffreService.getAppelOffresByEntrepriseId(entrepriseId).subscribe({
      next: (appeloffres) => {
        this.appeloffres = appeloffres;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load offers:', error);
        this.isLoading = false;
      }
    });
  }

  private filterOutOwner(users: any[]): any[] {
    if (!this.ownerEmail) {
      console.warn('Owner email is not set, returning all users');
      return users;
    }
    console.log('Filtering out owner with email:', this.ownerEmail);
    return users.filter(user => user.email !== this.ownerEmail);
  }
}
