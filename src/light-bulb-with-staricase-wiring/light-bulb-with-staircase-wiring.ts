import { combineLatest, map, Observable, skip, startWith } from 'rxjs';

export function lightBulbWithStaircaseWiring(
    switch1$: Observable<boolean>,
    switch2$: Observable<boolean>
): Observable<boolean> {
    return combineLatest([
        switch1$.pipe(startWith(false)),
        switch2$.pipe(startWith(false)),
    ]).pipe(
        map(([s1, s2]) => s1 !== s2),
        skip(1)
    );
}
