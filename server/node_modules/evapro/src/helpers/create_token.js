import jwt from "jsonwebtoken";

const createToken = (userId, role, expiresIn = "7d") => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn,
  });
};
export default createToken;
