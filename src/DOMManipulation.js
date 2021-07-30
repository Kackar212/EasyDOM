import { createFragment, insert, toNodes } from "./helpers";

function after(content, clone = false) {
  this.__each((refChild) => {
    const { nextElementSibling, parentElement } = refChild;
    insert(parentElement, content, nextElementSibling, clone);
  });
}

function before(content, clone = false) {
  this.__each((refChild) => {
    const { parentElement } = refChild;
    insert(parentElement, content, refChild, clone);
  });

  return this;
}

function append(elements, clone = false) {
  this.__each((node) => insert(node, elements, undefined, clone));

  return this;
}

function appendTo(container, clone = false) {
  this.__each((node) => insert(container, node, undefined, clone));

  return this;
}

function remove() {
  this.__each((el, index) => {
    el.remove();
  });
}

function removeChild(children) {
  return this.__each((el) =>
    toNodes(children, el).forEach((child) => el.removeChild(child))
  );
}

function replace(newNode, oldNode) {
  const newNodes = toNodes(newNode);

  this.__each((parent) => {
    const oldNodes = toNodes(oldNode, parent);

    parent.replaceChild(createFragment(newNodes, true), oldNodes[0]);

    delete createFragment(oldNodes);
  });

  return this;
}

export { after, before, remove, removeChild, append, appendTo, replace };
