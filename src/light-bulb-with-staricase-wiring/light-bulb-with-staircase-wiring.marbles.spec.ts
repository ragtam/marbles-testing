import { TestScheduler } from 'rxjs/testing';
import { lightBulbWithStaircaseWiring } from "./light-bulb-with-staircase-wiring";
import { Observable } from 'rxjs';

let testScheduler: TestScheduler;

beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
    });
});

test('it should light the bulb if first switch is moved to ON position', () => {
    testScheduler.run(({ cold, expectObservable }) => {
        const switch1$ = cold('--i', { i: true });
        const switch2$ = cold('---') as Observable<boolean>;

        const result$ = lightBulbWithStaircaseWiring(switch1$, switch2$);

        expectObservable(result$).toBe('--i', { i: true });
    });
});

test('it should light the bulb if second switch is moved to ON position', () => {
    testScheduler.run(({ cold, expectObservable }) => {
        const switch1$ = cold('---') as Observable<boolean>;
        const switch2$ = cold('--i', { i: true });

        const result$ = lightBulbWithStaircaseWiring(switch1$, switch2$);

        expectObservable(result$).toBe('--i', { i: true });
    });
});

test('it should light the bulb ON and OFF if switches are switching', () => {
    testScheduler.run(({ cold, expectObservable }) => {
        const switch1$ = cold('---i---o---i', { i: true, o: false });
        const switch2$ = cold('-i---o---i--', { i: true, o: false });
        const expected$ = '           -i-o-i-o-i-o';

        const result$ = lightBulbWithStaircaseWiring(switch1$, switch2$);

        expectObservable(result$).toBe(expected$, { i: true, o: false });
    });
});
