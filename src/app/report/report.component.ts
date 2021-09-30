import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ReportService } from './report.service';
import { Subscription } from 'rxjs';
import { Report } from './report.model';
import * as dayjs from 'dayjs';
import 'dayjs/locale/hu';
import { LoadingService } from '../common_services/loading.service';
import { environment } from 'src/environments/environment';

dayjs.locale('hu');
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {

  reportMode: string = 'input';
  authenticated: boolean = false;
  url: string = '';
  newReport: Partial<Report> = {};
  allReports: Report[] = [];
  allReportsSub: Subscription = new Subscription;
  oldReport: Partial<Report> = {};
  diffData: Partial<Report> = {};
  diffIsValid: boolean = false;
  icons = {};
  startingDate = dayjs(new Date(2019, 7));
  currentReportPeriodIndex: number = 0;
  currentReportPeriod: string = "";
  isLoading: boolean = false;
  loadingSub: Subscription = new Subscription();

  constructor(
    public _router: Router,
    private authService: AuthService,
    private reportService: ReportService,
    private _http: HttpClient,
    private _fb: FormBuilder,
    private _loading: LoadingService
  ) { }

  reportForm = this._fb.group({
    cold: [null,Validators.required],
    hot: [null, Validators.required],
    heat: [null],
    elec: [null, Validators.required],
    isHeating: [false,Validators.required],
  });

  ngOnInit(): void {
    this.loadingSub = this._loading.getLoadingStatus()
    .subscribe(status => {
      this.isLoading = status;
    });
    this._loading.switchLoading(true);
    this.authenticated = this.authService.authStatus;
    this.allReportsSub = this.reportService.getAllReportsListener()
    .subscribe(reports => {
      this.allReports = reports;
      this.oldReport = this.allReports[(this.allReports.length - 1)];
      if (environment.debug) console.log('#reportComponent -> ngOnInit() this.oldReport: ',this.oldReport);
      this.currentReportPeriodIndex = this.oldReport.nr ? this.oldReport.nr+1 : 0;
      if (environment.debug) console.log('#reportComponent -> ngOnInit() this.currentReportPeriodIndex: ',this.currentReportPeriodIndex);
      this.currentReportPeriod = this.startingDate.add(this.currentReportPeriodIndex, 'month').format("MMMM, YYYY");
      if (environment.debug) console.log('#reportComponent -> ngOnInit() this.startingDate: ',this.startingDate);
      if (environment.debug) console.log('#reportComponent -> ngOnInit() this.currentReportPeriod: ',this.currentReportPeriod);
      if (environment.debug) console.warn("Report component initiated.");
      this._loading.switchLoading(false);
    });
  }

  ngOnDestroy(): void {
    this.allReportsSub.unsubscribe();
  }

  onSubmit(): void {
    this.newReport = this.reportForm.value;
    this.calculateDiff();
    this.reportMode = 'confirm';
  }

  onReport() {
    this._loading.switchLoading(true);
    if (environment.debug) console.warn('Making POST request to: ' + this.url);
    this.reportService.postReportListener(this.reportForm.value)
    .subscribe(res => {
      if (res) {
        if (environment.debug) console.warn(res.message);
        this.reportMode = 'finished';
        this._loading.switchLoading(false);
      }
    }, err => {
      if (err) {
        if (environment.debug) console.warn(err);
        this._loading.switchLoading(false);
      }
    });
  }

  resetAll() {
    this.reportMode = 'input';
    this.reportForm.reset();
  }

  calculateDiff() {
    this.diffIsValid = false;
    var heatDiff;
    if (this.reportForm.value.heat == 0) {
      heatDiff = 0;
    } else {
      heatDiff = this.reportForm.value.heat - (this.oldReport.heat || 0);
    }
    this.diffData = {
      cold: ((this.reportForm.value.cold - (this.oldReport.cold || 0))),
      hot: ((this.reportForm.value.hot - (this.oldReport.hot || 0))),
      heat: heatDiff,
      elec: (this.reportForm.value.elec - (this.oldReport.elec || 0)),
    }
    if (environment.debug) console.log('#reportComponent -> calculateDiff() this.diffData: ', this.diffData);
    if (this.diffData.cold != undefined && this.diffData.cold >= 0) {
      if (environment.debug) console.log('#reportComponent -> calculateDiff() this.diffIsValid: ', this.diffIsValid);
      this.diffIsValid = true;
    }
  }

  applyPrevious(field: string): boolean {
    if (!this.oldReport[field]) {
      return false;
    } else {
      this.reportForm.controls[field].setValue(this.oldReport[field]);
      return true;
    }
  }

}
