/*jshint esversion: 8*/

//////////////////// Conexiones necesarias///////////////////
require('./config/config');
require('colors'); // instalar colors

// const hostname = '127.0.0.1'; // cambiar por la ipv4 de nuestra maquina para poder utilizar las apis desde otro dispositivo.
const express = require('express'); // instalar express
const cors = require('cors'); // instalar cors
const bodyParser = require('body-parser'); // instalar body-parser
const mongoose = require('mongoose'); // instalar mongoose
const app = express();

const opcionesGet = require('./middlewares/opcionesGet');

// Habilitar Cors
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(bodyParser.json());
////////////////////////////////////////////////////////////
app.use(opcionesGet);
app.use('/api', require('./routes/index'));

mongoose.connect('mongodb+srv://Admin:admin123@cluster0.0viho.mongodb.net/ProyectoFinalUnidad4?retryWrites=true&w=majority', {

    useNewUrlParser: true,

    useUnifiedTopology: true,

    useFindAndModify: false,

    useCreateIndex: true

}, (err, res) => {

    if (err) throw err;

    console.log('BD ONLINE');

});



app.listen(process.env.PORT, () => {

    console.log('El servidor esta en linea por el puerto', process.env.PORT);

});