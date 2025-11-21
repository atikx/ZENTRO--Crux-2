import {Router} from "express";
import authRouter from "./auth";
import avatarRouter from "./avatar";
import streamRouter from "./stream";
import { authenticateToken } from "../middlewares/jwtAuth";

const router = Router();

router.use("/auth", authRouter);
router.use("/avatar", authenticateToken, avatarRouter);
router.use("/stream", streamRouter);

export default router;
