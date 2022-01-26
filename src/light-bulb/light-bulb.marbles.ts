import { TestScheduler } from 'rxjs/testing';
import { lightBulb } from './light-bulb';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

test('should light the bulb when switch is on', () => {
    testScheduler.run(({ hot, expectObservable }) => {
        const switch$ = hot('i', { i: true });

        const result$ = lightBulb(switch$);

        expectObservable(result$).toBe('i', { i: true });
    });
});
