import bcrypt from "bcryptjs";

const generateHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const compareHash = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export { generateHash, compareHash };
