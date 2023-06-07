const handle_zod_error = (error) => {
  const result = {};

  error.issues.forEach((issue) => {
    result[issue.path] = issue.message;
  });

  return result;
};

module.exports = handle_zod_error;
