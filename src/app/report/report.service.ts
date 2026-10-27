import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { LoadingService } from '../common_services/loading.service';
import { Report } from './report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  // Variables
  apiUrl = environment.apiUrl;
  previousReports: Report[] = [];
  previousReportsSubject: Subject<Report[]> = new Subject();
  postReportResponse: Subject<{message: string}> = new Subject();

  constructor(
    private _http: HttpClient,
    private _router: Router,
    private authService: AuthService,
    private loadingService: LoadingService
  ) { }

  postReport(data: Report): void {
    var url = this.apiUrl + 'reports';
    if (environment.debug) console.warn('Sending POST request to: ' + url);
    this._http.post<{ message: string; errcode: string }>(url, data).subscribe(
      response => {
        if (environment.debug) console.warn('Response from server: ' + response.message);
        window.alert(response.message);
        this.postReportResponse.next(response);
      },
      error => {
        if (environment.debug) console.warn(error);
        window.alert(error.error.message);
      }
    );
  }

  postReportListener(data: Report) {
    this.postReport(data);
    return this.postReportResponse.asObservable();
  }

  getAllReports() {
    var url = this.apiUrl + 'reports';
    if (environment.debug) console.warn('Sending GET request to: ' + url);
    this._http.get<Report[]>(url, {observe: 'response'}).subscribe(response => {
      // TODO: error handling
      if (environment.debug) console.log('reportService -> getAllReports() response: ', response);
      if (response.status == 200) {
        if (response.body) {
          this.previousReports = response.body;
        } else {
          this.previousReports = [];
        }
        this.previousReportsSubject.next([...this.previousReports]);
      } else if (response.status == 401) {
        this.authService.logout();
      } else {
        console.log(response);
        alert(`${response.status}: ${response.statusText}`);
      }
    }, error => {
      if (environment.debug) console.log('reportService -> getAllReports() error: ', error);
      if (error.status == 401) {
        this.loadingService.switchLoading(false);
        this.authService.logout();
      } else {
        console.log(error);
        alert(`${error.status}: ${error.message}`);
      }
      debugger;
    });
  }

  getAllReportsListener() {
    this.getAllReports();
    return this.previousReportsSubject.asObservable();
  }
}
