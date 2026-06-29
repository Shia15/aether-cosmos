import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";

const router: IRouter = Router();

interface Note {
  id: string;
  author: string;
  message: string;
  shape: string;
  createdAt: number;
}

const notes: Note[] = [];
const MAX = 300;

const VALID_SHAPES = new Set(["earth", "moon", "sun", "star", "comet", "galaxy"]);

router.get("/community/notes", (_req, res) => {
  res.json({ notes: notes.slice().reverse() });
});

router.post("/community/notes", (req, res) => {
  const { author, message, shape } = req.body as {
    author: unknown; message: unknown; shape: unknown;
  };
  if (typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ error: "message required" });
    return;
  }
  const note: Note = {
    id: randomUUID(),
    author: typeof author === "string" && author.trim().length > 0
      ? author.trim().slice(0, 48)
      : "Anonymous",
    message: message.trim().slice(0, 320),
    shape: VALID_SHAPES.has(shape as string) ? (shape as string) : "star",
    createdAt: Date.now(),
  };
  if (notes.length >= MAX) notes.shift();
  notes.push(note);
  res.json({ ok: true, note });
});

export default router;
