## References

One of the 'big' activities in designing software is eliminating duplication. When two things have the same value *and* they there is an underlying sameness to them, it's valuable to make sure that the thing they share is actually shared, and not just copied.

To continue from the examples in the preamble, this code expresses the idea that two cheques from the same bank account should share everything except the number and amount:

    var cheque = {
      bankAccount: bankAccount,
      number: '1',
      date: {
        year: 2014,
        month: 1,
        day: 1
      },
      amount: {
        dollars: 2,
        cents: 56
      }
    }

    var cheque2 = {
      bankAccount: bankAccount,
      number: '2',
      date: {
        year: 2014,
        month: 2,
        day: 1
      },
      amount: {
        dollars: 1,
        cents: 0
      }
    }

There is a problem with this approach:

    var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var rentAmount = {
      dollars: 420,
      cents: 0
    };
    var rentCheques = map(months, function (month) {
      return {
        bankAccount: bankAccount,
        number: month,
        date: {
          year: 2014,
          month: month,
          day: 1
        },
        amount: rentAmount
      }
    });

Let's presume we cash cheques for January, February, and March. In April, the landlord raises the rent to $600. We'll change the dollar figure for the May through December cheques:

    [4, 5, 6, 7, 8, 9, 10, 11, 12].forEach( function (month) {
      rentCheques[month - 1].amount.dollars = 600;
    });

    rentCheques[7]
      //=>
        { bankAccount:
           { transitNumber:
              { federalReserveRouting: [Object],
                abaInstitution: '3167',
                checkDigit: '3' },
             accountNumber: '0114584906' },
          number: 8,
          date: { year: 2014, month: 8, day: 1 },
          amount: { dollars: 600, cents: 0 } }

Looks good. What about the January cheque that was from before the increase?

    rentCheques[0]
      //=>
        { bankAccount:
           { transitNumber:
              { federalReserveRouting: [Object],
                abaInstitution: '3167',
                checkDigit: '3' },
             accountNumber: '0114584906' },
          number: 1,
          date: { year: 2014, month: 1, day: 1 },
          amount: { dollars: 600, cents: 0 } }

This code did change the rent for the May through December cheques as we wished. *But it also changed the rent for the January, February, and March cheques*, because we changed an object that was shared by reference amongst all the cheques.

The lesson is that two cheques that happen to have the same amount don't always have a deep semantic connection. In real life, when the rent was raised, we would have either written entirely new cheques with new amounts, or we would have changed the amounts for some of the cheques without changing the others.

One strategy to avoid this problem is to make *copies* of the amount objects instead of using references:

    var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var rentAmount = {
      dollars: 420,
      cents: 0
    };
    var rentCheques = map(months, function (month) {
      return {
        bankAccount: bankAccount,
        number: month,
        date: {
          year: 2014,
          month: month,
          day: 1
        },
        amount: extend({}, rentAmount)
      }
    });

Now each rent cheque has its own copy of the `rentAmount` object, and changing one will not change any of the others.

This approach is not without its drawbacks:

1. You're using a lot more memory when you make copies of objects willy-nilly.
2. Sometimes you *want* a change in one place to be a change everywhere.

Another approach is to share the same object, but be careful to update the cheques with new objects instead of updating the amount of the existing object:

    var raisedRent = {
      dollars: 600,
      cents: 0
    }

    [4, 5, 6, 7, 8, 9, 10, 11, 12].forEach( function (month) {
      rentCheques[month - 1].amount = raisedRent;
    });

Now the old months still share the old amount, while the new months share the raised amount.

So what practice should we follow? Well, for this example, the latter practice seems to be the best. But overall, there is no one easy answer. If there was, the language would bake it into the assignment operator and we programmers could forget about references all together.

The lesson is that when working with references, we have to be mindful of how they may be shared when we mutate them.