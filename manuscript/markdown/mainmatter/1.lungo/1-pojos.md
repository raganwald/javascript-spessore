## Plain Old JavaScript Objects {#objects}

In JavaScript, an object is a map from names to values. Tradition would have us call objects that don't contain any functions "POJOs," Plain Old JavaScript Objects.

The most common syntax for creating an object is called a "literal object expression:"

    { year: 2012, month: 6, day: 14 }

Two objects created this way have differing identities:

    { year: 2012, month: 6, day: 14 } === { year: 2012, month: 6, day: 14 }
      //=> false

Objects use `[]` to access the values by name, using a string:

    { year: 2012, month: 6, day: 14 }['day']
      //=> 14

Names in literal object expressions needn't be alphanumeric strings. For anything else, enclose the label in quotes:

    { 'first name': 'reginald', 'last name': 'lewis' }['first name']
      //=> 'reginald'

If the name is an alphanumeric string conforming to the same rules as names of variables, there's a simplified syntax for accessing the values:

    { year: 2012, month: 6, day: 14 }['day'] ===
        { year: 2012, month: 6, day: 14 }.day
      //=> true

Like all containers, objects can contain any value, including functions or other containers:

    var Mathematics = {
      abs: function (a) {
             return a < 0 ? -a : a
           }
    };

    Mathematics.abs(-5)
      //=> 5

Funny we should mention `Mathematics`. JavaScript provides a global environment that contains some existing object that have handy functions you can use. One of them is called `Math`, and it contains functions for `abs`, `max`, `min`, and many others. Since it is always available, you can use it in any environment provided you don't shadow `Math`.

    Math.abs(-5)
      //=> 5
