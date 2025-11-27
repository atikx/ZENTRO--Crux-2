import { Router } from "express";
import db from "../../../../db";
import { streams } from "../../../../db/schema";
import { and, eq } from "drizzle-orm";

const router = Router();

router.get("/:streamId", async (req: any, res) => {
  try {
    const { streamId } = req.params;

    // Fetch initial data for the stream from the database
    const [streamData] = await db
      .select()
      .from(streams)
      .where(and(eq(streams.id, streamId), eq(streams.hostId, req.user.dbId)));

    if (!streamData) {
      return res
        .status(404)
        .json({ message: "Stream not found, Please create stream first" });
    }

    if (streamData.status !== "justCreated") {
      return res
        .status(400)
        .json({ message: "Stream already started or ended" });
    }

    res
      .status(200)
      .json({
        stream: streamData,
        message: "Initial stream data fetched successfully",
      });
  } catch (error) {
    console.error("Error in /stream/getInitialData route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
