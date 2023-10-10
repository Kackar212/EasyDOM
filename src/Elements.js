import $ from "./EasyDOM";
import { events } from "./Event";
import { deep, getOnlyParents, toNodes } from "./helpers";
import { is } from "./utils";

function queryAll(selector) {
  const parents = getOnlyParents(this);

  return $(parents.flatMap((el) => Array.from(el.querySelectorAll(selector))));
}

function children() {
  const elements = this.get().flatMap((el) => Array.from(el.children));

  return $(elements);
}

function deepChildren(asObject = false) {
  const parents = getOnlyParents(this);

  const result = deep(parents, asObject);
  return asObject ? result : $(result);
}

const cloneElement = (deep) => (el) => {
  const copy = el.cloneNode(deep);

  events.set(copy, { ...(events.get(el) || []) });

  return copy;
};

function clone(deep = true) {
  const elements = this.get();
  return $(elements.map(cloneElement(deep)));
}

function query(selector) {
  const parents = getOnlyParents(this);

  return $(parents.map((el) => el.querySelector(selector)).filter(Boolean));
}

function getElementWithEqualAttr(attrName, attr, deep = false) {
  let elements = this.get();
  if (deep) {
    elements = [...elements, ...this.deepChildren()];
  }

  for (const el of elements) {
    if ((el[attrName] || el.getAttribute(attrName)) === attr) {
      return $(el);
    }
  }

  return $();
}

function findSiblings(
  selector = undefined,
  excludeMatched = false,
  whichSibling = "nextElementSibling"
) {
  let next = true;
  return (el, _, matchedElements) => {
    const siblings = [];

    if (!el.parentNode) {
      return siblings;
    }

    let sibling = el[whichSibling];

    while (sibling) {
      const exclude = excludeMatched && matchedElements.includes(sibling);
      if (
        sibling !== el &&
        (sibling.matches(selector) || is(selector, "undefined")) &&
        !exclude
      ) {
        siblings.push(sibling);
      }
      sibling = sibling[whichSibling];
    }

    return siblings;
  };
}

function siblings(selector = undefined, excludeMatched = false) {
  return $([
    this.prevSiblings(selector, excludeMatched),
    this.nextSiblings(selector, excludeMatched),
  ]);
}

function nextSiblings(selector = undefined, excludeMatched = false) {
  const { get } = this;
  const elements = get();
  const siblings = elements.flatMap(findSiblings(selector, excludeMatched));

  return $(siblings);
}

function prevSiblings(selector = undefined, excludeMatched = false) {
  const { get } = this;
  const elements = get();
  const siblings = elements
    .flatMap(findSiblings(selector, excludeMatched, "previousElementSibling"))
    .reverse();

  return $(siblings);
}

function contains(elements) {
  const children = this.deepChildren().get();

  return this.get().every((parent) => {
    elements = toNodes(elements, parent);

    if (!elements.length) return false;

    return elements.every((child) => children.includes(child));
  });
}

function findParent(el, selector) {
  let parent = el.parentElement;

  if (!parent) return null;

  if (parent.matches(selector)) {
    return parent;
  }

  while (parent) {
    if (parent.matches(selector)) return parent;
    parent = parent.parentElement;
  }

  return null;
}

function parent(selector) {
  return $(this.get().map((el) => findParent(el, selector)));
}

function closest(selector) {
  return $(this.get().flatMap((el) => Array.from(el.closest(selector) || [])));
}

function slice(start = 0, count = this.length) {
  const { get } = this;

  const matchedElements = start >= 0 ? get() : get().reverse();
  start = start < 0 ? Math.abs(start) - 1 : start;

  return $(matchedElements.slice(start, start + count));
}

function repeat(count = 1) {
  const repeated = [];
  for (; count > 0; count--) {
    repeated.push(this.clone());
  }

  return $([this, ...repeated]);
}

function formControls(key) {
  const el = this.getFirst();
  const elements = el.prop("elements");
  return key ? $(elements[key]) : $([...elements]);
}

function includes(item) {
  const nodes = toNodes(item);
  const elements = this.get();

  return nodes.every((node) => elements.includes(node));
}

export {
  queryAll,
  query,
  clone,
  children,
  deepChildren,
  getElementWithEqualAttr,
  siblings,
  nextSiblings,
  prevSiblings,
  contains,
  parent,
  closest,
  slice,
  repeat,
  formControls,
  includes,
};
