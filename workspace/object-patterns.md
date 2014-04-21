---
layout: default
title: A Pattern for Object Creation in JavaScript
tags: spessore
---

Sometimes, people use this simple object creation problem in JavaScript:

    function ChequingAccount () {
      this.balance = 0;
    }

    ChequingAccount.prototype.deposit = function (howMuch) {
      this.balance = this.balance + howMuch;
      return this;
    }

    // ...

    var account = new ChequingAccount();

Or they use this variation, which is different in some respects, but ultimately solves the same problems the same way:

    var ChequingAccountPrototype = {
      initialize: function () {
        this.balance = 0;
        return this;
      },
      deposit: function (howMuch) {
        this.balance = this.balance + howMuch;
        return this;
      },
      processCheque: function (cheque) {
        this.balance = this.balance - cheque.amount;
        return this;
      }
    }

    var account = Object.create(ChequingAccountPrototype).initialize();

    // ...

Objects have prototypes, and the primary way of defining behaviour for objects is to place that behaviour in its prototype. Besides allowing one metaobject (the prototype) to define behaviour for than one object, this separation of object and metaobject also allows us to write things like this:

    var object = Object.create(
      // ...
    );
    var keys = [];
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

The `.hasOwnProperty` method neatly distinguishes between properties that are defined directly on an object and properties that it delegates to its prototype.

### prototype chains and trees

And all is well for a very long time with this pattern. Or at least, it *should* be well, but sooner or later we'll discover that there are Chequing Accounts, and there are Savings Accounts, and there is functionality (like `.deposit`) that is common to both Chequing and Savings Accounts.

This problem is deceptively easy to solve with prototypes: Prototypes are objects, and objects can have prototypes, so we give our prototypes a prototype!

    var AbstractBankAccountPrototype = {
      initialize: function () {
        this.balance = 0;
        return this;
      },
      deposit: function (howMuch) {
        this.balance = this.balance + howMuch;
        return this;
      }
    }

    var ChequingAccountPrototype = Object.create(AbstractBankAccountPrototype);

    ChequingAccountPrototype.processCheque = function (cheque) {
      this.balance = this.balance - cheque.amount;
      return this;
    };

    var account = Object.create(ChequingAccountPrototype).initialize();

    typeof(account.deposit)
      //=> 'function'

Objects delegate behaviour to their immediate prototype, and that delegates behaviour to the next prototype in the "prototype chain." In this case, `account` delegates `.processCheque` to `ChequingAccountPrototype` directly and it delegates `deposit` indirectly to `AbstractBankAccountPrototype`.

Without getting into the question of semantics, formal classes, and ontologies, this "prototype chain" pattern has a serious problem.

### the fragile base class problem

As the application grows, prototypes are created and chains rearranged, until you might end up with:

![A tree of prototypes](/assets/images/tree.png)

This is a coupled design. Every kind of account depends on `AbstractBankAccountPrototype`. The slightest change to `AbstractBankAccountPrototype` ripples through our entire design. The same can be said for `SavingsAccountPrototype` and `ChequingAccountPrototype`: Changes to either prototype will have far-reaching effects.

As our program grows, each prototype will take on more responsibility. Shared functionality will be moved around the tree. New features will result in the creation of new methods and new attributes to be manipulated by each prototype's methods. And as the prototypes grow in size and responsibility, they become more fragile: Changes are hard to make without breaking some functionality somewhere else.

### coupling and direct manipulation

Now let's stop and think for a moment. One of the "big ideas" is encapsulation: Objects interact with each other using methods, but what the objects do internally is invisible to other objects. With prototype chains, this works in one sense: An object delegates to its prototype, but it has no idea how its prototype implements behaviour. The prototype might implement it directly, or it might in turn delegate that behaviour to another prototype.

But prototype chains don't encapsulate behaviour in another, more important sense: All methods in the prototype chain operate on the object's properties through the `this` pseudo-variable. They all operate on the same set of object properties, and are thus coupled to it and each other.

It's true that a hypothetical `visaDebitAccount` object delegates `.deposit` to its `VisaDebitAccountPrototype`, which delegates to `ChequingAccountPrototype`, which in turn delegates to `AbstractBankAccountPrototype` transparently. But our `deposit` function depends upon `visaDebitAccount` having a `balance` property. If any of these prototypes tinkers with `balance`, everything breaks.

For example, the code as shown is deeply broken: `balance` is initialized to `0`, and `deposit` adds an amount to balance. But account balances are a currency, and you can't use a float for a currency, you will encounter errors. But you cannot change `AbstractBankAccountPrototype` to use the properties `balanceDollars` and `balanceCents` without breaking every other method that touches the balance in every other prototype. The `balance` property is *not* encapsulated.

Forty years of experience has led OO practitioners to understand that this "ontological" approach of building trees of metaobjects (often called "classes" in other languages) is deeply flawed. It does not lead to robust software. It does not capture real-world relationships and make code easier to understand. It makes code fragile and more difficult to maintain and modify.

### flattening the tree

One of the ways to deal with the coupling is to "flatten" the tree. If prototypes are coupled to every other prototype in each prototype chain, making the chains shorter doesn't make the coupling go away, but it does make the coupling less indirect by bringing the coupled elements closer together. This can and does make the complexity easier to manage.

The starting point for flattening trees of prototypes is to say that each object's prototype chain should have *no more than* one domain-specific prototype in it. Or equivalently, Every object should have zero or one domain-specific prototypes, whether directly or indirectly.

(We say "domain-specific," because the object `{ foo: function () {} }` has `Object.prototype` as its prototype. If we use that as a prototype, we would technically have two prototypes in the chain: Our object and `Object.prototype`  So we are only counting the prototypes we write and manage ourselves.)

An object with no domain-specific prototype is easy to create:

    var plain = {}

Or:

    var evenMorePlan = Object.create(null);

We can't give it behaviour through a prototype, so we have to manually assign methods:

    plain.deposit = function (howMuch) {
      this.balance = this.balance + howMuch;
      return this;
    }

"That is no way to run a railroad," as they say, so we will write ourselves a little helper function:

    function mixin (template) {
      return function (subject) {
        if (subject == null) {
          subject = {};
        }
        for (var key in template) {
          if (template.hasOwnProperty(key) && typeof(template[key]) == 'function') {
            subject[key] = template[key];
          }
        }
        return subject;
      }
    }

Now, instead of writing `account = Object.create(ChequingAccountPrototype)`, we write:

    var Account = mixin({
      initialize: function () {
        this.balance = 0;
        return this;
      },
      deposit: function (howMuch) {
        this.balance = this.balance + howMuch;
        return this;
      }
    });

    var account = Account().initialize();
      //=> { initialize: [Function],
             deposit: [Function],
             balance: 0 }

### advantages and disadvantages of mixing into objects

This design has an advantage over prototypes: All of our "mixins" are symmetrical. So we can also write:

    var Chequing = mixin({
      processCheque: function (cheque) {
        this.balance = this.balance - cheque.amount;
        return this;
      }
    });

    var account = Chequing(Account()).initialize();
      //=> { initialize: [Function],
             deposit: [Function],
             processCheque: [Function],
             balance: 0 }

With prototypes, we'd have to set up a chain from `Chequing` to `Account`, we can never have one object delegate to two different prototypes directly.

There's a small additional memory footprint with this approach, and we also have to be aware that this mechanism uses *early binding*: If we add a method to `ChequingAccount` at runtime after we use it to create an `account` object, the account object will not be able to take advantage of the "new" behaviour.

But a larger issue with this is that we break all the code (like `for... in` loops) that depends on `.hasOwnProperty` to distinguish between domain properties and methods:

    var keys = [];
    for (var key in account) {
      if (account.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    keys
      //=> [ 'initialize',
             'deposit',
             'processCheque',
             'balance' ]

Our methods are showing up because they're now enumerable properties that belong directly to the `account` object. So we have to either:

1. Do something else so that `.hasOwnProperty` keeps working, or;
2. Use a different strategy for differentiating properties from behaviour that's mixed in.

### making methods non-enumerable

Using a different strategy for differentiating properties from mixed in behaviour isn't too difficult. We could use `Object.defineProperty` make our mixed in methods non-enumerable. Here's a new helper function:

    function mixNonEnumerableIn (template) {
      return function (subject) {
        if (subject == null) {
          subject = {};
        }
        for (var key in template) {
          if (template.hasOwnProperty(key) && typeof(template[key]) == 'function') {
            Object.defineProperty(subject, key, {
              enumerable: false,
              value: template[key]
            });
          }
        }
        return subject;
      }
    }

    var Account2 = mixNonEnumerableIn({
      initialize: function () {
        this.balance = 0;
        return this;
      },
      deposit: function (howMuch) {
        this.balance = this.balance + howMuch;
        return this;
      }
    });

    var Chequing2 = mixNonEnumerableIn({
      processCheque: function (cheque) {
        this.balance = this.balance - cheque.amount;
        return this;
      }
    });

    var account2 = Chequing2(Account2()).initialize();
      //=> { balance: 0 }

Now it doesn't matter whether we check for `.hasOwnProperty` or not:

    var keys = [];
    for (var key in account2) {
      keys.push(key);
    }
    keys
      //=> [ 'balance' ]

### using a singleton prototype

The disadvantage of making our methods non-enumerable is the sometimes we want to enumerate over an object's methods, and it's a pain to sort out the behaviour from properties that might be functions. This can be solved: Another way forward is to use a prototype, but each object gets its own prototype, instead of multiple objects sharing a common prototype.

We use our original `mixin` pattern, but we mix our behaviour into an object that will be our new object's prototype, like this:

    var account3 = Object.create( Account(Chequing({})) ).initialize();
      //=> { balance: 0 }

Now all of the methods are mixed into `account3`'s prototype, so we can use almost of the patterns that apply to trees of prototypes created in the old-fashioned style. For example, we can use `.hasOwnProperty` as we did with prototype chains. Try it for yourself:

    var keys = [];
    for (var key in account3) {
      if (account.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    keys

---

TODO:

- Discuss mixing into classes
  - instanceof and isPrototypeOf (with caution!)
- Refactoring to prototypes
Renaming to be traits-ish rather than class-like
