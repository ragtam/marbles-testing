import { Subject } from 'rxjs';
import { lightBulbWithDelay } from './light-bulb-with-delay';

test('should light the bulb with 10ms delay', (done) => {
    const switch$ = new Subject<boolean>();

    jest.useFakeTimers();

    lightBulbWithDelay(switch$).subscribe((isLightOn) => {
        expect(isLightOn).toEqual(true);
        jest.useRealTimers();
        done();
    });

    switch$.next(true);

    jest.advanceTimersByTime(11);
});
