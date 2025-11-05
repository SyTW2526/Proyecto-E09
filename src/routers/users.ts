import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const userRouter = express.Router();

/**
 * Ruta para crear un nuevo usuario
 */
userRouter.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Ruta para obtener la lista de usuarios
 */
userRouter.get('/users', async (req, res) => {
  try {
    const filter = req.query ? req.query : {};
    const users = await User.find(filter);
    if (users.length > 0) {
      res.send(users);
    } else {
      res.status(404).send({ error: 'No se encontraron usuarios' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Ruta para obtener un usuario (por id o username)
 */
userRouter.get('/users/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { username: identifier };
    const user = await User.findOne(filter)
      .populate('friends', 'username email')
      .populate('blockedUsers', 'username email');
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * Ruta para actualizar un usuario (por id o username)
 */
userRouter.patch('/users/:identifier', async (req, res) => {
  const allowedUpdates = [
    'username',
    'email',
    'password',
    'profileImage',
    'settings',
    'friends',
    'blockedUsers'
  ];
  const updates = Object.keys(req.body);
  const isValid = updates.every((key) => allowedUpdates.includes(key));
  if (!isValid) {
    return res.status(400).send({ error: 'Actualización no permitida' });
  }

  try {
    const { identifier } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(identifier)? { _id: identifier }: { username: identifier };
    const user = await User.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    });
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});
/**
 * Ruta para eliminar un usuario (por id o username)
 */
userRouter.delete('/users/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(identifier)? { _id: identifier }: { username: identifier };
    const user = await User.findOneAndDelete(filter);
    if (user) {
      res.send({ message: 'Usuario eliminado correctamente', user });
    } else {
      res.status(404).send({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Ruta para agregar un amigo (por id o username)
 */
userRouter.post('/users/:identifier/friends/:friendIdentifier', async (req, res) => {
  try {
    const { identifier, friendIdentifier } = req.params;
    const user = await (mongoose.Types.ObjectId.isValid(identifier)? User.findById(identifier) : User.findOne({ username: identifier }));
    const friend = await (mongoose.Types.ObjectId.isValid(friendIdentifier)? User.findById(friendIdentifier) : User.findOne({ username: friendIdentifier }));
    if (!user || !friend) {
      return res.status(404).send({ error: 'Usuario o amigo no encontrado' });
    }
    if (!user.friends.includes(friend._id)) {
      user.friends.push(friend._id);
      await user.save();
    }
    res.send({ message: 'Amigo agregado', user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * Ruta para eliminar un amigo (por id o username)
 */
userRouter.delete('/users/:identifier/friends/:friendIdentifier', async (req, res) => {
  try {
    const { identifier, friendIdentifier } = req.params;
    const user = await (mongoose.Types.ObjectId.isValid(identifier)? User.findById(identifier) : User.findOne({ username: identifier }));
    const friend = await (mongoose.Types.ObjectId.isValid(friendIdentifier)? User.findById(friendIdentifier) : User.findOne({ username: friendIdentifier }));
    if (!user || !friend) {
      return res.status(404).send({ error: 'Usuario o amigo no encontrado' });
    }
    user.friends = user.friends.filter((id) => id.toString() !== friend._id.toString());
    await user.save();
    res.send({ message: 'Amigo eliminado', user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * Ruta para bloquear un usuario (por id o username)
 */
userRouter.post('/users/:identifier/block/:blockedIdentifier', async (req, res) => {
  try {
    const { identifier, blockedIdentifier } = req.params;
    const user = await (mongoose.Types.ObjectId.isValid(identifier)? User.findById(identifier) : User.findOne({ username: identifier }));
    const blockedUser = await (mongoose.Types.ObjectId.isValid(blockedIdentifier)? User.findById(blockedIdentifier) : User.findOne({ username: blockedIdentifier }));
    if (!user || !blockedUser) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }
    if (!user.blockedUsers.includes(blockedUser._id)) {
      user.blockedUsers.push(blockedUser._id);
      await user.save();
    }
    res.send({ message: 'Usuario bloqueado', user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * Ruta para desbloquear un usuario (por id o username)
 */
userRouter.delete('/users/:identifier/block/:blockedIdentifier', async (req, res) => {
  try {
    const { identifier, blockedIdentifier } = req.params;
    const user = await (mongoose.Types.ObjectId.isValid(identifier) ? User.findById(identifier) : User.findOne({ username: identifier }));
    const blockedUser = await (mongoose.Types.ObjectId.isValid(blockedIdentifier) ? User.findById(blockedIdentifier) : User.findOne({ username: blockedIdentifier }));
    if (!user || !blockedUser) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }
    user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== blockedUser._id.toString());
    await user.save();
    res.send({ message: 'Usuario desbloqueado', user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

