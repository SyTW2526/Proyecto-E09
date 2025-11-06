import express from 'express';
import { UserCard } from '../models/UserCard.js';
import { User } from '../models/User.js';

export const userCardRouter = express.Router();

/**
 * Ruta para crear una carta para un usuario
 */
userCardRouter.post('/users/:username/cards', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }

    const newCard = new UserCard({
      ...req.body,
      userId: user._id
    });

    await newCard.save();
    res.status(201).send(newCard);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * Ruta para obtener todas las cartas de un usuario
 */
userCardRouter.get('/users/:username/cards', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }
    const cards = await UserCard.find({ userId: user._id });
    res.send(cards);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * Ruta para actualizar una carta del usuario
 */
userCardRouter.patch('/users/:username/cards/:userCardId', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }

    const userCard = await UserCard.findOneAndUpdate(
      { _id: req.params.userCardId, userId: user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!userCard) {
      return res.status(404).send({ error: 'Carta no encontrada' });
    }

    res.send(userCard);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * Ruta para eliminar una carta del usuario
 */
userCardRouter.delete('/users/:username/cards/:userCardId', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }
    const deletedCard = await UserCard.findOneAndDelete({
      _id: req.params.userCardId,
      userId: user._id
    });
    if (!deletedCard) {
      return res.status(404).send({ error: 'Carta no encontrada' });
    }
    res.send({ message: 'Carta eliminada correctamente', deletedCard });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
