import eventTypes from "./eventTypes";
import { is, isValidHTMLTag, isSelectorValid, isArrayLike } from "./utils";

const ArgTypes = {
  Node: "node",
  EasyDOM: "easyDOM",
  Selector: "selector",
  HTML: "html",
};

function EventFactory(eventName, options = undefined) {
  for (const [eventNames, EventType] of eventTypes) {
    if (eventNames.includes(eventName)) {
      return new EventType(eventName, options);
    }
  }

  return new Event(eventName, options);
}

function getContentType(easyDOMArg) {
  if (easyDOMArg instanceof Node) {
    return ArgTypes.Node;
  } else if (easyDOMArg.isEasyDOM) {
    return ArgTypes.EasyDOM;
  } else if (is(easyDOMArg, "string")) {
    if (isSelectorValid(easyDOMArg)) {
      return ArgTypes.Selector;
    }

    return ArgTypes.HTML;
  }
}

const EasyDOMContentTypes = {
  html: (html) => {
    return [create(html)];
  },

  selector: (selector, context) => {
    return context.querySelectorAll(selector);
  },

  easyDOM: (easyDOMElement) => {
    return easyDOMElement.get();
  },

  node: (node) => [node],
};

function toNodes(elements, context = document) {
  if (!elements) return [];

  if (isArrayLike(elements)) {
    elements = Array.from(elements);
  } else if (is(elements, "string") || elements instanceof Node) {
    elements = [elements];
  }

  return elements.reduce((elements, easyDOMContent) => {
    if (!easyDOMContent) return elements;
    const type = getContentType(easyDOMContent);
    const contentType = EasyDOMContentTypes[type];
    const nodes = contentType(easyDOMContent, context);

    return [...elements, ...nodes];
  }, []);
}

function uniqueElements(elements) {
  return Array.from(new Set(elements));
}

function insert(parent, content, refChild, clone = false) {
  const newChild = createFragment(content, clone);
  parent = toNodes(parent)[0];

  if (!parent) return;

  if (!refChild) return parent.appendChild(newChild);

  parent.insertBefore(newChild, refChild);
}

const mapElements = (value) => {
  if (is(value, "string")) {
    return create(value);
  }

  return value;
};

const getOnlyParents = ({ getFirst, get }) => {
  let parents = [];
  let parent = getFirst();
  let isChild = false;

  get().forEach((el) => {
    let parentElement = el.parentElement;

    while (parentElement) {
      parentElement = parentElement.parentElement;
      if (parentElement === parent) {
        isChild = true;
        break;
      } else {
        isChild = false;
      }
    }

    if (!isChild) {
      parents.push(el);
      parent = el;
    }
  });

  return parents;
};

function getNodeOrFragment(element) {
  const { childNodes, children } = element;

  if (childNodes.length === 1 && children.length === 1) return children[0];
  return element;
}

function create(tag, props = {}, children = []) {
  if (Array.isArray(tag)) {
    return getNodeOrFragment(createFragment(toNodes(tag)));
  } else if (!isValidHTMLTag(tag)) {
    const wrapper = document.createElement("template");
    wrapper.innerHTML = tag;

    const { content } = wrapper;
    return getNodeOrFragment(content);
  }

  const element = document.createElement(tag);

  Object.entries(props).forEach(([prop, value]) => {
    if (prop === "style") {
      if (is(value, "object")) {
        value = transformCssObjectToString(value);
      }
    }

    if (!is(element[prop], "undefined")) element[prop] = value;
    else element.setAttribute(prop, value);
  });

  if (children.length) {
    children.map((child) => {
      if (child instanceof Node) {
        element.appendChild(child);
      } else if (child.isEasyDOM) {
        element.appendChild(child.getAsFragment());
      } else {
        element.appendChild(create(child));
      }
    });
  }

  return element;
}

function getHTMLFromFragment(fragment, inner = false) {
  return Array.from(fragment.childNodes)
    .map((child) => {
      if (child.nodeName === "#text") return child.textContent;
      return inner ? child.innerHTML : child.outerHTML;
    })
    .join("");
}

function getHTML(elements, inner = false) {
  return Array.from(elements)
    .map((item) => {
      if (item instanceof DocumentFragment) {
        return getHTMLFromFragment(item, inner);
      }

      return inner ? item.innerHTML : item.outerHTML;
    })
    .join("");
}

function getChildren(elements) {
  const elementChildren = [];
  Array.from(elements).forEach((element) => {
    elementChildren.push(...element.children, element);
  });

  return elementChildren;
}

function deep(elements, asObject = false) {
  return Array.from(elements).reduce((elementChildren, parent) => {
    const children = getChildren(parent.children);
    if (asObject) {
      elementChildren.push({
        children,
        parent,
      });
    } else {
      elementChildren.push(...children);
    }
    return elementChildren;
  }, []);
}

function createFragment(children, clone = false) {
  const fragment = document.createDocumentFragment();

  toNodes(children).forEach((child) => {
    fragment.appendChild(clone ? child.cloneNode(true) : child);
  });

  return fragment;
}

function prepareMatched(selector, context) {
  let self = toNodes(selector, context);

  if (self.length > 1) {
    self = uniqueElements(self);
  }

  return self;
}

function prepareContext(context) {
  context = toNodes([context], document)[0];

  if (!(context instanceof Node)) {
    throw new Error(
      "context must be Node, selector, HTML, Document or EasyDOM element"
    );
  }

  return context;
}

function setProperty(property, value, { __each }) {
  __each((element) => {
    element[property] = value;
  });
}

function transformCssObjectToString(stylesObject) {
  return Object.entries(stylesObject).reduce(
    (cssText, [cssProperty, propertyValue]) => {
      cssProperty = cssProperty.replace(/([A-Z])/g, "-$1").toLowerCase();
      cssText += `${cssProperty}:${propertyValue};`;
      return cssText;
    },
    ""
  );
}

function transformCssStringToObject(styles) {
  return styles
    .split(/\s*;\s*/)
    .filter(Boolean)
    .map((cssRule) => cssRule.split(/\s*:\s*/))
    .reduce((stylesObject, [name, value]) => {
      while (name[0] === "-") {
        name = name.replace("-", "");
      }
      name = name.replace(/-[a-z]/g, (matched) =>
        matched.replace("-", "").toUpperCase()
      );
      return { ...stylesObject, [name]: value };
    }, {});
}

export {
  createFragment,
  toNodes,
  deep,
  getChildren,
  create,
  insert,
  mapElements,
  uniqueElements,
  getOnlyParents,
  prepareMatched,
  prepareContext,
  getHTMLFromFragment,
  getHTML,
  EventFactory,
  setProperty,
  transformCssObjectToString,
  transformCssStringToObject,
};
