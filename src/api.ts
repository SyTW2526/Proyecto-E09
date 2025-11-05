import express from 'express';
import './db/mongoose.js';

import { defaultRouter } from './server/routers/default.js';
import { userRouter } from './server/routers/users.js';
import { pokemonRouter } from './server/routers/pokemon.js';

export const app = express();
app.use(express.json());
app.use(userRouter);
app.use(pokemonRouter);
app.use(defaultRouter);
