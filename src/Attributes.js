import {
  setProperty,
  transformCssObjectToString,
  transformCssStringToObject,
} from "./helpers";
import { is, isObject } from "./utils";

const rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

function toArray(str) {
  if (Array.isArray(str)) return str;
  if (is(str, "undefined")) return [];
  return String(str).match(rnothtmlwhite) || [];
}

function addAndRemoveClass([firstClass, secondClass], state) {
  return this.__each((el) => {
    if (state) {
      el.classList.add(secondClass);
      el.classList.remove(firstClass);

      return;
    }

    el.classList.add(firstClass);
    el.classList.remove(secondClass);
  });
}

function addClass(value) {
  const classes = toArray(value);
  if (!classes.length) return this;

  return this.__each((el) => el.classList.add(...classes));
}

function removeClass(value) {
  const classes = toArray(value);
  if (!classes.length) return this.removeAttr("class");

  return this.__each((el) => el.classList.remove(...classes));
}

function toggleClass(value, state = undefined) {
  const classes = toArray(value);
  if (!classes.length) return this;

  return this.__each((el) =>
    classes.forEach((className) => el.classList.toggle(className, state))
  );
}

function hasClass(value) {
  const classes = toArray(value);
  if (!classes.length) return false;

  const firstElement = this.getFirst();
  return classes.every((className) =>
    firstElement.classList.contains(className)
  );
}

function replaceClass(oldClass, newClass) {
  const { __each } = this;
  return __each((element) => element.classList.replace(oldClass, newClass));
}

function attr(attrs, attrValue = undefined) {
  const { __each } = this;

  if (!attrs) return this.getFirst().attributes;
  if (!attrValue && !is(attrs, "object")) {
    return this.getAttr(attrs);
  }

  if (isObject(attrs)) {
    Object.entries(attrs).forEach(([attrName, value]) => {
      __each((item) => item.setAttribute(attrName, value));
    });
  } else {
    __each((item) =>
      item.setAttribute(
        attrs,
        is(attrValue, "function")
          ? attrValue(item.getAttribute(attrs))
          : attrValue
      )
    );
  }

  return this;
}

function toggleAttr(attrName, attrValue) {
  return this.__each((el) => {
    if (el.hasAttribute(attrName)) {
      el.removeAttribute(attrName);
    } else {
      el.setAttribute(attrName, attrValue);
    }
  });
}

function removeAttr(attrName) {
  const attrs = toArray(attrName);

  return this.__each((el) => {
    if (!attrs.length) {
      while (el.attributes.length > 0) {
        el.removeAttribute(attrName);
      }
    } else {
      attrs.forEach((attr) => el.removeAttribute(attr));
    }
  });
}

function getAttr(attrName, as = String) {
  const el = this.getFirst();
  const attr = el.getAttribute(attrName);
  return attr && as(attr);
}

function css(styles, append = false) {
  if (is(styles, "undefined")) {
    const style = this.getAttr("style") || "";
    return {
      style,
      styleObject: transformCssStringToObject(style),

      toString() {
        return style;
      },
    };
  }

  let cssText = styles;

  if (is(styles, "object")) {
    cssText = transformCssObjectToString(styles);
  }

  if (append) {
    return this.attr("style", (styles) => {
      if (styles) {
        return cssText + styles;
      }

      return cssText;
    });
  }

  return this.attr("style", cssText);
}

function setPropsByObject(properties, elements) {
  let index = 0;
  for (const element of elements) {
    for (const property in properties) {
      if (!properties.hasOwnProperty(property)) continue;

      const propertyValue = properties[property];
      element[property] = is(propertyValue, "function")
        ? propertyValue(element[property], element, index)
        : propertyValue;
    }

    index++;
  }

  return this;
}

function getPropValue(property, firstElement) {
  return firstElement[property];
}

function setPropByFunction(property, callback, elements) {
  let index = 0;

  for (const element of elements) {
    element[property] = callback(element[property], element, index++);
  }

  return this;
}

function prop(property, value = undefined) {
  const { __each } = this;
  if (isObject(property)) {
    return setPropsByObject(property, this.get());
  }

  if (is(value, "undefined")) {
    return getPropValue(property, this.getFirst());
  }

  if (is(value, "function")) {
    return setPropByFunction(property, value, this.get());
  }

  __each((item) => {
    item[property] = value;
  });

  return this;
}

function data(
  dataAttributeName = undefined,
  attributeValue = undefined,
  as = String
) {
  const { dataset } = this.getFirst();

  if (is(dataAttributeName, "undefined")) return dataset;

  if (dataAttributeName.includes("-")) {
    dataAttributeName = dataAttributeName.replace(/-[a-z]/g, (matched) =>
      matched.replace("-", "").toUpperCase()
    );
  }

  if (!is(attributeValue, "undefined")) {
    dataset[dataAttributeName] = attributeValue;
    return this;
  }

  return as(dataset[dataAttributeName]);
}

export {
  addAndRemoveClass,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  replaceClass,
  attr,
  toggleAttr,
  removeAttr,
  getAttr,
  css,
  prop,
  // props,
  data,
};
