## Classes and Prototypes

Although classes and prototypes both are responsible for creating objects and managing their shared behaviour, classes aren't prototypes and prototypes aren't classes. The simplest way to see the difference is to think about their methods. An object's methods are the surest clue to its function and responsibilities.

Let's revisit an example prototype:

    function MovieCharacter (firstName, lastName) {
      this.firstName = firstName;
      this.lastName = lastName;
    };

    MovieCharacter.prototype.fullName = function () {
      return this.firstName + " " + this.lastName;
    };

What are the prototype's methods?

    Object.keys(MovieCharacter.prototype).filter(function (key) {
      return typeof(MovieCharacter.prototype[key]) === 'function'
    });
      //=> [ 'fullName' ]

In JavaScript, `fullName` is a method of `MovieCharacter`'s prototype. The prototype's methods are the behaviour we're defining for `MovieCharacter` objects.

Now let's compare this to a "class." JavaScript doesn't have classes right out of the box, so we'll compare the prototype's methods to the methods of an equivalent Ruby class as an example:

    class MovieCharacter

      def initialize(first_name, last_name)
        @first_name, @last_name = first_name, last_name
      end

      def full_name
        "#{first_name} #{last_name}"
      end

    end

    MovieCharacter.methods - Object.instance_methods
    #=> [ :allocate, :new, :superclass, :<, :<=, :>, :>=, :included_modules, :include?,
          :name, :ancestors, :instance_methods, :public_instance_methods,
          :protected_instance_methods, :private_instance_methods, :constants, :const_get,
          :const_set, :const_defined?, :const_missing, :class_variables,
          :remove_class_variable, :class_variable_get, :class_variable_set,
          :class_variable_defined?, :public_constant, :private_constant, :module_exec,
          :class_exec, :module_eval, :class_eval, :method_defined?, :public_method_defined?,
          :private_method_defined?, :protected_method_defined?, :public_class_method,
          :private_class_method, :autoload, :autoload?, :instance_method,
          :public_instance_method ]

In Ruby, `full_name` isn't a method of the `MovieCharacter` class, and unlike JavaScript, the class has lots and lots of methods that are specific to the business of being a meta-class that aren't shared by other objects.

JavaScript prototypes look just like ordinary objects, while Ruby classes don't look anything like ordinary objects. They're both metaobjects, but the two languages use completely different approaches. This is not surprising when you learn that Ruby was inspired by [Smalltalk][], a language that emphasized classes, while JavaScript was inspired by  [Self][], a successor to Smalltalk that used prototypes instead of classes.

[Self]: https://en.wikipedia.org/wiki/Self_programming_language
[Smalltalk]: https://en.wikipedia.org/wiki/Smalltalk

In some languages the difference between a class and a metaobjetc liek a prototype is even more pronounced. They have the notion of classes, but they don't have metaobjects you can access at runtime. [C++], for example, allows you to define classes, the definitions are compiled into protocols for virtual functions that are late-bound, but there are no class objects in the system at run time. Such classes aren't metaobjects at all, so those classes are even more different than JavaScript's prototypes.

[C++]: https://en.wikipedia.org/wiki/C%2B%2B

The takeaway is that there is no one "correct" design for metaobjects. The fundamental idea is that metaobjects manage creation and/or behaviour of a common set of objects, and that they are themselves objects a program can access and manipulate at runtime.

