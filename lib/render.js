/** 
 * info: 处理的要求是所有的 element 都需要有 type 与 props 属性。那么，如何处理文本节点呢？
 * 
 * 如果在 createElement 阶段，对文本节点做额外的处理，即增加 type 属性与 props.nodeValue 属性，可以达到同样的效果
*/
import { reconcile } from './tool/concile';
import { HOST_ROOT, CLASS_COMPONENT } from './tool/types';
import { performWork } from './tool/fiber';

/** 
 * 
 * const textElement = {
 *  type: "span",
 *  props: {
 *    children: [
 *      {
 *        type: "TEXT ELEMENT",
 *        props: { nodeValue: "Foo" }
 *      }
 *    ]
 *  }
 *  };
*/

let rootInstance = null;
const updateQueue = [];
let nextUnitOfWork = null;
let pendingCommit = null;

function render(element, parentDom) {
  updateQueue.push({
    from: HOST_ROOT,
    dom: parentDom,
    newProps: { children: element }
  })

  requestIdleCallback(performWork);
  // const preInstance = rootInstance;
  // const nextInstance = reconcile(parentDom, preInstance, element);
  // rootInstance = nextInstance;
}

function scheduleUpdate(instance, partialState) {
  updateQueue.push({
    from: CLASS_COMPONENT,
    instance, 
    partialState
  })

  requestIdleCallback(performWork)
}

export {
  render
}

