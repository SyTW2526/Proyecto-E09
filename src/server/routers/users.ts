import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Trade } from '../models/Trade.js';
import { UserCard } from '../models/UserCard.js';
import { Card } from '../models/Card.js';
import { PokemonCard } from '../models/PokemonCard.js';
import { TrainerCard } from '../models/TrainerCard.js';
import { EnergyCard } from '../models/EnergyCard.js';
import { getCardById } from '../services/pokemon.js';
import { upsertCardFromRaw } from '../services/cards.js';
import { authMiddleware, AuthRequest, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

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
    const { username: newUsername, email: newEmail } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ error: "USER_NOT_FOUND" });

    if (newUsername && newUsername !== user.username) {
      const existsUser = await User.findOne({ username: newUsername });
      if (existsUser) {
        return res.status(400).send({ error: "USERNAME_EXISTS" });
      }
    }

    if (newEmail && newEmail !== user.email) {
      const existsEmail = await User.findOne({ email: newEmail });
      if (existsEmail) {
        return res.status(400).send({ error: "EMAIL_EXISTS" });
      }
    }

    if (newUsername) user.username = newUsername;
    if (newEmail) user.email = newEmail;

    await user.save();
    const secret = process.env.JWT_SECRET || "tu-clave-secreta";
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
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
 * GET /users/:identifier/cards
 * Obtiene cartas de la colección o wishlist de un usuario.
 * Query params: collection=collection|wishlist, page, limit
 * Si el requester no es el propio usuario, sólo devolverá las cartas publicadas (isPublic=true).
 */
userRouter.get('/users/:identifier/cards', optionalAuthMiddleware, async (req: any, res) => {
  try {
    const { identifier } = req.params;
    const { collection = 'collection', page = 1, limit = 20 } = req.query as any;
    const filterUser = mongoose.Types.ObjectId.isValid(identifier) ? { _id: identifier } : { username: identifier };
    const user = await User.findOne(filterUser);
    if (!user) return res.status(404).send({ error: 'Usuario no encontrado' });

    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { userId: user._id, collectionType: collection };

    // si el requester no es el owner, mostrar sólo públicas
    const requesterId = (req as AuthRequest).userId;
    if (!requesterId || requesterId.toString() !== user._id.toString()) {
      filter.isPublic = true;
    }

    const total = await UserCard.countDocuments(filter);
    const cards = await UserCard.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('cardId');

    res.send({ page: Number(page), totalResults: total, resultsPerPage: Number(limit), cards });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * POST /users/:identifier/cards
 * Agregar una carta a la colección o wishlist del usuario.
 * Body: { pokemonTcgId?, cardId?, autoFetch?, quantity?, condition?, isPublic?, isFavorite?, collectionType?, notes?, forTrade? }
 */
userRouter.post('/users/:identifier/cards', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { identifier } = req.params;
    const filterUser = mongoose.Types.ObjectId.isValid(identifier) ? { _id: identifier } : { username: identifier };
    const user = await User.findOne(filterUser);
    if (!user) return res.status(404).send({ error: 'Usuario no encontrado' });

    // sólo el propio usuario puede modificar su colección
    if (req.userId?.toString() !== user._id.toString()) return res.status(403).send({ error: 'No autorizado' });

    const {
      pokemonTcgId,
      cardId,
      autoFetch = false,
      quantity = 1,
      condition = 'Near Mint',
      isPublic = false,
      isFavorite = false,
      collectionType = 'collection',
      notes = '',
      forTrade = false
    } = req.body;

    let cardRefId = cardId;

    // buscar por pokemonTcgId si no se proporcionó cardId
    if (!cardRefId && pokemonTcgId) {
      const found = await Promise.any([
        PokemonCard.findOne({ pokemonTcgId }).lean(),
        TrainerCard.findOne({ pokemonTcgId }).lean(),
        EnergyCard.findOne({ pokemonTcgId }).lean(),
        Card.findOne({ pokemonTcgId }).lean()
      ]).catch(() => null);

      if (found) {
        cardRefId = (found as any)._id;
      } else if (autoFetch && pokemonTcgId) {
        // traer de la API externa y persistir con el helper
        const apiResp = await getCardById(pokemonTcgId);
        const raw = apiResp.data ?? apiResp;
        const saved = await upsertCardFromRaw(raw);
        cardRefId = saved?._id;
      }
    }

    if (!cardRefId) return res.status(404).send({ error: 'Card not found. Provide cardId or pokemonTcgId (use autoFetch=true to fetch)' });

    // si ya existe una entrada idéntica (mismo user, misma carta, mismo tipo de colección y condición), aumentar cantidad
    const existingFilter: any = {
      userId: user._id,
      cardId: cardRefId,
      collectionType,
      condition
    };

    const existing = await UserCard.findOne(existingFilter);
    if (existing) {
      // incrementar cantidad de forma atómica
      const updated = await UserCard.findOneAndUpdate(
        existingFilter,
        {
          $inc: { quantity: Number(quantity) || 1 },
          $set: {
            // actualizar flags si se pasan en la petición
            isPublic: typeof isPublic === 'boolean' ? isPublic : existing.isPublic,
            isFavorite: typeof isFavorite === 'boolean' ? isFavorite : existing.isFavorite,
            forTrade: typeof forTrade === 'boolean' ? forTrade : existing.forTrade,
            // sólo sobreescribir notas si se envían
            notes: notes !== '' ? notes : existing.notes
          }
        },
        { new: true }
      );

      return res.status(200).send({ message: 'Existing card quantity incremented', userCard: updated });
    }

    const userCard = new UserCard({
      userId: user._id,
      cardId: cardRefId,
      pokemonTcgId: pokemonTcgId || '',
      condition,
      isPublic,
      isFavorite,
      acquisitionDate: new Date(),
      notes,
      quantity,
      forTrade,
      collectionType
    });

    await userCard.save();
    return res.status(201).send({ message: 'Card added to user collection', userCard });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * PATCH /users/:identifier/cards/:userCardId
 * Actualiza campos de una UserCard (quantity, condition, forTrade, isFavorite, isPublic, notes)
 */
userRouter.patch('/users/:identifier/cards/:userCardId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { identifier, userCardId } = req.params;
    const filterUser = mongoose.Types.ObjectId.isValid(identifier) ? { _id: identifier } : { username: identifier };
    const user = await User.findOne(filterUser);
    if (!user) return res.status(404).send({ error: 'Usuario no encontrado' });
    if (req.userId?.toString() !== user._id.toString()) return res.status(403).send({ error: 'No autorizado' });

    const allowed = ['quantity', 'condition', 'forTrade', 'isFavorite', 'isPublic', 'notes', 'collectionType'];
    const updates = Object.keys(req.body);
    const valid = updates.every((k) => allowed.includes(k));
    if (!valid) return res.status(400).send({ error: 'Actualización no permitida' });

    const userCard = await UserCard.findOne({ _id: userCardId, userId: user._id });
    if (!userCard) return res.status(404).send({ error: 'UserCard no encontrada' });

    updates.forEach((k) => (userCard as any)[k] = req.body[k]);
    await userCard.save();
    res.send({ message: 'UserCard actualizada', userCard });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * DELETE /users/:identifier/cards/:userCardId
 * Elimina una UserCard
 */
userRouter.delete('/users/:identifier/cards/:userCardId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { identifier, userCardId } = req.params;
    const filterUser = mongoose.Types.ObjectId.isValid(identifier) ? { _id: identifier } : { username: identifier };
    const user = await User.findOne(filterUser);
    if (!user) return res.status(404).send({ error: 'Usuario no encontrado' });
    if (req.userId?.toString() !== user._id.toString()) return res.status(403).send({ error: 'No autorizado' });

    const removed = await UserCard.findOneAndDelete({ _id: userCardId, userId: user._id });
    if (!removed) return res.status(404).send({ error: 'UserCard no encontrada' });
    res.send({ message: 'UserCard eliminada', removed });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
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
