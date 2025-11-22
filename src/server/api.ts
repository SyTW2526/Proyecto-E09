import express from "express";
import cors from "cors";
import "./db/mongoose.js";

import { defaultRouter } from "./routers/default.js";
import { userRouter } from "./routers/users.js";
import { pokemonRouter } from "./routers/pokemon.js";
import { userCardRouter } from "./routers/usercard.js";
import { tradeRouter } from "./routers/trade.js";
import { cardRouter } from "./routers/card.js";
import { syncRouter } from "./routers/api.js";
import { notificationRouter } from "./routers/notification.js";
import { preferencesRouter } from "./routers/preferences.js";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(userRouter);
app.use(notificationRouter);
app.use(preferencesRouter);
app.use(syncRouter);
app.use(cardRouter);
app.use(tradeRouter);
app.use(userCardRouter);
app.use(pokemonRouter);
app.use(defaultRouter);
