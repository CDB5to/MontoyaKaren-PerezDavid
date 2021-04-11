/*jshint esversion: 9*/
const TiendaModel = require('../../models/tienda.model');
const VentaModel = require('../../models/venta.model');
const PersonaModel = require('../../models/persona.model');
const express = require('express');
const app = express();


// http://localhost:3000/api/venta/?idTienda=604915387529ea1314ce17a7
app.get('/', async(req, res) => {

    try {

        let idVenta = '';

        const idTienda = req.query.idTienda;

        if (req.query.idVenta)
            idVenta = req.query.idVenta;

        let queryFind = {};
        let queryOptions = {};

        if (idVenta) {
            queryFind = {
                '_id': idTienda,
                'aJsnVenta': {
                    $elemMatch: {
                        '_id': idVenta
                    }
                }
            };
            queryOptions = { 'aJsnVenta.$': 1 };
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

        const venta = await TiendaModel.find(queryFind, queryOptions);
        let persona = '';
        let infoFinal = {};
        for (const info of venta) {
            for (const venta of info.aJsnVenta) {
                persona = await PersonaModel.findById(venta.idPersona);
            }
        }

        if (venta.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontraron compras en la base de datos.',
                cont: {
                    venta
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion obtenida correctamente.',
                cont: {
                    venta
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener las compras.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }


});

// http://localhost:3000/api/venta/?idTienda=604915387529ea1314ce17a7
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

        const venta = new VentaModel(req.body);
        let err = venta.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar la venta.',
                cont: {
                    err
                }
            });
        }

        const productoDisponible = await TiendaModel.findOne({ _id: idTienda });
        console.log(productoDisponible);
        if (productoDisponible == null) {
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: no se encontro el producto o ya esta vendido.',
                cont: 0
            });
        } else {
            const rmvProducto = await TiendaModel.findByIdAndUpdate(idTienda, { $pull: { 'aJsnVenta': venta } }, { new: true });
            if (rmvProducto == null) {
                return res.status(400).send({
                    estatus: '400',
                    err: true,
                    msg: 'Error: no se pudo quitar el producto del array de proveedores.',
                    cont: 0
                });
            }
            const nuevaVenta = await TiendaModel.findByIdAndUpdate(idTienda, { $push: { 'aJsnVenta': venta } }, { new: true });

            if (nuevaVenta.length <= 0) {
                res.status(400).send({
                    estatus: '400',
                    err: true,
                    msg: 'No se pudo registrar la venta en la base de datos.',
                    cont: 0
                });
            } else {
                res.status(200).send({
                    estatus: '200',
                    err: false,
                    msg: 'Informacion insertada correctamente.',
                    cont: {
                        venta
                    }
                });
            }
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar la venta.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/venta/?idTienda=604915387529ea1314ce17a7&idVenta=60492c1ceae99d391875c3e8
app.put('/', async(req, res) => {

    try {

        const idTienda = req.query.idTienda;
        const idVenta = req.query.idVenta;

        if (idTienda == undefined || idVenta == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        req.body._id = idVenta;

        const venta = new VentaModel(req.body);
        let err = venta.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al actualizar la venta.',
                cont: {
                    err
                }
            });
        }

        const nuevaVenta = await TiendaModel.findOneAndUpdate({ '_id': idTienda, 'aJsnVenta._id': idVenta }, { $set: { 'aJsnVenta.$[i]': venta } }, { arrayFilters: [{ 'i._id': idVenta }], new: true });

        if (nuevaVenta.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo actualizar la venta en la base de datos.',
                cont: 0
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion actualizada correctamente.',
                cont: {
                    venta
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al actualizar la venta.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});

// http://localhost:3000/api/venta/?idTienda=604915387529ea1314ce17a7&idVenta=60492c1ceae99d391875c3e8
app.delete('/', async(req, res) => {

    try {

        const idTienda = req.query.idTienda;
        const idVenta = req.query.idVenta;
        const blnActivo = req.body.blnActivo;

        if (idTienda == undefined || idVenta == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }


        const nuevaVenta = await TiendaModel.findOneAndUpdate({ '_id': idTienda, 'aJsnVenta._id': idVenta }, { $set: { 'aJsnVenta.$.blnActivo': blnActivo } }, { new: true });

        if (nuevaVenta.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo eliminar la venta en la base de datos.',
                cont: 0
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion eliminada correctamente.',
                cont: {
                    nuevaVenta
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al actualizar la venta.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});

module.exports = app;