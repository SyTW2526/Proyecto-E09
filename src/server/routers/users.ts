import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Trade } from '../models/Trade.js';
import { authMiddleware, AuthRequest} from '../middleware/authMiddleware.js';

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
 * Devuelve JWT para mantener sesión segura
 */
userRouter.post('/users/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ error: 'Username y contraseña requeridos' });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).send({ error: 'Usuario o contraseña incorrectos' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({ error: 'Usuario o contraseña incorrectos' });
    }


    const secret: string = process.env.JWT_SECRET || 'tu-clave-secreta';
    const expiresIn: string = process.env.JWT_EXPIRY || '7d';
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username
      },
      secret,
      { expiresIn: expiresIn as any }
    );

    // Login exitoso: devolver información del usuario + token
    res.status(200).send({
      message: 'Sesión iniciada correctamente',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || ""
      },
      token  // JWT para mantener sesión segura
    });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * PATCH /users/:username/profile-image
 * Actualiza la imagen de perfil
 */
userRouter.patch(
  '/users/:username/profile-image',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { username } = req.params;
      const { profileImage } = req.body;

      if (!profileImage) {
        return res.status(400).send({ error: "No se envió ninguna imagen" });
      }

      if (req.username !== username) {
        return res.status(403).send({ error: "No puedes modificar otro usuario" });
      }

      const user = await User.findOneAndUpdate(
        { username },
        { profileImage },
        { new: true }
      );

      if (!user) return res.status(404).send({ error: "Usuario no encontrado" });

      res.send({
        message: "Imagen actualizada",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        },
      });
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }
);



/**
 * PATCH /users/:identifier
 * Actualizar un usuario (por id o username)
 */
userRouter.patch('/users/:username', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOneAndUpdate(
      { username },
      req.body,
      { new: true }
    );

    if (!user) return res.status(404).send({ error: "Usuario no encontrado" });
    const secret = process.env.JWT_SECRET || "tu-clave-secreta";
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username
      },
      secret,
      { expiresIn: "7d" }
    );

    res.send({
      message: "Perfil actualizado",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      },
      token
    });

  } catch (err: any) {
    res.status(500).send({ error: err.message });
  }
});



/**
 * GET /users/:id/trades
 */
userRouter.get('/users/:id/trades', async (req, res) => {
  const userId = req.params.id;
  const trades = await Trade.find({
    $or: [
      { initiatorUserId: userId },
      { receiverUserId: userId }
    ]
  }).populate('initiatorUserId receiverUserId');

  res.send({ data: trades });
});

/**
 * GET /users/:identifier
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

    if (!user) return res.status(404).send({ error: 'Usuario no encontrado' });

    res.send(user);

  } catch (error) {
    res.status(500).send(error);
  }
});


/**
 * DELETE /users/:username
 * Eliminar cuenta de usuario
 */
userRouter.delete('/users/:username', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;

    if (req.username !== username) {
      return res.status(403).send({ error: "No puedes eliminar otra cuenta" });
    }

    const user = await User.findOneAndDelete({ username });

    if (!user) {
      return res.status(404).send({ error: "Usuario no encontrado" });
    }

    res.send({ message: "Cuenta eliminada correctamente" });

  } catch (err: any) {
    res.status(500).send({ error: err.message });
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

/**
 * DELETE /users/:username/profile-image
 * Elimina la foto de perfil (la deja vacía)
 */
userRouter.delete('/users/:username/profile-image', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;

    if (req.username !== username) {
      return res.status(403).send({ error: "No puedes modificar otro usuario" });
    }

    const user = await User.findOneAndUpdate(
      { username },
      { profileImage: "" },
      { new: true }
    );

    if (!user) return res.status(404).send({ error: "Usuario no encontrado" });

    res.send({
      message: "Foto eliminada",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: ""
      }
    });
  } catch (err: any) {
    res.status(500).send({ error: err.message });
  }
});
