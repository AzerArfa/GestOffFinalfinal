import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-password-update-dialog',
  templateUrl: './password-update-dialog.component.html',
  styleUrls: ['./password-update-dialog.component.css']
})
export class PasswordUpdateDialogComponent {
  passwordForm: FormGroup;
  email: string;

  constructor(
    public dialogRef: MatDialogRef<PasswordUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.email = data.email; // Store the email separately
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPasswordMatch: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const newPasswordMatch = formGroup.get('newPasswordMatch')?.value;
    return newPassword === newPasswordMatch ? null : { mismatch: true };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      const formValue = this.passwordForm.getRawValue();
      const payload = {
        email: this.email, // Include the email in the payload
        ...formValue
      };
      this.userService.updatePasswordByEmail(payload).subscribe(
        response => {
          console.log('Password updated successfully', response);
          this.toastr.success(response.message);
          this.dialogRef.close({ passwordChanged: true });
        },
        error => {
          console.error('Error updating password', error);
          this.toastr.error(error.error.message || 'Error updating password');
        }
      );
    }
  }
}
