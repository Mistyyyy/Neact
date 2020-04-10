function renderProps(currentDom, props) {
  const allProps = Object.keys(props);

  for(const prop of allProps) {
    // only valid prop can be apply to dom
    if (isEventListener(prop, props[prop])) renderEvent(prop, props[prop], currentDom)
    else if (prop !== 'children') renderAttribute(prop, props[prop], currentDom);
  }
}

function updeteDomProperties(currentDom, preProps, nextProps) {
  const allOldProps = Object.keys(preProps);

  for(const oldProp of allOldProps) {
    if (isEventListener(oldProp, preProps[oldProp])) 
      removeEvent(oldProp, preProps[oldProp], currentDom)
    else if (oldProp !== 'children') renderAttribute(oldProp, null, currentDom)
  }

  renderProps(currentDom, nextProps)
}


// 处理普通的属性节点
function renderAttribute(prop, value, currentDom) {
  currentDom[prop] = value;
}

// 处理事件
function renderEvent(prop, value, currentDom) {
  const eventType = prop[2].toLowerCase() + prop.slice(3);

  currentDom.addEventListener(eventType, value)
}

function removeEvent(prop, value, currentDom) {
  const eventType = prop[2].toLowerCase() + prop.slice(3);
  currentDom.removeEventListener(eventType, value)
}

// <div onClick={() => {}}>
function isEventListener(prop, value) {
  return prop.startsWith('on') && typeof value === 'function';
}

export {
  renderProps,
  updeteDomProperties
}
