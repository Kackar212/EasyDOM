import $ from "./EasyDOM";
import { create, getHTML } from "./helpers";
import { formDataToPlain, is } from "./utils";

const serializeForm = (serializedData, form) => {
  const formDataPlain = formDataToPlain(form);
  const json = JSON.stringify(formDataPlain);

  if (!serializedData) return json;

  Object.assign(serializedData[1], formDataPlain);
  serializedData[0].push(json);

  return serializedData;
};

function serialize(onlyFirst = true, concat = false) {
  if (onlyFirst) {
    return serializeForm(undefined, this.getFirst());
  }

  const result = this.get().reduce(serializeForm, [[], {}]);

  if (concat) {
    return JSON.stringify(result[1]);
  }

  return result[0];
}

function empty(index) {
  if (typeof index !== "number") {
    this.html("");
  } else {
    this.get(index).innerHTML = "";
  }

  return this;
}

function html(content = undefined, append = false) {
  if (is(content, "undefined")) {
    return this.innerHTML();
  }

  let contentAsFunction = () => content;

  if (is(content, "function")) {
    contentAsFunction = content;
  }

  if (append) {
    this.__each((el) => {
      el.innerHTML += contentAsFunction(el.innerHTML, el);
    });
  } else {
    this.__each((el) => {
      el.innerHTML = contentAsFunction(el.innerHTML, el);
    });
  }

  return this;
}

function outerHTML() {
  return getHTML(this);
}

function innerHTML() {
  return getHTML(this, true);
}

function text(text = undefined, append = false) {
  const { $ } = this;

  if (is(text, "undefined")) {
    return this.getText();
  }

  let child = () => text;

  if (is(text, "function")) {
    child = text;
  }

  this.each((el, index) => {
    if (append) {
      el.append(create(child(el, index)));
    } else {
      el.get(0).textContent = child($(el), index);
    }
  });

  return this;
}

function getText({
  convertTo = String,
  callback = (value) => value,
  as = Array,
  first = true,
} = {}) {
  if (first) {
    return callback(convertTo(this.getFirst().textContent));
  }

  const content = this.get().map((el) => {
    return callback(convertTo(el.textContent));
  });

  return as === Array ? content : as(content);
}

function value(value = undefined, as = String) {
  if (!is(value, "undefined")) {
    this.__each((el) => {
      el.value = value;
    });
  }

  return as(this.getFirst().value);
}

function values() {
  const formData = new FormData();
  this.get().forEach((element) => {
    const key = element.name || element.id;
    if (!key) {
      return;
    }

    formData.append(key, element.value);
  }, {});

  return formDataToPlain(formData);
}

function fallbackCopyText(text) {
  const textarea = $.create("textarea", {
    value: text,
    style: { left: "-9999px", position: "fixed" },
    "aria-hidden": true,
  }).getFirst();

  document.body.appendChild(textarea);

  const focusedElement = document.querySelector(":focus");

  textarea.focus();
  textarea.select();

  const result = document.execCommand("copy");

  document.body.removeChild(textarea);

  if (focusedElement) focusedElement.focus();

  return result;
}

async function asyncCopyText() {
  return this.copyText();
}

function syncCopyText() {
  return this.copyText(false);
}

function copyText(async = true) {
  const element = this.getFirst();

  const text = element.value || element.textContent;

  if (!async || !(navigator.clipboard || {}).writeText) {
    return fallbackCopyText(text);
  }

  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  );
}

export {
  serialize,
  empty,
  html,
  outerHTML,
  innerHTML,
  text,
  getText,
  value,
  values,
  copyText,
  asyncCopyText,
  syncCopyText,
};
