import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Make sure ToastrService is imported if you want to show notifications

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  token: string = '';  // Token from the query params

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastr: ToastrService,  // Inject ToastrService for user notifications
    private router: Router          // Router for navigation after successful password reset
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || ''; // Handle undefined token
    });
  }

  onSubmit() {
    this.passwordMismatch = false;
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch = true;
      this.toastr.error('Les mots de passe ne correspondent pas.', 'Erreur');
      return;
    }
  
    this.authService.resetPassword(this.token, this.newPassword, this.confirmPassword).subscribe({
      next: (response) => {
        console.log('Password changed successfully');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Failed to reset password:', error);
        // Filter out the irrelevant error message
        let errorMessage = 'Échec de la réinitialisation du mot de passe. Veuillez réessayer.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string' && !error.error.includes('Http failure during parsing')) {
          errorMessage = error.error;
        }
        this.toastr.error(errorMessage, 'Erreur');
      }
    });
  }
  
  
  

  onClose() {
    console.log('Change password dialog closed');
  }
}
