## Introduction

![Nova 1220 Front Panel](images/nova.jpg)

In the 1970s, my high school had a Data General Nova 1220 minicomputer. It had a 16 bit CPU, and yes, you bootstrapped the system by toggling three instructions into memory. At the moment I was toggling instructions into memory, the computer was on and running. I was modifying a program in real time.

This is possible because in the classic Von Neumann architecture, programs and data for programs reside in the same address space. Programs are data, and data can be programs. The JavaScript we evaluate is data that is read by an interpreter. The code for the interpreter data that is read by the CPU.

### early-binding

Despite the historical equivalence between code and data, most programming languages are organized with a clear separation between the program and the data. The program is usually considered a static entity that operates upon mutable data.

Most elements of the program--like functions or classes--are bound to names of some sort. The same is true of data values, they are usually bound to variables, parameters, and constants. The difference between the two in a typical language is that the program elements are bound to names before the program begins executing, while the data is bound (and rebound) to names throughout the execution of the program.

Thus, a typical program's behaviour uses "early-binding," while its data uses "late-binding."

Consider this C++ declaration [borrowed from Wikipedia](https://en.wikipedia.org/wiki/C++_classes):

    class person
    {
      std::string name;
      int age;
    public:
      person() : age(5) { }
      void print() const;
    };

    void person::print() const
    {
      cout << name << ":" << age << endl;
      /* "name" and "age" are the member variables.
         The "this" keyword is an expression whose value is the address
         of the object for which the member was invoked. Its type is
         const person*, because the function is declared const.
     */
    }

The structure of the `person` class is determined when the program is compiled, including the `print` member function. Furthermore, the association between the symbol `person` and the person class is established as part of the compilation process.

### late-binding

Here's a person "class" written in JavaScript:

    var Person = function () {
      this.age = 5;
      this.name = '';
    };

    Person.prototype.print = function () {
      console.log(this.name + ':' + this.age);
      return this;
    };

Although they are superficially similar, nothing is bound to the symbol `Person` until the code is executed at run time. Late binding is usually found in languages with a great deal of flexibility. In JavaScript, we can add another method to `Person` at any time:

    Person.prototype.rename = function (new_name) {
      this.name = new_name;
      return this;
    };

We can remove and/or rebind a method at any time:

    delete Person.prototype.print;

    Person.prototype.rename = function (new_name) {
      if (new_name && new_name.length > 0) {
        this.name = new_name[0].toUpperCase() + new_name.slice(1).toLowerCase();
      }
      else this.name = new_name;
      return this;
    };

As above, this is "late binding," binding behaviour to a name at runtime.

### how late is late?

There are degrees of "lateness." We've just discussed two possible times behaviour can be bound to symbols. Our two examples were 1, behaviour bound before the program is executed, and 2, behaviour bound when code to bind the behaviour is executed within the program. There are not the only options. Behaviour can also be bound *after* the binding code is executed.

Consider a very simple *protocol*, an architecture for binding behaviour to names. In this protocol, you define methods the usual way:

    Person.prototype.rename = function (new_name) {
      // ...
    };

Let's presume that we have a way to define some behaviour to be executed *before* the core behaviour of a method is executed. This can very useful for separating concerns. Presuming we have such a protocol, if we want to write to the log whenever a person is renamed, we can write:

    before(User, 'rename', function (new_name) {
      console.log("Renaming " + this.name + " as " + new_name);
    });

Now whenever we rename a user, we will log the change to `console`. This is interesting, and will be discussed in much more detail later. But for now, let's consider when this behaviour is bound.

This truly seems like "late-binding:" We're adding some behaviour to an existing method at "runtime." But how late is late? Let's consider two different implementations:

First, the *method combinator* implementation looks like this:

    function before (constructor, method_name, decoration) {
      var method_body = constructor.prototype[method_name];
      constructor.prototype[method_name] = function () {
        decoration.apply(this, arguments);
        return method_body.apply(this, arguments);
      }
    };

This is not industrial-strength, it omits small details such as hacking the arity of the new method body, and there are no semantics addressing whether a before- decoration can abort the method call. But it gets the basics right. Let's be explicit about its semantics:

First, it modifies the method body that is already in place at the time it is executed. If you bind another function to `User.prototype.rename`, you will wipe out any before decoration already in place. We're implementing our protocol with side-effects, we aren't "declaring" our protocol and having some mechanism enforce it for us. There's a similar consequence with respect to inheritance, if we override `rename` further down the prototype chain, we can't override the body while keeping our logging decoration.

Second, it has no *reflection*. JavaScript allows us to do some basic inspection of objects and their methods, for example, we can always retried the current method:

    new Person('Arthur').rename
      //=> function (new_name) { ... }

But with the implementation of `before` we provided, there's no way to retrieve the original method behaviour or to retrieve the before behaviour. Once applied, they are irrevocably combined into a new method.

Is there another way? Certainly.

