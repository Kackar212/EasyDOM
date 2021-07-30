import { EventFactory } from "./helpers";
import { isEqual } from "./utils";

export const events = new Map();

function attachEvent(
  eventName,
  callback,
  options = {
    bubbles: false,
    cancelable: false,
    composed: false,
  }
) {
  const { __each, $ } = this;

  __each((item) => {
    const boundCallback = callback.bind($(item));
    const ev = {
      eventName,
      callback: (e) => {
        e = {
          native: e,
          target: $(e.target),
          isTrusted: e.isTrusted,
          preventDefault: e.preventDefault,
          type: e.type,
          currentTarget: e.currentTarget && $(e.currentTarget),
        };
        boundCallback(e);
      },
      options,
      original: callback,
    };
    events.set(item, [...(events.get(item) || []), ev]);
    item.addEventListener(eventName, ev.callback, options);
  });
}

function on(
  eventName,
  listeners,
  options = {
    bubbles: false,
    cancelable: false,
    composed: false,
  }
) {
  if (Array.isArray(listeners)) {
    listeners.forEach((listener) => {
      this.attachEvent(eventName, listener, options);
    });
  } else {
    this.attachEvent(eventName, listeners, options);
  }

  return this;
}

const removeEvent = (item, ev) => {
  item.removeEventListener(ev.eventName, ev.callback, ev.options);
};

const removalMethods = function (elementEvents, item) {
  const removeEventsByEventName = (eventName) => {
    elementEvents.forEach((ev) => {
      if (ev.eventName === eventName) {
        removeEvent(item, ev);
      }
    });
  };

  const removeAllEvents = () => {
    elementEvents.forEach((ev) => removeEvent(item, ev));
  };

  const removeEventsNative = (eventName, callback, options) => {
    elementEvents.forEach((ev) => {
      if (
        ev.original === callback &&
        ev.eventName === eventName &&
        isEqual(options, ev.options)
      ) {
        removeEvent(item, ev);
      }
    });
  };

  return { removeAllEvents, removeEventsByEventName, removeEventsNative };
};

function off(
  eventName = undefined,
  callback = undefined,
  options = {
    bubbles: false,
    cancelable: false,
    composed: false,
  }
) {
  const { __each } = this;

  __each((item) => {
    const elementEvents = events.get(item);
    const {
      removeAllEvents,
      removeEventsByEventName,
      removeEventsNative,
    } = removalMethods(elementEvents, item);

    if (!arguments.length) {
      removeAllEvents();
    } else if (eventName && !callback) {
      removeEventsByEventName(eventName);
    } else {
      removeEventsNative(eventName, callback, options);
    }

    events.set(
      item,
      elementEvents.filter((ev) => {
        return (
          callback !== ev.original ||
          !isEqual(options, ev.options) ||
          eventName !== ev.eventName
        );
      })
    );
  });

  return this;
}

function trigger(
  eventName,
  callback,
  options = {
    bubbles: false,
    cancelable: false,
    composed: false,
  }
) {
  const { __each } = this;

  const ev = new EventFactory(eventName, options);

  __each((item) => {
    if (callback) {
      const elementEvents = events.get(item);

      this.off();

      item.dispatchEvent(ev);

      elementEvents.forEach((ev) =>
        this.attachEvent(ev.eventName, ev.callback, ev.options)
      );

      callback(ev);
    } else if (item[eventName]) {
      item[eventName]();
    } else {
      item.dispatchEvent(ev);
    }
  });
}

export { attachEvent, trigger, on, off };
