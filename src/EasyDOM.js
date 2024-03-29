import {
  createFragment,
  create,
  prepareMatched,
  prepareContext,
  toNodes,
} from "./helpers";

import * as helpers from "./helpers";
import * as utils from "./utils";

import methods from "./methods";
import { is } from "./utils";

function $(selector, context = document) {
  if (!selector) {
    return $([]);
  }

  let self = [selector];

  if (!(selector instanceof Node) || selector instanceof DocumentFragment) {
    context = prepareContext(context);
    self = $.cache.has(selector)
      ? $.cache.get(selector)
      : prepareMatched(selector, context);
  }

  const length = self.length;

  return {
    [Symbol.iterator]() {
      return self[Symbol.iterator]();
    },
    isEasyDOM: true,
    length,
    ...methods,
    self,

    add(element) {
      self.push(...toNodes(element));
      this.length = self.length;
      return this;
    },

    __each(callback) {
      self.forEach(callback);
      return this;
    },

    each(callback) {
      self.forEach((el, i, arr) => callback($(el), i, arr));
      return this;
    },

    is(selector) {
      return self[0].matches(selector);
    },

    map(callback) {
      return self.flatMap((item, i, arr) => callback($(item), i, arr));
    },

    exists() {
      return !!self.length;
    },

    first() {
      return $(self[0]);
    },

    last() {
      return $(self[self.length - 1]);
    },

    lastIndex() {
      return self.length - 1;
    },

    getLast() {
      return self[this.lastIndex()];
    },

    getFirst() {
      return self[0];
    },

    get(index = undefined) {
      return index !== undefined ? self[index] : self;
    },

    getAsFragment(clone = false) {
      return createFragment(self, clone);
    },

    getContext() {
      return context;
    },

    index(i) {
      return $(self[i]);
    },

    find(selector) {
      let callback = (element) => element.matches(selector);
      if (is(selector, "function")) {
        callback = (item) => selector($(item));
      }

      return $(self.find(callback));
    },

    findAll(selector) {
      let callback = (element) => element.matches(selector);
      if (is(selector, "function")) {
        callback = (item) => selector($(item));
      }

      return $(self.filter(callback));
    },

    $(selector) {
      return this.queryAll(selector);
    },

    cache() {
      $.cache.set(selector, this.self);
    },

    toString() {
      return this.outerHTML();
    },
  };
}

$.cache = new Map();

$.clearCache = (selector = undefined) => {
  if (!selector) {
    $.cache.clear();
  }

  $.cache.delete(selector);
};

$.selectorsToObjects = (selectors) => {
  return selectors.map((selector) => $(selector));
};

$.create = (tag, props = {}, children = []) => {
  return $(create(tag, props, children));
};

Object.entries({ ...helpers, ...utils }).forEach(
  ([helperName, helperFunction]) => {
    if ($[helperName]) return;

    $[helperName] = helperFunction;
  }
);

export default $;
