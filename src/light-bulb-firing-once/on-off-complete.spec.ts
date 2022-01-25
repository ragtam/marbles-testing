import { Subject } from 'rxjs';
import { lightTheBulb } from './on-off-complete';

test('should light the bulb and then die (complete)', () => {
    const switch$ = new Subject<boolean>();
    let isComplete = false;

    lightTheBulb(switch$).subscribe({
        complete: () => {
            isComplete = true;
        },
    });

    switch$.next(true);

    expect(isComplete).toEqual(true);
});
