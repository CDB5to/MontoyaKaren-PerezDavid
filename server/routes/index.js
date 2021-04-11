/*jshint esversion: 8*/
const express = require('express');
const app = express();

app.use('/persona', require('./persona/persona'));
app.use('/producto', require('./producto/producto'));
app.use('/tienda', require('./tienda/tienda'));
app.use('/venta', require('./tienda/venta'));
app.use('/proveedor', require('./proveedor/proveedor'));
app.use('/almacen', require('./proveedor/almacen'));
app.use('/inventario', require('./tienda/inventario'));

module.exports = app;