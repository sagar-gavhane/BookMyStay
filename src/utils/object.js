const is_object_empty = (obj) => {
  if (!obj) return false;
  if (obj.constructor !== Object) return false;

  return obj && Object.keys(obj).length === 0;
};

module.exports = {
  is_object_empty,
};
