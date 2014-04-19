## Accessors

The Java and Ruby folks are very comfortable with a general practice of not allowing objects to modify each other's properties. They prefer to write *getters and setters*, functions that do the getting and setting. If we followed this practice, we might write:

    var mutableAmount = (function () {
      var _dollars = 0;
      var _cents = 0;
      return immutable({
        setDollars: function (amount) {
          return (_dollars = amount);
        },
        getDollars: function () {
          return _dollars;
        },
        setCents: function (amount) {
          return (_cents = amount);
        },
        getCents: function () {
          return _cents;
        }
      });
    })();

    mutableAmount.getDollars()
      //=> 0

    mutableAmount.setDollars(420);

    mutableAmount.getDollars()
      //=> 420

We've put functions in the object for getting and setting values, and we've hidden the values themselves in a *closure*, the environment of an [Immediately Invoked Function Expression][iife] ("IIFE").

[iife]: https://en.wikipedia.org/wiki/Immediately-invoked_function_expression

Of course, this amount can still be mutated, but we are now mediating access with functions. We could, for example, enforce certain validity rules:

    var mutableAmount = (function () {
      var _dollars = 0;
      var _cents = 0;
      return immutable({
        setDollars: function (amount) {
          if (amount >= 0 && amount === Math.floor(amount))
            return (_dollars = amount);
        },
        getDollars: function () {
          return _dollars;
        },
        setCents: function (amount) {
          if (amount >= 0 && amount < 100 && amount === Math.floor(amount))
            return (_cents = amount);
        },
        getCents: function () {
          return _cents;
        }
      });
    })();

    mutableAmount.setDollars(-5)
      //=> undefined

    mutableAmount.getDollars()
      //=> 0

Immutability is easy, just leave out the "setters:"

    var rentAmount = (function () {
      var _dollars = 420;
      var _cents = 0;
      return immutable({
        getDollars: function () {
          return _dollars;
        },
        getCents: function () {
          return _cents;
        }
      });
    })();

    mutableAmount.setDollars(-5)
      //=> undefined

    mutableAmount.getDollars()
      //=> 0

### using accessors for properties

Languages like Ruby allow you to write code that looks like you're doing direct access of properties but still mediate access with functions. JavaScript allows this as well. Let's revisit `Object.defineProperties`:

    var mediatedAmount = (function () {
      var _dollars = 0;
      var _cents = 0;
      var amount = {};
      Object.defineProperties(amount, {
        dollars: {
          enumerable: true,
          set: function (amount) {
            if (amount >= 0 && amount === Math.floor(amount))
              return (_dollars = amount);
          },
          get: function () {
            return _dollars;
          }
        },
        cents: {
          enumerable: true,
          set: function (amount) {
            if (amount >= 0 && amount < 100 && amount === Math.floor(amount))
              return (_cents = amount);
          },
          get: function () {
            return _cents;
          }
        }
      });
      return amount;
    })();
      //=>
        { dollars: [Getter/Setter],
          cents: [Getter/Setter] }

    mediatedAmount.dollars = 600;

    mediatedAmount.dollars
      //=> 600

    mediatedAmount.cents = 33.5

    mediatedAmount.cents
      //=> 0

We can leave out the setters if we wish:

    var mediatedImmutableAmount = (function () {
      var _dollars = 420;
      var _cents = 0;
      var amount = {};
      Object.defineProperties(amount, {
        dollars: {
          enumerable: true,
          get: function () {
            return _dollars;
          }
        },
        cents: {
          enumerable: true,
          get: function () {
            return _cents;
          }
        }
      });
      return amount;
    })();

    mediatedImmutableAmount.dollars = 600;

    mediatedImmutableAmount.dollars
      //=> 420

Once again, the failure is silent. Of course, we can change that:

    var noisyAmount = (function () {
      var _dollars = 0;
      var _cents = 0;
      var amount = {};
      Object.defineProperties(amount, {
        dollars: {
          enumerable: true,
          set: function (amount) {
            if (amount !== _dollars)
              throw new Error("You can't change that!");
          },
          get: function () {
            return _dollars;
          }
        },
        cents: {
          enumerable: true,
          set: function (amount) {
            if (amount !== _cents)
              throw new Error("You can't change that!");
          },
          get: function () {
            return _cents;
          }
        }
      });
      return amount;
    })();

    noisyAmount.dollars = 500
      //=> Error: You can't change that!

