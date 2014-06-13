This idea that we can make a variation on an existing metaobject is not a new discovery. Many times, this is exactly what people are attempting to accomplish when they create prototype chains. They have a `Songwriter`, and they want to create a `SubscribableSongwriter`, so they reach for the inheritance golden hammer and write:

~~~~~~~~
var __slice = [].slice;

function extend () {
  var consumer = arguments[0],
      providers = __slice.call(arguments, 1),
      key,
      i,
      provider;

  for (i = 0; i < providers.length; ++i) {
    provider = providers[i];
    for (key in provider) {
      if (Object.prototype.hasOwnProperty.call(provider, key)) {
        consumer[key] = provider[key];
      };
    };
  };
  return consumer;
};

var Songwriter = {
  initialize: function () {
    this._songs = [];
    return this;
  },
  addSong: function (name) {
    this._songs.push(name);
    return this;
  },
  songs: function () {
    return this._songs;
  },
  songlist: function () {
    return this.songs().join(', ');
  }
};

var Subscribable = {
  initialize: function () {
    this._subscribers = [];
    return this;
  },
  subscribe: function (callback) {
    this._subscribers.push(callback);
  },
  unsubscribe: function (callback) {
    this._subscribers = this._subscribers.filter( function (subscriber) {
      return subscriber !== callback;
    });
  },
  subscribers: function () {
    return this._subscribers;
  },
  notify: function () {
    receiver = this;
    this._subscribers.forEach( function (subscriber) {
      subscriber.apply(receiver, arguments);
    });
  }
};

var SubscribableSongwriter = extend(
	Object.create(Songwriter), 
	Subscribable,
	{
	  initialize: function () {
	    Songwriter.initialize.apply(this, arguments);
	    return Subscribable.initialize.apply(this, arguments);
	  },
	  addSong: function () {
	    var returnValue = Songwriter.addSong.apply(this, arguments);
	    this.notify();
	    return returnValue;
	  }
	}
);

var sweetBabyJames = Object.create(SubscribableSongwriter).initialize();

var SongwriterView = {
  initialize: function (model, name) {
    this.model = model;
    this.name = name;
    this.model.subscribe(this.render.bind(this));
    return this;
  },
  _englishList: function (list) {
    var butLast = list.slice(0, list.length - 1),
        last = list[list.length - 1];
    return butLast.length > 0
           ? [butLast.join(', '), last].join(' and ')
           : last;
  },
  render: function () {
    var songList  = this.model.songs().length > 0
                    ? [" has written " + this._englishList(this.model.songs().map(function (song) {
                        return "'" + song + "'"; }))]
                    : [];

    console.log(this.name + songList);
    return this;
  }
};

var jamesView = Object.create(SongwriterView).initialize(sweetBabyJames, 'James Taylor');

sweetBabyJames.addSong('Fire and Rain');
  //=>
    James Taylor has written 'Fire and Rain'
    { _songs: [ 'Fire and Rain' ],
      _subscribers: [ [Function] ] }
~~~~~~~~