## Plain Old JavaScript Objects {#objects}

In JavaScript, objects are data structures that provide a map from names to values. Many other languages call these "dictionaries" or "associative arrays." Some call them "Hashes," an abbreviation for "HashMap"  or "Hash Table." In most cases, the word [Dictionary][aa] describes how it works, while terms like [HashMap or Hash Table][HashMap] describe dictionary implementations that are optimized for fast lookup.

[aa]: https://en.wikipedia.org/wiki/Dictionary_(data_structure)
[HashMap]: https://en.wikipedia.org/wiki/Hash_table

The most common syntax for creating JavaScript objects is called a "literal object expression:"

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

Like all containers, objects can contain any value, including functions:

    var Arithmetic = {
      abs: function abs (number) {
        return number < 0 ? -number : number;
      },
      power: function power (number, exponent) {
        if (exponent <= 0) {
          return 1;
        }
        else return number * power(number, exponent-1);
      }
    };

    Arithmetic.abs(-5)
      //=> 5

### namespaces

Given that JavaScript objects are dictionaries makes them useful for creating [namespaces][namespace]:

I> In general, a namespace is a container for a set of identifiers (also known as symbols, names). Namespaces provide a level of indirection to specific identifiers, thus making it possible to distinguish between identifiers with the same exact name. For example, a surname could be thought of as a namespace that makes it possible to distinguish people who have the same first name. In computer programming, namespaces are typically employed for the purpose of grouping symbols and identifiers around a particular functionality.--[Wikipedia][namespace]

[namespace]: https://en.wikipedia.org/wiki/Namespace

Napespaces are typically stateless: They contain functions and/or other constants, but not variables intended to be updated directly or indirectly. Namespaces are also typically "closed for extension:" Functions and constants are not added to a namespace dynamically.

The prime purpose of a namespace is to provide disambiguation for a set of related named constants and functions. `Arithmetic` is an example of a namespace. It could be handy: If we were writing a fitness application, we might want to use a variable called `abs` for another purpose, and we wouldn't want to accidentally shadow or overwrite our function for determining the absolute value of a number.

### pojos as data structures

Namespaces are typically created statically and named. But objects need not by named, and they need not be static. Dictionaries can be used when we need a dynamic data structure that has arbitrary key-value pairs added and removed, and they can also be used to implement data structures (or parts of data structures) with named components.

Here're some functions that operate on a dictionary:

~~~~~~~~
function isNameAvailable (usersByName, name) {
  return usersByName[name] === undefined;
}

function addUser (usersByName, user) {
  if (isNameAvailable(user.name)) {
    usersByName[name] = user;
    return user;
  }
  else throw "" + use.name + " already exists";
}
~~~~~~~~

In contrast, here's a data structure implemented with a dictionary, the "cons cell" we saw earlier:

~~~~~~~~
function cons (value, list) {
  return {
    _a: value,
    _d: list
  };
}
~~~~~~~~

We're using a dictionary as an implementation technique, but we are really writing functions that operate on a tuple with elements named `_a` and `_d`. A lot of "objects" in JavaScript are data structures with named elements. They happened to be implemented with objects that act as dictionaries, but they aren't intended to be used as arbitrary key-value stores.

K> JavaScript objects are dictionaries. Dictionaries can be used to make data structures: The distinction is in how there are intended to be used. If an object is a container for arbitrary key-value pairs, it is a dictionary. If an object is a container for specific, named values, it's a custom data structure that is implemented with a dictionary.