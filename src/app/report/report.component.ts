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
  dataSource: Partial<[{name: string, value: number, diff: number}]>;
  displayedColumns = ['name', 'value', 'diff'];

  constructor(
    public _router: Router,
    private authService: AuthService,
    private reportService: ReportService,
    private _http: HttpClient,
    private _fb: FormBuilder,
    private _loading: LoadingService
  ) {
    this.dataSource = [];
  }

  reportForm = this._fb.group({
    cold: [{value: null, disabled: this.isLoading}, [Validators.required]],
    hot: [{value: null, disabled: this.isLoading}, [Validators.required]],
    heat: [{value: null, disabled: this.isLoading}],
    elec: [{value: null, disabled: this.isLoading}, [Validators.required]],
    isHeating: [{value: false, disabled: this.isLoading}, [Validators.required]],
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
    this.valiDateFormData();
    this.calculateDiff();
    this.dataSource.push({
      name: 'Hidegvíz',
      value: this.reportForm.value.cold,
      diff: this.diffData.cold || 0
    });
    this.dataSource.push({
      name: 'Melegvíz',
      value: this.reportForm.value.hot,
      diff: this.diffData.hot || 0
    });
    this.dataSource.push({
      name: 'Hőmennyiség',
      value: this.reportForm.value.heat,
      diff: this.diffData.heat || 0
    });
    this.dataSource.push({
      name: 'Villanyóra',
      value: this.reportForm.value.elec,
      diff: this.diffData.elec || 0
    });
    if (environment.debug) console.log('#reportComponent -> onSubmit() -> this.dataSource: ', this.dataSource);
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
  
  valiDateFormData(): void {
    var currentValues = {
      cold: this.reportForm.controls['cold'].value,
      hot: this.reportForm.controls['hot'].value,
      heat: this.reportForm.controls['heat'].value,
      elec: this.reportForm.controls['elec'].value,
    };
    // Cold
    if (this.oldReport.cold && (currentValues.cold > (this.oldReport.cold * 10))) {
      this.reportForm.controls['cold'].setValue(currentValues.cold * 0.001);
    }
    // Hot
    if (this.oldReport.hot && (currentValues.hot > (this.oldReport.hot * 10))) {
      this.reportForm.controls['hot'].setValue(currentValues.hot * 0.001);
    }
    // Heat
    if (this.oldReport.heat && (currentValues.heat < (this.oldReport.heat * 0.1))) {
      this.reportForm.controls['heat'].setValue(currentValues.heat * 1000);
    }
    // Elec
    if (this.oldReport.elec && (currentValues.elec > (this.oldReport.elec * 10))) {
      this.reportForm.controls['elec'].setValue(String(currentValues.elec).slice(0, -1));
    }
  }
  
}
