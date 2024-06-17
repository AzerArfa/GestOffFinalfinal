import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-update-all-users',
  templateUrl: './update-all-users.component.html',
  styleUrls: ['./update-all-users.component.css']
})
export class UpdateAllUsersComponent implements OnInit{
  currentUser: any = {
    email: '',
    name: '',
    prenom:'',
    cin: '',
    datenais: '',
    lieunais: ''
  };
  selectedFile: File | null = null;
  showFileInput: boolean = false; // Flag to control file input visibility
  userImagePreview: string | ArrayBuffer | null = null; // Image preview



  constructor(
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<UpdateAllUsersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
  ngOnInit(): void {
    // Check if data contains the id parameter
    if (this.data && this.data.id) {
      const userId = this.data.id;
      this.userService.getUserById(userId).subscribe(
        (data: any) => {
          this.currentUser = data;
          
          if (this.currentUser.datenais) {
            const date = new Date(this.currentUser.datenais);
            if (!isNaN(date.getTime())) {
              this.currentUser.datenais = this.formatDate(date);
            } else {
              console.error('Invalid date format:', this.currentUser.datenais);
            }
          }
          if (this.currentUser.img) {
            // Assuming 'img' is a Base64 encoded string
            this.currentUser.imgUrl = `data:image/jpeg;base64,${this.currentUser.img}`;
            this.userImagePreview = this.currentUser.imgUrl;
          }
        },
        error => console.error(error)
      );
    } else {
      console.error('No user id provided');
    }
  }
  
  
  formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  updateUser(): void {
    const formData = new FormData();
    formData.append('email', this.currentUser.email);
    formData.append('name', this.currentUser.name);
    formData.append('prenom', this.currentUser.prenom);
    formData.append('cin', this.currentUser.cin);
    formData.append('datenais', this.currentUser.datenais);
    formData.append('lieunais', this.currentUser.lieunais);
    if (this.selectedFile) {
      formData.append('img', this.selectedFile, this.selectedFile.name);
    }

    this.userService.updateUser(this.data.id, formData).subscribe(
      () => {
        this.toastr.success('User updated successfully.', 'Success');
        this.dialogRef.close(true); // Emit true on successful update
      },
      error => {
        this.toastr.error('Failed to update user.', 'Error');
        console.error('Update error:', error);
        this.dialogRef.close(false); // Emit false on error
      }
    );
  }
  
  
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      // A new file has been selected
      this.selectedFile = event.target.files[0];
      this.showFileInput = false; // Close file input after selecting a file
      // Read the selected file and display it dynamically
      if (this.selectedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.userImagePreview = e.target?.result as string | ArrayBuffer | null;
        };
        reader.readAsDataURL(this.selectedFile);
      }
    } else {
      // No new file was selected, reset selectedFile to null
      this.selectedFile = null;
      this.showFileInput = false; // Close file input if no file selected
      this.userImagePreview = this.currentUser.imgUrl; // Reset image preview
    }
  }
  
  

  openFileInput(): void {
    this.showFileInput = true; // Open file input when user clicks on the image
  }
}
