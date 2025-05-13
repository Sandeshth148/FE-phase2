import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { CountdownTimerComponent } from './countdown-timer.component';
import { DeadlineService } from '../services/deadline.service';
import { of } from 'rxjs';

describe('CountdownTimerComponent', () => {
  let component: CountdownTimerComponent;
  let fixture: ComponentFixture<CountdownTimerComponent>;
  let mockDeadlineService: jasmine.SpyObj<DeadlineService>;

  beforeEach(async () => {
    mockDeadlineService = jasmine.createSpyObj('DeadlineService', [
      'getDeadline',
    ]);
    mockDeadlineService.getDeadline.and.returnValue(of({ secondsLeft: 3 }));

    await TestBed.configureTestingModule({
      imports: [CountdownTimerComponent],
      providers: [{ provide: DeadlineService, useValue: mockDeadlineService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CountdownTimerComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should count down from the mocked secondsLeft', fakeAsync(() => {
    fixture.detectChanges();
    const result: number[] = [];

    component.secondsLeft$.subscribe((val) => {
      if (
        typeof val === 'number' &&
        (result.length === 0 || result[result.length - 1] !== val)
      ) {
        result.push(val);
      }
    });

    tick(4000); // Enough time for 3 -> 0
    expect(result).toEqual([3, 2, 1, 0]);

    discardPeriodicTasks(); // ✅ Clean up all interval timers
  }));
});
