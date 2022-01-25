import { TestScheduler } from 'rxjs/testing';
import { lightTheBulb } from './on-off-complete';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

// you`ll probably notice, that tests will fail if run from whole file, but each test run separately is going to run fine.
// this is the solution: https://github.com/ReactiveX/rxjs/issues/2757

test('should light the bulb and then die (complete)', () => {
    testScheduler.run(({ cold, expectObservable }) => {
        const switch$ = cold('i', { i: true });

        const result$ = lightTheBulb(switch$);

        expectObservable(result$).toBe('(i|)', { i: true });
    });
});
