function send (receiver, message, args) {
  var handler = get(receiver, message);
  if (handler && typeof(handler) == 'function') {
    return handler.apply(receiver, args);
  }
  else {
    // manage "receiver cannot handle message"
  }
}

function get (object, propertyName) {
  if (Object.getOwnPropertyNames(object).indexOf(propertyName) >= 0)
    return object[propertyName];
  else {
    var prototype = Object.getPrototypeOf(object);
    if (prototype) {
      return get(prototype, propertyName)
    }
  }
}