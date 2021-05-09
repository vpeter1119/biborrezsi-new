import { Component, OnInit } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  isLoading: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  setIsLoading(to: boolean): void {
    this.isLoading = to;
  }

  toggleIsLoading(): boolean {
    this.isLoading = !this.isLoading;
    return this.isLoading;
  }

}
