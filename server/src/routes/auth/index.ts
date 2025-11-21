import { Router } from "express";
import { users } from "../../../db/schema";
import serviceAccount from "../../configs/firebase-admin.json" assert { type: "json" };
import admin from "firebase-admin";
import db from "../../../db/index";
import { eq } from "drizzle-orm";
import { generateToken } from "../../functions/tokenGenerator";
import { authenticateToken } from "../../middlewares/jwtAuth";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const router = Router();

router.post("/", async (req, res) => {
  try {
    // Verify Firebase token

    if (!req.body.token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await admin.auth().verifyIdToken(req.body.token);
    if (!user) {
      return res.status(401).json({ message: "Wrong token" });
    }

    // check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email as string));

    if (existingUser.length > 0) {
      res.cookie("token", generateToken(existingUser[0].id), {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ message: "Logged In Successfully", user: existingUser[0] });
    }

    // Create new user if not exists
    function randomSuffix() {
      return Math.random().toString(36).slice(2, 7); // 5 chars
    }

    const base = user.name?.replace(/\s+/g, "").toLowerCase() || "user";
    const username = `${base}_${randomSuffix()}`;

    const newUser = await db
      .insert(users)
      .values({
        name: user.name as string,
        email: user.email as string,
        username: username,
      })
      .returning();

    res.cookie("token", generateToken(newUser[0].id), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Registered Successfully", user: newUser[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getuser", authenticateToken, async (req: any, res) => {
  try {
    // find user by id
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.dbId));

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: user[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
