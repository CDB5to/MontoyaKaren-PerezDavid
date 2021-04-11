/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const inventarioSchema = new Schema({
    idProducto: {
        type: mongoose.Types.ObjectId,
        ref: 'producto',
        required: [true, 'Favor de ingresar el valor unico del producto.']
    },
    nmbCantidad: {
        type: Number,
        required: [true, 'Favor de ingresar la cantidad del inventario.']
    },
    strCategoria: {
        type: String,
        required: [true, 'Favor de escribir el nombre de la categoria.']
    },
    arrFechaIngreso: [{
        type: Date,
        required: [true, 'Favor de ingresar la fecha.']
    }],
    blnActivo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: "inventario"
});

module.exports = mongoose.model('Inventario', inventarioSchema);