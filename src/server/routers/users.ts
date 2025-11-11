import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const userRouter = express.Router();

/**
 * POST /users/register
 * Registrar un nuevo usuario con username, email y contraseña
 */
userRouter.post('/users/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validaciones básicas
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).send({ error: 'Todos los campos son requeridos' });
    }

    if (password !== confirmPassword) {
      return res.status(400).send({ error: 'Las contraseñas no coinciden' });
    }

    if (password.length < 6) {
      return res.status(400).send({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send({ error: 'El usuario o correo ya existen' });
    }

    // Hashear la contraseña (10 rondas de salt)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).send({
      message: 'Usuario registrado correctamente',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * POST /users/login
 * Iniciar sesión con username/email y contraseña
 */
userRouter.post('/users/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validaciones básicas
    if (!username || !password) {
      return res.status(400).send({ error: 'Username y contraseña requeridos' });
    }

    // Buscar usuario por username o email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).send({ error: 'Usuario o contraseña incorrectos' });
    }

    // Comparar contraseñas
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({ error: 'Usuario o contraseña incorrectos' });
    }

    // Login exitoso: devolver información del usuario
    res.status(200).send({
      message: 'Sesión iniciada correctamente',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * POST /users
 * Crear un nuevo usuario (legacy, deprecated - usar /users/register)
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
 * GET /users
 * Obtener la lista de usuarios
 */
userRouter.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / Number(limit));

    if (users.length === 0) {
      return res.status(404).send({ error: 'No se encontraron usuarios' });
    }

    res.send({
      page: Number(page),
      totalPages,
      totalResults: total,
      resultsPerPage: Number(limit),
      users,
    });
  } catch (error) {
  res.status(500).send({ error: (error as Error).message ?? String(error) });
}
});
/**
 * GET /users/:identifier
 * Obtener un usuario (por id o username)
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
 * PATCH /users/:identifier
 * Actualizar un usuario (por id o username)
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
 * DELETE /users/:identifier
 * Eliminar un usuario (por id o username)
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
 * POST /users/:identifier/friends/:friendIdentifier
 * Agregar un amigo (por id o username)
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
  res.status(500).send({ error: (error as Error).message ?? String(error) });
}
});

/**
 * DELETE /users/:identifier/friends/:friendIdentifier
 * Eliminar un amigo (por id o username)
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
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * POST /users/:identifier/block/:blockedIdentifier
 * Bloquear un usuario (por id o username)
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
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * DELETE /users/:identifier/block/:blockedIdentifier
 * Desbloquear un usuario (por id o username)
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
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

