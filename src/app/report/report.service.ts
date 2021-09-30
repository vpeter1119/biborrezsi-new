import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
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
    private _router: Router
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
    this._http.get<Report[]>(url).subscribe(response => {
      // TODO: error handling
      this.previousReports = response;
      this.previousReportsSubject.next([...this.previousReports]);
    });
  }

  getAllReportsListener() {
    this.getAllReports();
    return this.previousReportsSubject.asObservable();
  }
}
