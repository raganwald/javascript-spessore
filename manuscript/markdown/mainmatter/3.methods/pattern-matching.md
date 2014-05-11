## Pattern Matching

Meta-methods are often associated with an abstraction for handling messages. In the "aspect-oriented programming" abstraction, methods can be provided with advice that runs before or after the method's body.

There are other abstractions. One of them is "pattern matching." In languages like Haskell, you can define multiple versions of a function's body, each associated with a particular pattern of input, for example:

    factorial :: (Integral a) => a -> a
    factorial 0 = 1
    factorial n = n * factorial (n - 1)

This says that if the input to `factorial` matches the pattern `0`, return 1. Otherwise, return factorial (n - 1). Pattern matching can get very interesting when you combine it with destructuring, such as this hypothetical syntax for defining a `map` function:

    map f, [] = []
    map f, [x] = [f(x)]
    map f, [x, rest...] = [f(x)] + map(rest)

*TODO: A complete rewrite of pattern-matching using a meta-method*
