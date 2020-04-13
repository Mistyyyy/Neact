function arrify(val) {
  return val == null
    ? []
    : Array.isArray(val)
      ? val
      : [val]
}

export {
  arrify
}
