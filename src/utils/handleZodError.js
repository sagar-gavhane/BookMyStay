const handleZodError = (error) => {
  const result = {};

  error.issues.forEach((issue) => {
    result[issue.path] = issue.message;
  });

  return result;
};

module.exports = handleZodError;
