import { Injectable } from '@angular/core';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class LoggingService {
  lastlog: string;

  printLog(message: string) {
    console.log('LoggingService:', message);
    // if (this.lastlog) console.log(this.lastlog);
    this.lastlog = message;
  }
}
