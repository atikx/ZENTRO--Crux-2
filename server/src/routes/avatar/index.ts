import { Router } from "express";
import { saveImgOnDisk } from "../../middlewares/multer.middleware";
import db from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// FINAL upload folder
const finalUploadDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(finalUploadDir)) {
  fs.mkdirSync(finalUploadDir, { recursive: true });
  console.log("Created uploads folder:", finalUploadDir);
}

router.post("/", saveImgOnDisk.single("image"), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Public URL for frontend
    const publicUrl = `${process.env.VITE_IMAGE_UPLOAD_URL}/${req.file.filename}`;

    // Save in DB
    const [updatedUser] = await db
      .update(users)
      .set({ avatar: publicUrl })
      .where(eq(users.id, req.user.dbId))
      .returning();

    res.status(200).json({
      message: "Avatar updated successfully",
      imageUrl: publicUrl,
    });
  } catch (error) {
    console.error("Error in /saveImg route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
