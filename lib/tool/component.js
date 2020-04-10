import { updateInstance } from  './vdom';

class Component {
  constructor(props) {
    this.props = props;
    this.state = this.state || {}
  }

  setState(partialState) {
    this.state = Object.assign({}, this.state, partialState);
    updateInstance(this.__internalInstance)
  }
}

export {
  Component
}
