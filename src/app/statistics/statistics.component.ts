import { Component, OnDestroy, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoadingService } from '../common_services/loading.service';
import { Report } from '../report/report.model';
import { ReportService } from '../report/report.service';
import { ChartData } from './chart-data.model';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  // General variables
  isLoading: boolean;
  loadingSub: Subscription = new Subscription();
  reports: Report[];
  reportsSub: Subscription = new Subscription();
  startingDate = dayjs(new Date(2019,7));

  // Chart Data
  dataToDisplay = {};
  coldData: ChartData[];
  hotData: ChartData[];
  heatData: ChartData[];
  elecData: ChartData[];

  // Chart Settings
  view: any[] = [700, 300];
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Hónap';
  yAxisLabel: string = 'Óraállás';
  timeline: boolean = true;
  colorSchemes = [{
    domain: ['#5C7AEA', '#FF0000']
  },
  {
    domain: ['#C36839']
  },
  {
    domain: ['#1C0C5B']
  }];
  chartTitles = ["Vízórák", "Hőmennyiség", "Villanyóra"]

  constructor(
    private reportService: ReportService,
    private _loading: LoadingService
  ) {
    this.reports = [];
    this.dataToDisplay = [];
    this.coldData = [];
    this.hotData = [];
    this.heatData = [];
    this.elecData = [];
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this._loading.switchLoading(true);
    // Set up subscriptions
    this.loadingSub = this._loading.getServerStatusListener().subscribe(loading => {
      if (environment.debug) console.log('#homeComponent -> loadingSub -> loading=', loading);
      this.isLoading = loading;
    });
    this.reportsSub = this.reportService.getAllReportsListener().subscribe(reports => {
      this.reports = reports;
      // Prepare data
      this.prepareData().then(success => {
        this.isLoading = false;
        this._loading.switchLoading(false);
      });
    });
  }

  prepareData() {
    return new Promise((resolve, reject) => {
      let coldSeries: {name: string, value: number}[] = [];
      let hotSeries: {name: string, value: number}[] = [];
      let heatSeries: {name: string, value: number}[] = [];
      let elecSeries: {name: string, value: number}[] = [];
      this.reports.forEach((r, i, a) => {
        coldSeries.push({
          name: this.startingDate.add(r.nr, 'month').format('YYYY[.] MMMM'),
          value: i > 0 ? r.cold - a[i-1].cold : 0
        });
        hotSeries.push({
          name: this.startingDate.add(r.nr, 'month').format('YYYY[.] MMMM'),
          value: i > 0 ? r.hot - a[i-1].hot : 0
        });
        heatSeries.push({
          name: this.startingDate.add(r.nr, 'month').format('YYYY[.] MMMM'),
          value: i > 0 ? r.heat - a[i-1].heat : 0
        });
        elecSeries.push({
          name: this.startingDate.add(r.nr, 'month').format('YYYY[.] MMMM'),
          value: i > 0 ? r.elec - a[i-1].elec : 0
        });
        if (i == (a.length -1)) {
          // End of the array is reached
          this.dataToDisplay = [
            [{
              name: "Hidegvíz",
              series: coldSeries
            },
            {
              name: "Melegvíz",
              series: hotSeries
            }],
            [{
              name: "Hőmennyiség",
              series: heatSeries
            }],
            [{
              name: "Villanyóra",
              series: elecSeries
            }] 
          ]
          resolve(true)
        }
      })
    })
  }

  ngOnDestroy(): void {
    this.reportsSub.unsubscribe();
    this.loadingSub.unsubscribe();
  }

  onSelect(data: {entries: Array<any>, value: {name: string}}): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: {entries: Array<any>, value: {name: string}}): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: {entries: Array<any>, value: {name: string}}): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

}
