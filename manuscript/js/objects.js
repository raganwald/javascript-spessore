// what is an object?

var counter = new Object({
                value: 0,
                increment: function () {
                  return ++this.value;
                }
              });

counter.increment();
  //=> 1

counter.increment();
  //=> 2

counter.value = 100

counter.increment();
  //=> 101

var counter = new Object({
                value: 0,
                increment: function (arg) {
                  var by = arg == null
                           ? 1
                           : arg.by;
                  return (this.value = this.value + by);
                }
              });

counter.increment();
  //=> 1

counter.increment();
  //=> 2

counter.increment({by: 3})
  //=> 5

// Degenerate Objects

Math.max(1, 5, 4)
  //=> 5
Math.min(1, 5, 4)
  //=> 1

// Math is a degenerate object

Math instanceof Object
  //=> true

var a_to_i = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
}

Math.numerology = function (name) {
  var numbers = name.
    toUpperCase().
    split('').
    map(function (letter) {
      return a_to_i[letter];
    });
  while (numbers.length > 1) {
    numbers = numbers.
      reduce(function (a, b) { return a + b; }).
      toString().
      split('').
      map(function (c) {
        return parseInt(c, 10);
      });
  }
  return numbers[0];
};