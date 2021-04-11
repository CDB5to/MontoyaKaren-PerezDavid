/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const personaSchema = new Schema({
    strNombre: {
        type: String,
        required: [true, 'Favor de insertar el nombre.']
    },
    strApellidos: {
        type: String,
        required: [true, 'Favor de insertar sus apellidos.']
    },
    strDireccion: String,
    nmbEdad: {
        type: Number,
        required: [true, 'Favor de insertar su edad.']
    },
    arrTelefonos: [{
        type: Number
    }],
    strCurp: String,
    strPais: String,
    strCorreo: {
        type: String,
        required: [true, 'Favor de insertar su correo.']
    },
    blnActivo: {
        type: Boolean,
        default: true
    }
}, {
    collection: "persona"
});

module.exports = mongoose.model('persona', personaSchema);