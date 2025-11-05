import express from 'express';
import { User } from '../models/User.js';

export const userRouter = express.Router();

/**
 * Ruta para crear un nuevo usuario
 */
userRouter.post("/users", async (req, res) => {
  const user = new User(req.body);

  user
    .save()
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});
