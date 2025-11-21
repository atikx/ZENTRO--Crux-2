import express from "express";
import routes from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public/uploads"))
);

app.get("/", (req, res) => {
  res.send("Hello, World Atiksh!");
});
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
