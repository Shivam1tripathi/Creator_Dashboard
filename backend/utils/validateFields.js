const validateFields = (fields, req) => {
  for (const field of fields) {
    if (!req.body[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
};

export default validateFields;
