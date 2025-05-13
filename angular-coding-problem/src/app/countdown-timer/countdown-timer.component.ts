import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeadlineService } from '../services/deadline.service';
import { interval, switchMap, takeWhile, map, startWith } from 'rxjs';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss'],
})
/**
 * Standalone component that displays a countdown timer using seconds retrieved from a service.
 */
export class CountdownTimerComponent {
  private deadlineService = inject(DeadlineService);

  /**
   * Observable emitting the number of seconds left, updated every second until zero.
   */
  secondsLeft$ = this.deadlineService.getDeadline().pipe(
    switchMap((response) =>
      interval(1000).pipe(
        startWith(0),
        map((i) => response.secondsLeft - i),
        takeWhile((seconds) => seconds >= 0)
      )
    )
  );
}
