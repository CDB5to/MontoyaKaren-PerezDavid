/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const almacenModel = require('./almacen.model');

const proveedorSchema = new Schema({
    idPersona: {
        type: mongoose.Types.ObjectId,
        ref: 'persona',
        required: [true, 'Favor de ingresar el valor unico de la persona.']
    },
    strEmpresa: {
        type: String,
        required: [true, 'Favor de ingresar el nombre de la empresa']
    },
    strDireccionEmpresa: {
        type: String,
        required: [true, 'Favor de ingresar la direccion de la empresa']
    },
    aJsnAlmacen: [almacenModel.schema],
    blnActivo: {
        type: Boolean,
        default: true
    }
}, {

    collection: "proveedor"
});

module.exports = mongoose.model('Proveedor', proveedorSchema);