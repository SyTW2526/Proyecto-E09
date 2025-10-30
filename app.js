const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/User');
const Card = require('./models/Card');

const app = express();

// Conectar a la base de datos
connectDB();

// Ejemplo de crear un usuario
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password // Recuerda hashearlo con bcrypt
    });
    
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});