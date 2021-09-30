import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Subject} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  apiUrl = environment.apiUrl;

  isLoading: boolean = true;
  loadingStatusListener = new Subject<boolean>();
  serverIsUp: boolean = false;
  serverStatusListener = new Subject<boolean>();

  constructor(
    private _http: HttpClient
  ) { }

  switchLoading(b: boolean) {
    this.isLoading = b;
    this.loadingStatusListener.next(this.isLoading);
  }

  getLoading() {
    return this.isLoading;
  }

  getLoadingStatus() {
    return this.loadingStatusListener.asObservable();
  }

  getServerStatus() { //pings the server to wake up
    var url = (this.apiUrl + "status");
    this._http.get<{running:boolean}>(url)
    .subscribe(status => {
      if (status.running == true) {
        if (environment.debug) console.warn(status);
        if (environment.debug) console.warn("Server is up.");
        this.serverIsUp = status.running;
        this.serverStatusListener.next(this.serverIsUp);
      } else {
        if (environment.debug) console.warn(status);
        this.serverIsUp = false;
        this.serverStatusListener.next(this.serverIsUp);
      }
    }, error => {
      if (environment.debug) console.warn(error);
      this.serverIsUp = false;
      this.serverStatusListener.next(this.serverIsUp);
      //in this case, we should also disable the frontend functions and display a message that server is down
    });
  }

  getServerStatusListener() {
    this.getServerStatus;
    return this.serverStatusListener.asObservable();
  }
}
