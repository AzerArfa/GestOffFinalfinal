import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { FooterComponent } from './footer/footer.component';
import { UsersComponent } from './users/users.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { AddUserComponent } from './add-user/add-user.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { RecaptchaModule } from 'ng-recaptcha';
import { ProfileComponent } from './profile/profile.component';
import { RechercheUsersComponent } from './recherche-users/recherche-users.component';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { UserService } from './services/user.service';
import { AuthInterceptor } from './services/auth.interceptor';
import { NavbarComponent } from './navbar/navbar.component';
import { AddentrepriseComponent } from './addentreprise/addentreprise.component';
import { UpdateEntrepriseComponent } from './update-entreprise/update-entreprise.component';
import { AddappeloffreComponent } from './addappeloffre/addappeloffre.component';
import { DetailsappeloffreComponent } from './detailsappeloffre/detailsappeloffre.component';
import { AppeloffresadminComponent } from './appeloffresadmin/appeloffresadmin.component';
import { UpdateappeloffreComponent } from './updateappeloffre/updateappeloffre.component';
import { AddoffreComponent } from './addoffre/addoffre.component';
import { DetailsappeloffreadminComponent } from './detailsappeloffreadmin/detailsappeloffreadmin.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { ActionentrepriseComponent } from './actionentreprise/actionentreprise.component';
import { DemandecreationentrepriseComponent } from './demandecreationentreprise/demandecreationentreprise.component';
import { DemanderejointentrepriseComponent } from './demanderejointentreprise/demanderejointentreprise.component';
import { HomevisitorComponent } from './homevisitor/homevisitor.component';
import { ListentreprisesComponent } from './listentreprises/listentreprises.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';
import { GestioncategoriesComponent } from './gestioncategories/gestioncategories.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { ConsulterentrepriseComponent } from './consulterentreprise/consulterentreprise.component';
import { NotificationslistdialogComponent } from './notificationslistdialog/notificationslistdialog.component';
import { RequestDialogComponent } from './request-dialog/request-dialog.component';
import { EntrepriseRequestDialogComponent } from './entreprise-request-dialog/entreprise-request-dialog.component';
import { PasswordChangeWarningComponent } from './password-change-warning/password-change-warning.component';
import { PasswordUpdateDialogComponent } from './password-update-dialog/password-update-dialog.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UpdateAllUsersComponent } from './update-all-users/update-all-users.component';
import { SuperadminDashboardComponent } from './superadmin-dashboard/superadmin-dashboard.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from './shared/custom-paginator'; // Adjust the path as necessary

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    FooterComponent,
    UsersComponent,
    LoginComponent,
    AddUserComponent,
    UpdateUserComponent,
    SignUpComponent,
    ProfileComponent,
    RechercheUsersComponent,
    NavbarComponent,
    AddentrepriseComponent,
    UpdateEntrepriseComponent,
    AddappeloffreComponent,
    DetailsappeloffreComponent,
    AppeloffresadminComponent,
    UpdateappeloffreComponent,
    AddoffreComponent,
    DetailsappeloffreadminComponent,
    ForbiddenComponent,
    ActionentrepriseComponent,
    DemandecreationentrepriseComponent,
    DemanderejointentrepriseComponent,
    HomevisitorComponent,
    ListentreprisesComponent,
    GestioncategoriesComponent,
    ConsulterentrepriseComponent,
    NotificationslistdialogComponent,
    RequestDialogComponent,
    EntrepriseRequestDialogComponent,
    PasswordChangeWarningComponent,
    PasswordUpdateDialogComponent,
    VerifyEmailComponent,
    ResetPasswordComponent,
    ChangePasswordComponent,
    UpdateAllUsersComponent,
    SuperadminDashboardComponent,
  ],
  imports: [
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    NgxPaginationModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RecaptchaModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatSelectModule,
    MatPaginatorModule
  ],
  providers: [
    HttpClient,
    UserService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MatPaginatorIntl, useValue: CustomPaginator() } // Provide the custom paginator here
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
