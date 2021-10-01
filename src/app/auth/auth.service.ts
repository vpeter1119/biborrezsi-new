import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from "rxjs";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Variables
  apiUrl = environment.apiUrl;
  
  private token: string = '';
  private tokenTimer: any;
  authStatus = false;
  private authStatusListener = new Subject<boolean>();
  errorMessage: string = '';
  private errorMessageListener = new Subject<string>();

  constructor(
    private _http: HttpClient,
    private _router: Router
  ) { }

  getToken() {
    return this.token;
  }

  getAuthStatus() {
    return this.authStatus;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getErrorMessage() {
    return this.errorMessage;
  }

  getErrorMessageListener() {
    return this.errorMessageListener.asObservable();
  }

  login(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {

      this.logout();
      const authData = {username: username, pw: password};
      const url = (this.apiUrl + "auth/login");
      this._http.post<{token: string, expiresIn: number, message: string, errcode: string}>(url, authData)
      .subscribe(response => {
        if (response.token) {
          //Handle successful login attempt
          if (environment.debug) console.warn("Succesful login attempt.");
          this.token = response.token;
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.authStatus = true;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 100000);
          this.saveAuthData(this.token, expirationDate);
          this._router.navigate(["report"]);
          resolve(true);
        }
      }, error => {
        //Handle failed login attempt
        if (error) {
          if (environment.debug) console.warn("Failed login attempt.");
          if (environment.debug) console.warn(error);
          if (error.error != null) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = error.statusText;
          }        
          this.errorMessage = error.error.message;
          this.errorMessageListener.next(this.errorMessage);      
          this.authStatus = false;
          this.authStatusListener.next(false);
          window.alert(this.errorMessage);
          resolve(false);
        }
      });

    })
  }

  logout() {
    this.token = '';
    this.authStatus = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this._router.navigate(["login"]);
  }

  // Set the authentication timer
  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  // Save authentication data to local storage
  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
  }

  // Clear authentication data from local storage
  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
  }

  // Read authentication data from local storage
  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    if (!token || token == '' || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate)
    }
  }
}
