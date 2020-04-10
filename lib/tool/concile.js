import { instantiate } from './vdom';
import { updeteDomProperties } from './renderProps';

function reconcile(parentDom, instance, element) {
  let newInstance;
  if (!instance) {
    newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
  } else if (element === null) {
    parentDom.removeChild(instance.dom);
    return null;
  } else if (instance.element.type !== element.type) {
    newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, instance.dom);
    return newInstance;
  } else if (typeof element.type === 'string') {
    updeteDomProperties(instance.dom, instance.element.props, element.props);
    instance.childInstances = reconcileChildren(instance, element);
    instance.element = element;
    return instance;
  } else {
    instance.publicInstance.props = element.props;
    const childElements = instance.publicInstance.render();
    const oldChildInstance = instance.childInstance;
    const childInstance = reconcile(parentDom, oldChildInstance, childElements);
    instance.dom = childInstance.dom;
    instance.childInstance = childInstance;
    instance.element = element;
    return instance;
  }
  return newInstance;
}

function reconcileChildren(instance, element) {
  const dom = instance.dom;
  const childInstances = instance.childInstances;
  const nextChildElements = element.props.children || [];
  const newChildInstances = [];
  const count = Math.max(childInstances.length, nextChildElements.length);

  for (let i = 0; i < count; i++) {
    const childInstance = childInstances[i];
    const childElement = nextChildElements[i];
    const newChildInstance = reconcile(dom, childInstance, childElement);
    newChildInstances.push(newChildInstance)
  }

  return newChildInstances;
}

export {
  reconcile,
  reconcileChildren
}
