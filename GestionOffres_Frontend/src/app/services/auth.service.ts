import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { authApiURL } from '../config';
import { User } from '../model/user.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInStatus = new BehaviorSubject<boolean>(this.hasToken());
  private userInfoSubject = new BehaviorSubject<any>(this.getUserInfoFromStorage());

  public isloggedIn = this.loggedInStatus.asObservable();
  public userInfo = this.userInfoSubject.asObservable();

  public isloggedInState: boolean = false;
  public userInfoData: any = null;


  constructor(private http: HttpClient,
    private toastr: ToastrService,
  private router:Router) {
    this.checkLoginStatus(); 
  }
  requestResetPassword(email: string): Observable<any> {
    let params = new HttpParams().set('email', email);
    return this.http.post(`${authApiURL}/request-reset-password`, null, {
      params: params,
      responseType: 'text'  // Add this if the server response is plain text
    });
  }
  
  

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.post<any>(`${authApiURL}/reset-password`, { newPassword, confirmPassword }, {
      params: params
    }).pipe(
      tap(response => {
        if (response && response.message) {
          this.toastr.success(response.message, 'Réinitialisation du mot de passe');
          this.router.navigate(['/login']);
        }
      }),
      catchError((error) => {
        console.error('Reset password error:', error);
        let errorMessage = 'Échec de la réinitialisation du mot de passe. Veuillez réessayer.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string' && !error.error.includes('Http failure during parsing')) {
          errorMessage = error.error;
        }
        this.toastr.error(errorMessage, 'Erreur');
        return throwError(() => error);
      })
    );
  }
  
  
  
  
  
  
  hasEntreprises(): boolean {
    const userInfo = this.getUserInfo();
    console.log(userInfo.entreprises);
    return userInfo.entreprises;
  }
isAdmin(): boolean {
  const userInfo = this.getUserInfo();
  return userInfo.roles.includes('ROLE_ADMIN');
}
isSuperAdmin(): boolean {
  const userInfo = this.getUserInfo();
  return userInfo.roles.includes('ROLE_SUPERADMIN');
}
isAuthenticated(): boolean {
  const token = localStorage.getItem('authToken'); // or however you store your token
  console.log('Token Present:', !!token);
  return !!token; // Example condition
}
verifyEmail(token: string): Observable<any> {
  let params = new HttpParams().set('token', token);
  return this.http.get(`${authApiURL}/verify`, { params, responseType: 'text' });
}
 // Ensure email is included in userInfoData during login
login(user: any): Observable<HttpResponse<any>> {
  return this.http.post<any>(`${authApiURL}/login`, user, { observe: 'response' }).pipe(
    tap((res: HttpResponse<any>) => {
      console.log('Login response:', res.body);
      const token = res.body.jwt;
      if (token) {
        localStorage.setItem('authToken', token);
        this.isloggedInState = true;
        this.loggedInStatus.next(true);

        // Construct userInfo from response
        this.userInfoData = {
          roles: res.body.roles,
          entreprises: res.body.entreprises || [],
          userId: res.body.userId,
          email: res.body.email, // Ensure email is included here
          imageUrl: res.body.userImage ? `data:image/png;base64,${res.body.userImage}` : null // Handle null image
        };
        localStorage.setItem('userInfo', JSON.stringify(this.userInfoData));
        this.userInfoSubject.next(this.userInfoData);
      }
    })
  );
}
private handleError(error: any): Observable<never> {
  let errorMessage = 'An unknown error occurred!';
  if (error.error instanceof ErrorEvent) {
    // Client-side errors
    errorMessage = `Error: ${error.error.message}`;
  } else if (error.error) {
    // Server-side errors
    errorMessage = error.error;
  }
  return throwError(() => new Error(errorMessage));
}

  register(user: User): Observable<User> {
    return this.http.post<User>(`${authApiURL}/signup`, user).pipe(
      catchError(this.handleError),
      tap(() => {
        this.toastr.success('Registration successful. Please check your email to verify your account.', 'Sign Up', {
          timeOut: 5000,
          closeButton: true,
          progressBar: true,
          positionClass: 'toast-top-right',
        });
        this.router.navigate(['/login']);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUserInfo(): any {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        this.userInfoData = JSON.parse(userInfoStr);
        console.log('Parsed user info from localStorage:', this.userInfoData);
      } catch (error) {
        console.error('Error parsing user info from localStorage', error);
        this.userInfoData = null;
      }
    }
    return this.userInfoData;
  }

  logout(): void {
    this.isloggedInState = false;
    console.log('Token removed from localStorage');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    this.loggedInStatus.next(false);
    this.userInfoSubject.next(null);
    this.userInfoData = null;
  }

  // Update user info in local storage and BehaviorSubject
  updateUserInfo(updatedUser: any): void {
    const updatedUserInfo = {
      ...this.userInfoData,
      ...updatedUser,
      entreprises: updatedUser.entreprises || this.userInfoData.entreprises, // Safeguard against undefined entreprises
      imageUrl: updatedUser.body.img ? `data:image/png;base64,${updatedUser.body.img}` : this.userInfoData.imageUrl
    };
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    this.userInfoData=updatedUserInfo;
    this.userInfoSubject.next(updatedUserInfo);
  }
  

  // New method to refresh token and user info
  refreshUserInfo(updatedUser: any): void {
    console.log('Refreshing user info with:', updatedUser); // Debugging
    const token = this.getToken();
    if (token) {
      console.log('Current token:', token); // Debugging
      localStorage.setItem('authToken', token); // Assuming the token remains the same
      this.updateUserInfo(updatedUser);
      console.log('Token and user info refreshed.'); // Debugging
    } else {
      console.warn('No token found. Cannot refresh user info.'); // Debugging
    }
  }

  private checkLoginStatus(): void {
    const token = this.getToken();
    this.isloggedInState = !!token;
    if (this.isloggedInState) {
      const userInfoStr = localStorage.getItem('userInfo');
      console.log('Check login status user info string:', userInfoStr);
      if (userInfoStr) {
        try {
          this.userInfoData = JSON.parse(userInfoStr);
          console.log('Check login status user info:', this.userInfoData);
        } catch (error) {
          console.error('Error parsing user info from localStorage', error);
          this.userInfoData = null;
        }
      }
    }
    console.log('Checked login status, isloggedIn:', this.isloggedInState);
  }
  getUserId(): Observable<string | null> {
    return this.userInfo.pipe(
        map(userInfo => userInfo?.userId || null)
    );
}

  private getUserInfoFromStorage(): any {
    return this.getUserInfo();
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}

