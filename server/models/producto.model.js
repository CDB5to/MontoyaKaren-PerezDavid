/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const productoSchema = new Schema({
    strNombre: {
        type: String,
        required: [true, 'Favor de insertar el nombre del producto.']
    },
    strDescripcion: {
        type: String,
        required: [true, 'Favor de describir en que consiste el producto.']
    },

}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    blnActivo: {
        type: Boolean,
        default: true
    },
    collection: "producto"
});

module.exports = mongoose.model('Producto', productoSchema);