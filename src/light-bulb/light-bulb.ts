import { Observable } from 'rxjs';

export function lightBulb(
    switch1$: Observable<boolean>
): Observable<boolean> {
    return switch1$;
}
