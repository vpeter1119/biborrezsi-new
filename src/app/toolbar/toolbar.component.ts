import { Component, OnInit } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LoadingService } from '../common_services/loading.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  isLoading: boolean = false;
  loadingSub: Subscription = new Subscription();
  ////serverIsUp: boolean = true;
  ////serverStatusSub: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private _loading: LoadingService,
  ) { }

  ngOnInit(): void {
    this.loadingSub = this._loading.getLoadingStatus()
    .subscribe(status => {
      this.isLoading = status;
    });
  }

  setIsLoading(to: boolean): void {
    this.isLoading = to;
  }

  toggleIsLoading(): boolean {
    this.isLoading = !this.isLoading;
    return this.isLoading;
  }

  isAuth(): boolean {
    return this.authService.getAuthStatus();
  }

  logout(): void {
    this.authService.logout();
  }

}
