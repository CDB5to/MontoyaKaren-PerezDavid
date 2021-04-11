/*jshint esversion: 9*/
const TiendaModel = require('../../models/tienda.model');
const InventarioModel = require('../../models/inventario.model');
const ProductoModel = require('../../models/producto.model');
const express = require('express');
const app = express();


//http://localhost:3000/api/inventario/?idTienda=604915387529ea1314ce17a7
app.get('/', async(req, res) => {

    try {

        let idInventario = '';

        const idTienda = req.query.idTienda;

        if (req.query.idInventario)
            idInventario = req.query.idInventario;

        let queryFind = {};
        let queryOptions = {};

        if (idInventario) {
            queryFind = {
                '_id': idTienda,
                'aJsnInventario': {
                    $elemMatch: {
                        '_id': idInventario
                    }
                }
            };
            queryOptions = { 'aJsnInventario.$': 1 };
        } else {
            queryFind = {
                '_id': idTienda
            };
            queryOptions = {};
        }

        if (idTienda == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        const inventario = await TiendaModel.find(queryFind, queryOptions);
        let producto = '';
        let infoFinal = {};
        for (const info of inventario) {
            for (const inventario of info.aJsnInventario) {
                producto = await ProductoModel.findById(inventario.idProducto);
            }
        }

        if (inventario.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontro el inventario en la base de datos.',
                cont: {
                    compra
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion obtenida correctamente.',
                cont: {
                    inventario
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener el inventario.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }


});

//http://localhost:3000/api/inventario/?idTienda=604915387529ea1314ce17a7
app.post('/', async(req, res) => {

    try {
        const idTienda = req.query.idTienda;

        if (idTienda == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        const inventario = new InventarioModel(req.body);
        let err = inventario.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el inventario.',
                cont: {
                    err
                }
            });
        }


        console.log(); {
            const nuevoInventario = await TiendaModel.findByIdAndUpdate(idTienda, { $push: { 'aJsnInventario': inventario } }, { new: true });
            if (nuevoInventario.length <= 0) {
                res.status(400).send({
                    estatus: '400',
                    err: true,
                    msg: 'No se pudo registrar el inventario en la base de datos.',
                    cont: 0
                });
            } else {
                res.status(200).send({
                    estatus: '200',
                    err: false,
                    msg: 'Informacion insertada correctamente.',
                    cont: {
                        inventario
                    }
                });
            }
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar el almacen.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/inventario/?idTienda=604915387529ea1314ce17a7&idInventario=604a244c7a04d02428058048
app.put('/', async(req, res) => {

    try {

        const idTienda = req.query.idTienda;
        const idInventario = req.query.idInventario;

        if (idTienda == undefined || idInventario == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        req.body._id = idInventario;

        const inventario = new InventarioModel(req.body);
        let err = inventario.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al actualizar el inventario.',
                cont: {
                    err
                }
            });
        }

        const nuevoInventario = await TiendaModel.findOneAndUpdate({ '_id': idTienda, 'aJsnInventario._id': idInventario }, { $set: { 'aJsnInventario.$[i]': inventario } }, { arrayFilters: [{ 'i._id': idInventario }], new: true });

        if (nuevoInventario.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo actualizar el inventario en la base de datos.',
                cont: 0
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion actualizada correctamente.',
                cont: {
                    inventario
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al actualizar el inventario.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});

// http://localhost:3000/api/inventario/?idTienda=604915387529ea1314ce17a7&idInventario=604a244c7a04d02428058048
app.delete('/', async(req, res) => {

    try {

        const idTienda = req.query.idTienda;
        const idInventario = req.query.idInventario;
        const blnActivo = req.body.blnActivo;

        if (idTienda == undefined || idInventario == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }


        const nuevoInventario = await TiendaModel.findOneAndUpdate({ '_id': idTienda, 'aJsnInventario._id': idInventario }, { $set: { 'aJsnInventario.$.blnActivo': blnActivo } }, { new: true });

        if (nuevoInventario.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo eliminar el inventario en la base de datos.',
                cont: 0
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion eliminada correctamente.',
                cont: {
                    nuevoInventario
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al actualizar el almacen.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});

module.exports = app;