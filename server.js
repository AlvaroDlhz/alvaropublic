const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Conectar Base de datos
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));
app.use(express.static('public'));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/diligencias', require('./routes/diligencias'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`)); 