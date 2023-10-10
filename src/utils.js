function isObject(obj) {
  return (
    typeof obj === "object" && typeof obj !== "null" && !Array.isArray(obj)
  );
}

function isIterable(obj) {
  return typeof obj[Symbol.iterator] === "function";
}

function is(value, type) {
  if (type.includes("||")) {
    const types = type.split("||");

    return types.some((type) => typeof value === type);
  } else if (type.includes("&&")) {
    const types = type.split("&&");

    return types.every((type) => typeof value === type);
  }

  return typeof value === type;
}

function isPrimitive(value) {
  return Object(value) !== value;
}

function formDataToPlain(formData, as = {}) {
  formData = formData instanceof FormData ? formData : new FormData(formData);
  const entries = formData.entries();
  const data = {};
  let parsedName = name;

  Array.from(entries).forEach(([name, value]) => {
    if (name.includes("[]")) {
      parsedName = name.replace("[]", "");
    }

    if (as[parsedName]) {
      as = as[parsedName];
      if (!(value instanceof as) && !data.hasOwnProperty(parsedName)) {
        value = as(value);
      }
    }

    if (name.includes("[]")) {
      if (Array.isArray(data[parsedName])) data[parsedName].push(value);
      else data[parsedName] = [value];
    } else {
      data[name] = value;
    }
  });

  return data;
}

function isValidHTMLTag(tag) {
  try {
    const el = document.createElement(tag);
    return el.toString() !== "[object HTMLUnknownElement]";
  } catch {
    return false;
  }
}

function isEqual(obj, obj1) {
  if (isPrimitive(obj) && isPrimitive(obj1)) return obj === obj1;
  if (obj === obj1) return true;
  if (!obj || !obj1) return false;

  const objKeys = Object.keys(obj);
  const obj1Keys = Object.keys(obj1);
  if (objKeys.length !== obj1Keys.length) return false;
  if (!objKeys.every((key, index) => key === obj1Keys[index])) return false;

  if (obj.isPrototypeOf(obj1) || obj1.isPrototypeOf(obj)) return false;

  for (const prop in obj) {
    if (isObject(obj[prop]) && isObject(obj1[prop])) {
      if (!isEqual(obj[prop], obj1[prop])) return false;
    } else if (obj[prop] !== obj1[prop]) {
      return false;
    }
  }

  return true;
}

function isSelectorValid(selector) {
  try {
    const stylesheet = new CSSStyleSheet({ disabled: true });
    stylesheet.insertRule(`${selector} {}`);

    return !!stylesheet.cssRules.length;
  } catch {
    return false;
  }
}

function isArrayLike(arrayLike) {
  if (!arrayLike) return false;

  return (
    typeof arrayLike.length === "number" &&
    isIterable(arrayLike) &&
    !is(arrayLike, "string") &&
    !Array.isArray(arrayLike) &&
    !(arrayLike instanceof Node)
  );
}

export {
  isObject,
  isIterable,
  is,
  formDataToPlain,
  isValidHTMLTag,
  isEqual,
  isSelectorValid,
  isArrayLike,
};
