/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ventaModel = require('./venta.model');
const inventarioModel = require('./inventario.model');

const tiendaSchema = new Schema({
    strNombre: {
        type: String,
        required: [true, 'Favor de insertar el nombre de la tienda.']
    },
    strDireccion: {
        type: String,
        required: [true, 'Favor de insertar la dirección de la tienda.']
    },
    strTelefono: String,
    strUrlWeb: String,
    arrSucursales: [{
        type: String
    }],
    // Creación de un Array de  Id's
    aJsnVenta: [ventaModel.schema],
    aJsnInventario: [inventarioModel.schema],
    arrProveedores: [{
        type: mongoose.Types.ObjectId,
        ref: 'proveedor'
    }],
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    blnActivo: {
        type: Boolean,
        default: true
    },
    collection: "tienda"
});

module.exports = mongoose.model('Tienda', tiendaSchema);