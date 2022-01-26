# RxJS Marble testing for dummies
# Zero to "I am no longer scared" guide to RxJS Marble testing

RxJS Marble testing is a topic about which I heard quite some time ago for the first time. Since then I had a feeling
that it's a big thing, that it might simplify testing, but somehow I was always put off. Reading the docs for several seconds made
me feel 'I am unable to comprehend that' and decide to postpone the learning till next time. Majority of people whom I talked about it to felt similar.

One day a colleague called me asking if I can help him with marble testing... I was not much of help for him then, but it made me
face the problem. Now it no longer seem so intimidating to me. The aim of this article is to show you that marbles don`t bite,
and they are not as difficult as they seem at the very first glance.

In our code snippets we are going to refer to a light switch/switches and a light bulb. We are going to use `i` to represent a high state, and `o` for low state, 
boolean true and false respectively. 

First case is pretty straightforward. We have a stream of booleans that imitate a switch and a function that lights the bulb.

```
export function lightBulb(switch1$: Observable<boolean>): Observable<boolean> {
    return switch1$;
}
```

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

The problem with this test is that we can't read it from top to bottom. First we subscribe to the observable 'lightBulb' returns, 
and a few lines below, we `next` the `switch$` subject. It's subscribe block in the middle of the test where we put the assertion. This does not seem right.

Let's take our function and test it using RxJS Marbles. Before we start though, we need to copy a tiny bit of boilerplate code 
and put it in our test file. Sidenote: This looks slightly different from what we see in rxjs docs, Jest being used here as a testing library.

```
const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});
```

TODO: Explain what this snippet does

Now we are ready to write our first marble test.

```
test('should light the bulb when switch is on', () => {
    testScheduler.run(({ hot, expectObservable }) => {
        const switch$ = hot('i', { i: true });

        const result$ = lightBulb(switch$);

        expectObservable(result$).toBe('i', { i: true });
    });
});
```

First thing you probably noticed is that we are executing a run method on test scheduler object. (TODO: Explain why). 

Next, the way we create a switch$ is different. Now instead of assigning a Subject instance to it, we use helper function destructured from a parameter. 
Subject is a hot Observable, this is why we used it in our snippet. In 'hot' parameters we define what and how our Observable should behave. 
We say that it should emit 'i', and in the second parameter, we define a dictionary, where we say that 'i' stands for 'true', i.e. switch is on (high state).
Once that is done, we pass our freshly baked Observable as a parameter of our lightBulb function. 
Now we need a way to assess, whether what it returned is what we expected. For that we use 'expectObservable' function. And there we say, that what 'result$' returns,
should be a stream that emits one thing, 'i', and its value should be true.

As you can see route to writing our first marble test was not that rocky, now let's change our requirement. The light bulb should light up 10ms after switch was turned on. 
Without marbles, we would have to introduce fakeTimers and waits. Look how easy it gets with marbles.

```
test('should light the bulb after 10ms delay', () => {
    testScheduler.run(({ cold, expectObservable }) => {
        const switch$ = cold('i', { i: true });

        const result$ = lightBulb(switch$);

        expectObservable(result$).toBe('----------i', { i: true });
    });
});
```

We changed a single line of code, adding 10 dashes. Each dash stands for a single millisecond. 
It means that observable doesn't emit anything for first 10 milliseconds, after that emits i, that stands for true, but this we already know. 
If we feel that ten dashes is too verbose, those two lines of code are interchangable: 

```
expectObservable(result$).toBe('----------i', { i: true });
// equals to
expectObservable(result$).toBe('10ms i', { i: true });
```

Our tests will fail now, so we need to update our `lightBulb` function. Now it should look like this:

```
export function lightBulb(switch1$: Observable<boolean>): Observable<boolean> {
    return switch1$.pipe(delay(10));
}
```

Now let's go one step further. We are going to build a staircase wiring, with two switches and a light bulb that lights up when switches are
in opposite positions. When both switches are in OFF position, the light is OFF too, when we move one of it to ON position, it lights up. 
Then we move the other to ON, and light goes off. Basically it's a XOR logical operation. TODO shall I paste truth table for it?

```
test('it should light the bulb ON and OFF if switches are switching', () => {
    testScheduler.run(({ cold, expectObservable }) => {
        const switch1$ = cold('---i---o---i', { i: true, o: false });
        const switch2$ = cold('-i---o---i--', { i: true, o: false });
        const expected$ = '    -i-o-i-o-i-o';

        const result$ = lightBulbWithStaircaseWiring(switch1$, switch2$);

        expectObservable(result$).toBe(expected$, { i: true, o: false });
    });
});
```

Let's have a look at our marble diagrams. There are three of them, representing each observable. Two switches and a light bulb. 
They are aligned vertically, so that it was easier to figure out what is expected. Time progression goes from left to right. Millisecond after millisecond.

// Observables time progression.png

After 2 ms has passed, 'switch2' has been set to high state, while 'switch1' hasn't changed, so we expect our light bulb to be lighten up.
After 4 ms has passed, 'switch1' has been set to high state ( 'switch2' still being high ), this is why we expect our light builb to be off.
Next we change state of another switch, and so on.

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
