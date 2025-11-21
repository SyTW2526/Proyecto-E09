import express from 'express';
import { UserCard } from '../models/UserCard.js';
import { User } from '../models/User.js';
import { Card } from '../models/Card.js';
import { getCardsByName } from '../services/pokemon.js';
export const userCardRouter = express.Router();

userCardRouter.post("/usercards/import", async (req, res) => {
  try {
    const { username, query = "", limit = 5, forTrade = true } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    const apiResult = await getCardsByName(query);
    const rawCards = apiResult.data || [];

    if (!rawCards.length)
      return res.status(404).json({ error: "No se encontraron cartas en la API" });

    const cards = rawCards
      .filter((c:any) => c.images && (c.images.small || c.images.large))
      .slice(0, limit);

    if (!cards.length)
      return res
        .status(404)
        .json({ error: "No se encontraron cartas con imagen disponible" });

    const createdUserCards = [];

    for (const c of cards) {
      const image = c.images.small || c.images.large;

      let localCard = await Card.findOne({ pokemonTcgId: c.id });
      if (!localCard) {
        localCard = await Card.create({
          name: c.name,
          imageUrl: image,
          rarity: c.rarity || "Common",
          pokemonTcgId: c.id,
          series: c.set?.series || "",
          set: c.set?.name || "",
          types: c.types || [],
        });
      }

      const userCard = await UserCard.findOneAndUpdate(
        { userId: user._id, cardId: localCard._id },
        {
          $setOnInsert: {
            forTrade,
            collectionType: "collection",
            pokemonTcgId: localCard.pokemonTcgId,
          },
        },
        { upsert: true, new: true }
      );

      createdUserCards.push(userCard);
    }

    res.json({
      message: ` ${createdUserCards.length} cartas importadas para ${username}`,
      cards: createdUserCards,
    });
  } catch (error) {
    console.error("Error al importar cartas:", error);
    res.status(500).json({ error: "Error al importar cartas desde la API" });
  }
});

/**
 * POST /usercards/:username/:type
 * Agrega una carta a la colección o lista de deseos del usuario
 */
userCardRouter.post('/usercards/:username/:type', async (req, res) => {
  try {
    const { username, type } = req.params;
    if (!['collection', 'wishlist'].includes(type)) {
      return res.status(400).send({ error: 'Tipo inválido. Use "collection" o "wishlist".' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }

    const newCard = new UserCard({
      ...req.body,
      userId: user._id,
      collectionType: type
    });

    await newCard.save();
    res.status(201).send(newCard);
  } catch (error) {
    res.status(400).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * GET /usercards/:username
 * Obtiene todas las cartas de un usuario (colección y lista de deseos)
 */
userCardRouter.get('/usercards/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20, forTrade } = req.query;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { userId: user._id };
    if (forTrade !== undefined) {
      // accept 'true' or '1' (from query string) as boolean true
      const ft = String(forTrade);
      filter.forTrade = ft === 'true' || ft === '1';
    }

    const cards = await UserCard.find(filter)
      .populate('cardId', 'name imageUrl rarity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

  const total = await UserCard.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    return res.status(200).send({
      page: Number(page),
      totalPages,
      totalResults: total,
      resultsPerPage: Number(limit),
      cards: cards || [],
    });
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
});

/**
 * GET /usercards/:username/:type
 * Obtiene las cartas de un usuario por tipo (colección o lista de deseos)
 */
userCardRouter.get('/usercards/:username/:type', async (req, res) => {
  try {
    const { username, type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findOne({ username });
    if (!user) { 
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }

    if (!['collection', 'wishlist'].includes(type)) {
      return res.status(400).send({ error: 'Tipo inválido' });
    }

    const filter = { userId: user._id, collectionType: type };
    const skip = (Number(page) - 1) * Number(limit);

    // support optional forTrade query param to filter only trade-eligible cards
    const { forTrade } = req.query;
    if (forTrade !== undefined) {
      // coerce strings like 'true' or '1' to boolean true
      const ft = String(forTrade);
      (filter as any).forTrade = ft === 'true' || ft === '1';
    }

    const cards = await UserCard.find(filter)
      .populate('cardId', 'name imageUrl rarity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await UserCard.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.send({
      page: Number(page),
      totalPages,
      totalResults: total,
      resultsPerPage: Number(limit),
      cards,
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * PATCH /usercards/:username/cards/:userCardId
 * Actualiza una carta específica en la colección o lista de deseos del usuario
 */
userCardRouter.patch('/usercards/:username/cards/:userCardId', async (req, res) => {
  try {
    const { username, userCardId } = req.params;
    const user = await User.findOne({ username });
    if (!user) { 
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }

    const userCard = await UserCard.findOneAndUpdate(
      { _id: userCardId, userId: user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!userCard) { 
      return res.status(404).send({ error: 'Carta no encontrada' });
    }
    res.send(userCard);
  } catch (error) {
    res.status(400).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * DELETE /usercards/:username/cards/:userCardId
 * Elimina una carta específica de la colección o lista de deseos del usuario
 */
userCardRouter.delete('/usercards/:username/cards/:userCardId', async (req, res) => {
  try {
    const { username, userCardId } = req.params;
    const user = await User.findOne({ username });
    if (!user) { 
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }

    const deletedCard = await UserCard.findOneAndDelete({
      _id: userCardId,
      userId: user._id
    });

    if (!deletedCard) { 
      return res.status(404).send({ error: 'Carta no encontrada' });
    }
    res.send({ message: 'Carta eliminada correctamente', deletedCard });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

