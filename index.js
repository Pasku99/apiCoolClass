/*
Importación de módulos
*/
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { dbConnection } = require('./database/configdb');

// Crear una aplicación de express
const app = express();

dbConnection();

app.use(cors());
app.use(express.json());

app.use('/api/centroeducativo', require('./routes/centroeducativo'));
app.use('/api/login', require('./routes/auth'));
app.use('/api/profesores', require('./routes/profesor'));
app.use('/api/alumnos', require('./routes/alumno'));
app.use('/api/examenes', require('./routes/examen'));

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
    console.log('Servidor corriendo en el puerto ' + port);
});