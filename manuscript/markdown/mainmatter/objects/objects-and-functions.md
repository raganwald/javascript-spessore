## Objects and Functions

Since functions are values, objects can have functions as values:

    var allong = require('allong.es');
    var variadic = allong.es.variadic;
    var map = allong.es.map;

    var getAll = variadic( function (object, propertyNames) {
      return map(propertyNames, function (name) { return object[name]; });
    });

    var federalReserve1 = {
      bank: '12',
      processingCentre: '9',
      location: '1',
      toString: function () {
        return getAll(federalReserve1, 'bank', 'processingCentre', 'location').join('');
      }
    };

    var transitNumber1 = {
      federalReserveRouting: federalReserve1,
      abaInstitution: '3167',
      checkDigit: '3',
      toString: function () {
        return getAll(transitNumber1, 'federalReserveRouting', 'abaInstitution', 'checkDigit').join('');
      }
    };

    var account1 = {
      transitNumber: transitNumber1,
      accountNumber: '0114584906',
      toString: function () {
        return account1.transitNumber + '-' + account1.accountNumber;
      }
    }

You can call those functions by referring to them with `.`, and then invoking them with `()`:

    account1.toString()
      //=> '129131673-0114584906'

Functions that are associated with properties are values, we can do whatever we want with them:

    var accountStringifier = account1.toString;

    accountStringifier
      //=> [function]

    accountStringifier()
      //=> 129131673-0114584906'

You have to be careful when you share a single function amongst multiple objects. Watch the 'copypasta' error:

    var amount = {
      dollars: 2,
      cents: 56,
      toString: function () {
        return '$' + amount.dollars + '.' + (amount.cents < 10 ? ('0' + amount.cents) : amount.cents)
      }
    }

    var amount2 = {
      dollars: 1,
      cents: 0,
      toString: function () {
        return '$' + amount.dollars + '.' + (amount.cents < 10 ? ('0' + amount.cents) : amount.cents)
      }
    }

    amount.toString()
      //=> '$2.56'

    amount2.toString()
      //=> '$2.56'

Some simple factoring will help.

    function inDollarsAndCents (amount) {
      return '$' + amount.dollars + '.' + (amount.cents < 10 ? ('0' + amount.cents) : amount.cents);
    };

    var amount = {
      dollars: 2,
      cents: 56,
      toString: function () {
        return inDollarsAndCents(amount);
      }
    }

    var amount2 = {
      dollars: 1,
      cents: 0,
      toString: function () {
        return inDollarsAndCents(amount2);
      }
    }

    amount.toString()
      //=> '$2.56'

    amount2.toString()
      //=> '$1.00'

This is a general principle: *functions that belong to objects really need a reference to the current object to be useful*.

### this

JavaScript provideth:

    function inDollarsAndCents () {
      "use strict";
      return '$' + this.dollars + '.' + (this.cents < 10 ? ('0' + this.cents) : this.cents);
    };

    var amount = {
      dollars: 2,
      cents: 56,
      toString: inDollarsAndCents
    }

    var amount2 = {
      dollars: 1,
      cents: 0,
      toString: inDollarsAndCents
    }

    amount.toString()
      //=> '$2.56'

    amount2.toString()
      //=> '$1.00'

Within a function that is invoked as a property of an object, the environment contains a magic variable, `this`, that refers to the object.

`this` does not refer to the object if we invoke the function in another way. Recall that functions are values we can extract from an object without calling them:

    var stringifier = amount.toString;

    stringifier
      //=> [Function: inDollarsAndCents]

However, invoking a function without a property reference means that we have lost the context provided by `this`:[^global]

    stringifier()
      //=>
        TypeError: Cannot read property 'dollars' of undefined

[^global] If we run without "strict" mode, we get a very unhelpful "global" context that often delays or obfuscates the source of bugs.