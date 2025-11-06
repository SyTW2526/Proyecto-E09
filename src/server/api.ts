import express from 'express';
import './db/mongoose.js';

import { defaultRouter } from './routers/default.js';
import { userRouter } from './routers/users.js';
import { pokemonRouter } from './routers/pokemon.js';
import { userCardRouter } from './routers/usercard.js';
import { tradeRouter } from './routers/trade.js';
import { cardRouter } from './routers/card.js';
import { syncRouter } from './routers/api.js';

export const app = express();
app.use(express.json());
app.use(userRouter);
app.use(syncRouter);
app.use(cardRouter);
app.use(tradeRouter);
app.use(userCardRouter);
app.use(pokemonRouter);
app.use(defaultRouter);
