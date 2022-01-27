RxJS Marble testing is a topic about which I heard quite some time ago for the first time. Since then I had a feeling
that it's a big thing, that it might simplify testing, but somehow I was always put off. Reading the docs for several seconds made
me feel stupid and decide to postpone the learning till next time. Majority of people whom I talked about it to felt similar.

The aim of this article is to show you that marbles don't bite, and they are not as difficult as they seem at the very first glance.

## Setup

In our code snippets we are going to refer to a light switch/switches and a light bulb. We are going to write code allowing us to switch a bulb on and off. We are going to use `i` to represent a high state, and `o` for low state, boolean true and false respectively.
* `true`: switch or bulb is ON
* `false`: switch or bulb is OFF

## Lighting the bulb

We have a stream of booleans that imitate a switch and a function that lights the bulb. Pretty straightforward:

```
export function lightBulb(switch1$: Observable<boolean>): Observable<boolean> {
    return switch1$;
}
```

## Unit test (no marbles yet)

Now lets try to write a unit test that would check if our function works as expected. Being afraid of marbles, we write sth like this:

```
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
```
The problem with this test is that we can't read it from top to bottom. First we subscribe to the observable `lightBulb` returns,
and a few lines below, we `next` the `switch$` subject. It's subscribe block in the middle of the test where we put the assertion. This does not seem right.

## Tiny bit of setup for marble test

Let's take our function and test it using RxJS Marbles. Before we start though, we need to copy a tiny bit of boilerplate code
and put it in our test file.

Sidenote: This looks slightly different from what we see in RxJS docs, Jest being used here as a testing library.

```
const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});
```

We are instatiating a testScheduler object. It will allow us to run asynchronous code synchronously, using virtual time.

## Unit test with marbles

Now we are ready to write our first marble test. We are going to refactor our previous test, so that it was doing the same thing, but with RxJS marbles.

```
test('should light the bulb when switch is on', () => {
    testScheduler.run(({ hot, expectObservable }) => {
        const switch$ = hot('i', { i: true });

        const result$ = lightBulb(switch$);

        expectObservable(result$).toBe('i', { i: true });
    });
});
```

First thing you probably noticed is that we are executing a run method on `testScheduler` object. We are providing it with a callback function, that takes `helpers` object parameter. From that object we are going to destructure some of the functions used for marbles testing.

Next, the way we create a `switch$` observable is different. Now instead of assigning a `Subject` instance to it, we use a `hot` helper function destructured from a helper object. `Subject` is a hot Observable, this is why we used it in our snippet.

In `hot` function's parameters we define what and how (with a string marble diagram) our observable should behave. We say that it should emit high state 'i' (could be any other letter), and in the second parameter, we define a dictionary, where we say that 'i' stands for 'true', i.e. switch is on.

Once that is done, we pass our observable as a parameter to `lightBulb` function, the same way as in non-marble test. Now we need a way to assess whether what function returns is what we expect. For that we use 'expectObservable' function. And there we say that what 'result$' returns, should be a stream that emits one thing: 'i', and it's value should be true.

## Adding more blocks to the test

As you can see route to writing our first marble test was not that rocky, now let's change our requirement. The light bulb should lighten up 10 ms after switch has been turned on. Without marbles, we would have to introduce fakeTimers and waits. Look how easy it gets with marbles.

```
test('should light the bulb after 10ms delay', () => {
    testScheduler.run(({ hot, expectObservable }) => {
        const switch$ = hot('i', { i: true });

        const result$ = lightBulb(switch$);

        expectObservable(result$).toBe('----------i', { i: true });
    });
});
```

We changed just a single line of code, adding 10 dashes. Each dash stands for a single millisecond. It means that observable doesn't do anything for first 10 milliseconds, after that it emits `i`, that stands for `true`. If we feel that ten dashes are too verbose, below two lines of code are interchangable:

```
expectObservable(result$).toBe('----------i', { i: true });
// equals to
expectObservable(result$).toBe('10ms i', { i: true });
```

Our tests will fail now, so we need to update `lightBulb` function. Now it should look like this:

```
export function lightBulb(switch1$: Observable<boolean>): Observable<boolean> {
    return switch1$.pipe(delay(10));
}
```

Now let's go one step further. We are going to build a staircase wiring, with two switches and a light bulb that lights up when switches are in opposite positions. Basically it's a XOR logical operation. Just as a reminder a truth table for it:

![XOR operation truth table](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ogolk09usunn6h9g2rse.PNG)

When both switches are in OFF position, the light is OFF too, when we switch one of it to ON position, it lightens up. Then we move the other to ON, and light is OFF. Test for our code could look like this.

```
test('it should light the bulb ON and OFF if switches are switching', () => {
    testScheduler.run(({ hot, expectObservable }) => {
        const switch1$ = hot('---i---o---i', { i: true, o: false });
        const switch2$ = hot('-i---o---i--', { i: true, o: false });
        const expected$ = '   -i-o-i-o-i-o';

        const result$ = lightBulbWithStaircaseWiring(switch1$, switch2$);

        expectObservable(result$).toBe(expected$, { i: true, o: false });
    });
});
```

There are three marble diagrams, representing each observable. Two switches and a light bulb. They are aligned vertically, so that it was easier to figure out what is expected. Time progression goes from left to right. Millisecond after millisecond.


![Observable time progression](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/iz8vrumic1kw7qhr86q8.png)

After 2 ms has passed (marked with a red line), 'switch2' has been set to high state, while 'switch1' hasn't changed (we assume it's falsy), so we expect our light bulb to be lighten up.
After 4 ms has passed, 'switch1' has been set to high state ('switch2' still being high, marked with yellow dotted circle ), this is why we expect our light builb to be off.
Next we change state of another switch, and so on.

## Update of the function

Ok, test is there, now let's write a function we are going to run it against:

```
export function lightBulbWithStaircaseWiring(switch1$: Observable<boolean>, switch2$: Observable<boolean>): Observable<boolean> {
    return combineLatest([switch1$.pipe(startWith(false)), switch2$.pipe(startWith(false))]).pipe(
        map(([s1, s2]) => s1 !== s2),
        skip(1)
    );
}
```

It's taking two streams and combines them together. If values they emitted are different, we return `true` and `false` otherwise. We don't want to wait until all switches are moved, so we do `startWith(false)` on both switches and skip the very first emission.

Just for the sake of comparison, let's have a look at what would the test look like if we were to NOT use marbles:

```
test('it should light the bulb ON and OFF if switches are switching', () => {
    const switch1$ = new Subject<boolean>();
    const switch2$ = new Subject<boolean>();

    const resultArray: boolean[] = [];

    jest.useFakeTimers();

    lightBulbWithStaircaseWiring(switch1$, switch2$).subscribe({
        next: (isLightOn) => {
            resultArray.push(isLightOn);
        },
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
```

The difference is self explanatory.

## Conclusion

Hopefully after reading this article you have a basic understanding of RxJS Marbles and you are now ready to (re)visit RxJS docs to
investigate the subject further. You can also go and check my repo, where you'll find full code examples used in this article and some other examples on testing the observables.


