const TEXT_ELEMENT = 'TEXT ELEMENT';

function createElement(type, props, ...child) {
  props = Object.assign({}, props || {});

  let children = child.length ? [].concat(...child) : [];

  children = children
    .filter(c => c != null && c !== false) // we need exclude the falsy value
    .map(c => c instanceof Object ? c : createTextElement(c))

  return {
    type,
    props: {
      ...props,
      children
    }
  }
}

function createTextElement(value) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: value
    }
  }
}

export {
  createElement
}
