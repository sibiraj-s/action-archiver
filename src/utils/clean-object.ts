type ObjectType = Record<string, any>;

const cleanObj = (obj: ObjectType): ObjectType => {
  const output: ObjectType = {};

  return Object.keys(obj).reduce((acc, key) => {
    const val = obj[key];

    if (val) {
      acc[key] = val;
    }

    return acc;
  }, output);
};

export default cleanObj;
