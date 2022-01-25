import { delay, Observable } from 'rxjs';

export function lightBulbWithDelay(
    switch1$: Observable<boolean>
): Observable<boolean> {
    return switch1$.pipe(delay(10));
}
