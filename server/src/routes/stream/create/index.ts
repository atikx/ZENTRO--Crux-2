import { Router } from "express";
import { saveImgOnDisk } from "../../../middlewares/multer.middleware";
import { createStreamSchema } from "../../../zodSchema/zodSchema";
import { streams } from "../../../../db/schema";
import db from "../../../../db";

const router = Router();

router.post(
  "/",
  saveImgOnDisk.single("image"),
  async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const parseResult = createStreamSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: parseResult.error.flatten(),
        });
      }

      // Public URL for frontend
      const publicUrl = `${process.env.VITE_IMAGE_UPLOAD_URL}/${req.file.filename}`;

      // If validation passes, you can access the validated data
      const { title, description } = parseResult.data;

      // insert into db
      const [newStream] = await db
        .insert(streams)
        .values({
          title,
          description,
          thumbnail: publicUrl,
          status: "justCreated",
          hostId: req.user.dbId,
        })
        .returning();

      res.status(201).json({
        stream: newStream,
        message: "Stream created successfully",
      });
    } catch (error) {
      console.error("Error in /stream/create route:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
