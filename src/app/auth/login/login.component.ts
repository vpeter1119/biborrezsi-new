import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgForm } from "@angular/forms";
import { LoadingService } from 'src/app/common_services/loading.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  loadingSub: Subscription = new Subscription();

  constructor(
    private _router: Router,
    private authService: AuthService,
    private _loading: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadingSub = this._loading.getLoadingStatus()
    .subscribe(status => {
      this.isLoading = status;
    });
  }

  onLogin(form: NgForm) {    
    if (form.invalid) {
      window.alert("Hibás kitöltés!")
      return;
    } else {
      this.isLoading = true;
      this._loading.switchLoading(true);
      var loginCompleted = new Promise((resolve, reject) => {
        this.authService.login("user", form.value.password)
        .then(success => {
          resolve(success);
        });
      });
      if (environment.debug) console.log('#loginComponent -> onLogin() -> loginCompleted: ', loginCompleted);
      loginCompleted.then(loginOk => {
        if (environment.debug) console.log('#loginComponent -> onLogin() -> loginOk: ', loginOk);
        if (loginOk) {
          if (environment.debug) console.warn("Login OK.");
          this._router.navigate(["home"]);
        } else {
          if (environment.debug) console.warn("Login failed.");
          this._loading.switchLoading(false);
        }
      });
      

    }
    this._loading.switchLoading(true);
    form.resetForm();
  }

  ngOnDestroy(): void {
    this.loadingSub.unsubscribe();
  }

}
