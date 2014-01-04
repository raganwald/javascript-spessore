## Objects and References

*The material in this preamble should be familiar to the working JavaScript programmer, so feel free to skip it if you are in a hurry. However, it never hurts to review the "obvious:" Prefetching the basics into your L2 cache can improve learning performance when tackling more advanced material*.

This expression evaluates to an object:

    {}
      //=> {}

So does this:

    Object.create(null)
      //=> {}

This one lets us define properties in a familiar way:

    var acct = {
      transitNumber: '129131673',
      accountNumber: '0114584906'
    }

There is a syntax for accessing property contents:

    acct.accountNumber
      //=> '0114584906'

We can also use it to assign properties directly:

    var cheque = {};
    cheque.number = 1;

We can write a function to extend one object with the properties of another:

<<(js/extend.js)

    var account = {
      transitNumber: '129131673',
      accountNumber: '0114584906'
    };

    extend(account, {
      type: 'chequing',
      name: 'slush fund'
    });

    account.name
      //=> 'slush fund'

JavaScript properties must be named with strings, but can have any value:

    {
      one: 1
    }
      //=> { one: 1 }

If a name isn't a string, it will be converted to a string:

    {
      1: 'one'
    }
      //=> { '1': 'one' }

Since objects are values, objects can have objects as values:

    {
      transitNumber: {
        federalReserveRouting: {
          bank: '12',
          processingCentre: '9',
          location: '1'
        },
        abaInstitution: '3167',
        checkDigit: '3'
      },
      accountNumber: '0114584906'
    }

Object values are references:

    var reserveRouting = {
      bank: '12',
      processingCentre: '9',
      location: '1'
    };

    var transitNumber = {
      federalReserveRouting: reserveRouting,
      abaInstitution: '3167',
      checkDigit: '3'
    };

    var bankAccount = {
      transitNumber: transitNumber,
      accountNumber: '0114584906'
    };

    var amount = {
      dollars: 2,
      cents: 56
    }

    var cheque = {
      bankAccount: bankAccount,
      number: '1',
      amount: amount
    }

    cheque
      //=>
        { bankAccount:
           { transitNumber:
              { federalReserveRouting:
                 { bank: '12',
                   processingCentre: '9',
                   location: '1' },
                abaInstitution: '3167',
                checkDigit: '3' },
             accountNumber: '0114584906' },
          number: '1',
          amount: { dollars: 2, cents: 56 } }

Since they are references, mutating an object means that its value in one place mutates its value everywhere:

    var cheque2 = {
      bankAccount: bankAccount,
      number: '2',
      amount: {
        dollars: 1,
        cents: 0
      }
    }

    cheque2.bankAccount.transitNumber
      //=>
        { federalReserveRouting:
           { bank: '12',
             processingCentre: '9',
             location: '1' },
          abaInstitution: '3167',
          checkDigit: '3' }

    extend(reserveRouting, {
      processingCentre: '1',
      location: '0'
    });

    cheque.bankAccount.transitNumber
      //=>
        { federalReserveRouting:
           { bank: '12',
             processingCentre: '1',
             location: '0' },
          abaInstitution: '3167',
          checkDigit: '3' }

    cheque2.bankAccount.transitNumber
      //=>
        { federalReserveRouting:
           { bank: '12',
             processingCentre: '1',
             location: '0' },
          abaInstitution: '3167',
          checkDigit: '3' }

          month: month,
          day: 1
        },
        amount: extend({}, rentAmount)
      }
    });

    rentCheques[7].amount.dollars
      //=> 420

    rentCheques[0].amount.dollars
      //=> 420

The expression `extend({}, rentAmount)` copies all the properties of `rentAmount` into a new, empty object. It is evaluated every time we create a new cheque, so we get a new amount object for each cheque. Thus, when we change some of them, they are the only ones to change:

    [4, 5, 6, 7, 8, 9, 10, 11, 12].forEach( function (month) {
      rentCheques[month - 1].amount.dollars = 600;
    });

    rentCheques[7].amount.dollars
      //=> 600

    rentCheques[0].amount.dollars
      //=> 420

The drawback of this approach is that creating new objects takes both time and space, and it becomes very expensive. You might decide that the flaw was in assigning a new dollar amount instead of changing the entire amount:

    [4, 5, 6, 7, 8, 9, 10, 11, 12].forEach( function (month) {
      rentCheques[month - 1].amount = {
        dollars: 600,
        cents 0
      }
    });

This would also have worked. If these were our only options, we would balance their respective considerations before making a choice:

1. Making separate amount objects when we crate cheques is slow and takes up space, but it is resistant to programmers making mistakes later.
2. Making new amount objects when we need to make changes is faster and tighter, but requires discipline from programmers to know when to make copies.

When we discuss defined properties, we will look at some techniques for making code more resistant to errors.

### Summary

*coming soon*