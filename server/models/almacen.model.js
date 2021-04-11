/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const almacenSchema = new Schema({
    idProducto: {
        type: mongoose.Types.ObjectId,
        ref: 'producto',
        required: [true, 'Favor de ingresar el valor unico del producto.']
    },
    nmbCantidad: {
        type: Number,
        required: [true, 'Favor de ingresar la cantidad del almacen.']
    },
    strCategoria: {
        type: String,
        required: [true, 'Favor de agregar la categoria.']
    },
    blnActivo: {
        type: Boolean,
        default: true
    },
    arrFechaIngreso: [{
        type: Date
    }],

}, {

    collection: "almacen"
});

module.exports = mongoose.model('almacen', almacenSchema);