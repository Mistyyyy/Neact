// generate the vdom data staructure
import { renderProps } from './renderProps';
import { reconcile } from './concile';

function createPublicInstance(element, internalInstance) {
  const { type, props } = element;
  const publicInstance = new type(props);

  publicInstance.__internalInstance = internalInstance;
  return publicInstance;
}

function updateInstance(internalInstance) {
  const parentDom = internalInstance.dom.parentNode;
  const element = internalInstance.element;
  reconcile(parentDom, internalInstance, element);
}

function instantiate(element) {
  let dom 
  const { type, props } = element;
  const isDomElement = typeof type === 'string';

  if (isDomElement) {
    if (isTextElement(type)) dom = document.createTextNode('');
    else dom = document.createElement(type)
    // we may not need render props, we should undate
    renderProps(dom, props);
  
    const childElements = props.children || [];
    const childInstances = childElements.map(instantiate);
    const childDoms = childInstances.map(childInstance => childInstance.dom);
    childDoms.forEach(childDom => dom.appendChild(childDom));
  
    const instance = {
      dom,
      element,
      childInstances
    };
  
    return instance;

  } else {
    const instance = {};
    const publicInstance = createPublicInstance(element, instance);
    const childElement = publicInstance.render();
    const childInstance = instantiate(childElement);

    const dom = childInstance.dom;
    Object.assign(instance, { dom, childInstance, element, publicInstance });
    return instance;
  }

}

function isTextElement(type) {
  return type === 'TEXT ELEMENT'
}

export {
  instantiate,
  updateInstance
}
