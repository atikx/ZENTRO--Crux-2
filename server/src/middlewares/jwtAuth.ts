import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.cookies["token"];
  if (token == null) return res.status(401).send("Please Login First");

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any, user: any) => {
    if (err) return res.sendStatus(403).send("Invalid Token");
    req.user = user;
    next();
  });
};

export { authenticateToken };
