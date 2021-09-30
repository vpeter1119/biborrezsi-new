import { Component, OnInit } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  isLoading: boolean = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
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
