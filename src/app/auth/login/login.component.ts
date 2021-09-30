import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgForm } from "@angular/forms";
import { LoadingService } from 'src/app/common_services/loading.service';
import { Subscription } from 'rxjs';

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
        this.authService.login("user", form.value.password);
        setTimeout(()=>{
          var loginOk = this.authService.getAuthStatus();
          console.warn(loginOk);
          resolve(loginOk);
        },1000);
      });
      loginCompleted.then(loginOk => {
        if (loginOk) {
          console.warn("Login OK.");
          this._router.navigate(["report"]);
        } else {
          console.warn("Login failed.");
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
