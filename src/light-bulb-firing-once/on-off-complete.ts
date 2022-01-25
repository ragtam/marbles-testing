import { Observable, take } from 'rxjs';

export function lightTheBulb(
    switch1$: Observable<boolean>
): Observable<boolean> {
    return switch1$.pipe(take(1));
}
