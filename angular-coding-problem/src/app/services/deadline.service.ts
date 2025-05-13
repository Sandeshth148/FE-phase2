import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DeadlineService {
  getDeadline(): Observable<{ secondsLeft: number }> {
    // Simulate realistic backend call with slight delay
    return of({ secondsLeft: 120 }).pipe(delay(300));
  }
}
