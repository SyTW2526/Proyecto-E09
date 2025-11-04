import express from 'express';
import './db/mongoose.js';

import { defaultRouter } from './routers/default.js';
import { userRouter } from './routers/users.js';
import { pokemonRouter } from './routers/pokemon.js';

export const app = express();
app.use(express.json());
app.use(userRouter);
app.use(pokemonRouter);
app.use(defaultRouter);
