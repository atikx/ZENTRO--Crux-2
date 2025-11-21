import jwt from "jsonwebtoken";

export const generateToken = (id: string) => {
  return jwt.sign({ dbId: id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "1d",
  });
};
