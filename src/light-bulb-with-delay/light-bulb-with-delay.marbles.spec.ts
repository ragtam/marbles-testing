import { TestScheduler } from 'rxjs/testing';
import { lightBulbWithDelay } from './light-bulb-with-delay';

let testScheduler: TestScheduler;

beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
    });
});

test('should light the bulb with 10ms delay #1', () => {
    testScheduler.run(({ cold, expectObservable }) => {
        const switch$ = cold('i', { i: true });

        const result$ = lightBulbWithDelay(switch$);

        expectObservable(result$).toBe('----------i', { i: true });
    });
});

test('should light the bulb with 10ms delay #2', () => {
    testScheduler.run(({ cold, expectObservable }) => {
        const switch$ = cold('i', { i: true });

        const result$ = lightBulbWithDelay(switch$);

        expectObservable(result$).toBe('10ms i', { i: true });
    });
});
