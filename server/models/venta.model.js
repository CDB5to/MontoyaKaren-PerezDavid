/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ventaSchema = new Schema({
    idPersona: {
        type: mongoose.Types.ObjectId,
        ref: 'persona',
        required: [true, 'Favor de ingresar un identificador unico de persona.']
    },
    dteFecha: {
        type: Date,
        required: [true, 'Favor de insertar la fecha de la compra']
    },
    nmbCantidad: {
        type: Number,
        required: [true, 'Favor de ingresar la cantidad de la compra.']
    },
    nmbTotalPrecio: {
        type: Number,
        required: [true, 'Favor de ingresar el total del precio.']
    },
    strMetodoPago: {
        type: String,
        required: [true, 'Favor de ingresar el metodo de pago']
    },
    idProducto: {
        type: mongoose.Types.ObjectId,
        ref: 'persona',
        required: [true, 'Favor de ingresar un identificador unico del producto.']
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
    collection: "venta"
});

module.exports = mongoose.model('Venta', ventaSchema);