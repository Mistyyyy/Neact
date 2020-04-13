import { HOST_ROOT, CLASS_COMPONENT } from './types';

const ENOUGH_TIME = 1; // milliseconds

let updateQueue = [];
let nextUnitOfWork = null;

function schedule(task) {
  workQueue.push(task);

  requestIdleCallback(performWork);
}

// we need find the first unit of work and invole it
// when invoke the render() or setState(), the task start executing
function resetNextUnitOfWork() {
  const update = updateQueue.shift();

  // there is no spare work to do, return it
  if (!update) return

  if (update.partialState) {
    // we need copy the partialState to class conponent fiber to update the ui correctly
    update.instance.__fiber.partialState = update.partialState
  }

  const root = update.from === 'HOST_ROOT' ?
    update.dom.__rootContainerFiber :
    getRoot(update.instance.__fiber)

  nextUnitOfWork = {
    tag: HOST_ROOT,
    stateNode: update.dom || root.stateNode,
    props: update.newProps || root.props,
    alternate: root
  }
}

function getRoot(fiber) {
  let node = fiber;
  while (node.parent) {
    node = node.parent
  }
  return node
}

function performWork(deadline) {
  workLoop(deadline);

  if (nextUnitOfWork || workQueue.length > 0) requestIdleCallback(performWork)
}

function workLoop(deadline) {
  if (!nextUnitOfWork) resetNextUnitOfWork();

  while (nextUnitOfWork && deadline.timeRemaining() >= ENOUGH_TIME) {
    // performUnitOfWork is working on find the updated part of tree
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (pendingCommit) {
    /** 
     * commitAllWork will mutate the dom, update dom should be constant
     */
    commitAllWork(pendingCommit);
  }
}

function performUnitOfWork(wipFiber) {
  beginWork(wipFiber);
  if (wipFiber.child) return wipFiber.child;

  // if no child, we should check the sibling of the fiber
  let uow = wipFiber;
  while (uow) {
    completeWork(uow);

    if (uow.sibling) {
      return uow.sibling;
    }
    // check the parent
    uow = uow.parent;
  }
}

function beginWork(wipFiber) {
  if (wipFiber.tag === CLASS_COMPONENT) {
    updateClassComponent(wipFiber);
  } else {
    updateHostComponent(wipFiber);
  }
}

function updateHostComponent(wipFiber) {
  if (!wipFiber.stateNode) wipFiber.stateNode = createDomElement(wipFiber);

  const newChildElements = wipFiber.newProps.children;

  reconcileChildrenArray(wipFiber, newChildElements);
}

function updateClassComponent(wipFiber) {
  let instance = wipFiber.stateNode;
  if (instance == null) {
    instance = wipFiber.stateNode = createInstance(wipFiber);
  } else if (wipFiber.props === instance.props && !wipFiber.partialState) {
    cloneChildFibers(wipFiber);
    return;
  }

  instance.props = wipFiber.props;
  instance.state = Object.assign({}, instance.state, wipFiber.partialState);
  wipFiber.partialState = null;
  const newChildElements = wipFiber.stateNode.render();
  reconcileChildrenArray(wipFiber, newChildElements);
}

function cloneChildFibers(parentFiber) {
  const oldFiber = parentFiber.alternate;

  if (!oldFiber.child) {
    return;
  }

  let oldChild = oldFiber.child;
  let prevChild = null;
  while (oldFiber) {
    const newChild = {
      type: oldChild.type,
      tag: oldChild.tag,
      stateNode: oldChild.stateNode,
      props: oldChild.props,
      partialState: oldChild.partialState,
      alternate: oldChild,
      parent: parentFiber
    };

    if (prevChild) {
      prevChild.sibling = newChild;
    } else {
      parentFiber.child = newChild;
    }

    prevChild = newChild;
    oldChild = oldChild.sibling;
  }
}

function completeWork(fiber) {
  if (fiber.tag === CLASS_COMPONENT) {
    fiber.stateNode.__fiber = fiber;
  }

  if (fiber.parent) {
    const childEffects = fiber.effects || [];
    const thisEffects = fiber.effectTag === null ? [] : [fiber];
    const parentEffects = fiber.parent.effects || [];
    fiber.parent.effects = parentEffects.concat(childEffects, thisEffects);
  } else {
    pendingCommit = fiber;
  }
}

function commitAllWork(fiber) {
  fiber.effects.forEach(f => {
    commitWork(f);
  });
  fiber.stateNode._rootContainerFiber = fiber;
  nextUnitOfWork = null;
  pendingCommit = null;
}

function commitWork(fiber) {
  if (fiber.tag == HOST_ROOT) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (domParentFiber.tag == CLASS_COMPONENT) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.stateNode;

  if (fiber.effectTag == PLACEMENT && fiber.tag == HOST_COMPONENT) {
    domParent.appendChild(fiber.stateNode);
  } else if (fiber.effectTag == UPDATE) {
    updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag == DELETION) {
    commitDeletion(fiber, domParent);
  }
}

function commitDeletion(fiber, domParent) {
  let node = fiber;
  while (true) {
    if (node.tag == CLASS_COMPONENT) {
      node = node.child;
      continue;
    }
    domParent.removeChild(node.stateNode);
    while (node != fiber && !node.sibling) {
      node = node.parent;
    }
    if (node == fiber) {
      return;
    }
    node = node.sibling;
  }
}

export {
  performWork
}
