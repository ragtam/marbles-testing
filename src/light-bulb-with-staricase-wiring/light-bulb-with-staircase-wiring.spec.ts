import { Subject } from "rxjs";
import { lightBulbWithStaircaseWiring } from "./light-bulb-with-staircase-wiring";

afterEach(() => {
    jest.useRealTimers();
});

test('it should light the bulb ON and OFF if switches are switching', () => {
    const switch1$ = new Subject<boolean>();
    const switch2$ = new Subject<boolean>();

    const resultArray: boolean[] = [];

    jest.useFakeTimers();

    lightBulbWithStaircaseWiring(switch1$, switch2$).subscribe({
        next: isLightOn => {
            resultArray.push(isLightOn);
        }
    });

    switch1$.next(true);
    jest.advanceTimersByTime(1);
    switch2$.next(true);
    jest.advanceTimersByTime(1);
    switch1$.next(false);
    jest.advanceTimersByTime(1);
    switch2$.next(false);
    jest.advanceTimersByTime(1);
    switch1$.next(true);
    jest.advanceTimersByTime(1);
    switch2$.next(true);

    expect(resultArray).toEqual([true, false, true, false, true, false]);
});
