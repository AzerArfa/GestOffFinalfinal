import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Ensure you import AuthService correctly based on your project structure
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService if you want to show notifications

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  email: string = '';
  errorMessage!: string;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService, // Add toastr for user notifications
    private router: Router
  ) {}

  onSubmit() {
    this.authService.requestResetPassword(this.email).subscribe({
      next: (response) => {
        this.toastr.success('Vérifiez votre e-mail pour le lien de réinitialisation.', 'E-mail envoyé');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        // Improved error handling
        this.errorMessage = error.error.message || error.message || 'Échec de l\'envoi du lien de réinitialisation. Veuillez réessayer.';
        this.toastr.error(this.errorMessage, 'Erreur');
      }
    });
  }
  
}
