import { instantiate } from './vdom';
import { arrify } from './util';
import { UPDATE, HOST_COMPONENT, CLASS_COMPONENT, PLACEMENT, DELECION } from './types';
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

function reconcileChildrenArray(wipFiber, newChildElements) {
  const elements = arrify(newChildElements);

  let index = 0;
  let oldFiber = wipFiber.alternate ? wipFiber.alternate : null;
  let newFiber = null;
  while (index < elements.length || oldFiber !== null) {
    const preFiber = newFiber;
    const element = index < elements.length && elements[index]
    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        tag: oldFiber.tag,
        stateNode: oldFiber.stateNode,
        props: element.props,
        parent: wipFiber,
        alternate: oldFiber,
        partialState: oldFiber.partialState,
        effectTag: UPDATE
      }
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        tag: typeof element.type === 'string' ?
          HOST_COMPONENT :
          CLASS_COMPONENT,
        props: element.props,
        parent: wipFiber,
        effectTag: PLACEMENT,
      }
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = DELECION;
      wipFiber.effects = wipFiber.effects || [];
      wipFiber.effects.push(oldFiber)
    }

    if (oldFiber) oldFiber = oldFiber.sibling;
    if (index === 0) wibFiber.child = newFiber;
    else if (prevFiber.sibling = newFiber)

      index++;
  }
}
export {
  reconcile,
  reconcileChildren
}
