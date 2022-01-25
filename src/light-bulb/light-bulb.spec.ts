import { Subject } from 'rxjs';
import { lightBulb } from './light-bulb';

test('should light the bulb when switch is on', (done) => {
    const switch$ = new Subject<boolean>();

    lightBulb(switch$).subscribe({
        next: (isLightOn) => {
            expect(isLightOn).toEqual(true);
            done();
        },
    });

    switch$.next(true);
});
