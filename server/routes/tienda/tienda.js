/*jshint esversion: 9*/
const TiendaModel = require('../../models/tienda.model');
const Helper = require("../../libraries/helper");
const express = require('express');
const app = express();


app.get('/', async(req, res) => {
    try {
        if (req.query.idTienda) req.queryMatch._id = req.query.idTienda;
        if (req.query.termino) req.queryMatch.$or = Helper(["strNombre", "strDireccion", "strUrlWeb"], req.query.termino);

        const tienda = await TiendaModel.aggregate([
            { $lookup: { from: 'tienda', localField: 'arrSucursales', foreignField: '_id', as: 'tiendasDisponibles' } },
            { $lookup: { from: 'producto', localField: 'aJsnInventario.idProducto', foreignField: '_id', as: 'productos' } },
            { $lookup: { from: 'tienda', localField: 'aJsnVenta.idPersona', foreignField: '_id', as: 'personas' } },
            {
                $addFields: {
                    fecha: { $arrayElemAt: ["$aJsnInventario.arrFechaIngreso", 0] }
                }
            },
            {
                $project: {
                    '_id': 1,
                    'strNombre': 1,
                    'strDireccion': 1,
                    'productos': 1,
                    'aJsnInventario': {
                        $map: {
                            input: '$aJsnInventario',
                            as: 'inventario',
                            in: {
                                '_id': '$$inventario._id',

                                'productoDisponible': {
                                    $arrayElemAt: [{
                                        $filter: {
                                            input: '$productos',
                                            as: 'disponible',
                                            cond: { $eq: ['$$inventario.idProducto', '$$disponible._id'] }
                                        }
                                    }, 0]
                                },
                                'ultimaFecha': { $arrayElemAt: ["$$inventario.arrFechaIngreso", -1] },

                                'diferencia': {
                                    $trunc: {
                                        $divide: [{ $subtract: [new Date(), { $arrayElemAt: ['$fecha', 0] }] }, 1000 * 60 * 60 * 24]

                                    }

                                }
                            }
                        }
                    },
                    'aJsnVenta': {
                        $map: {
                            input: '$aJsnVenta',
                            as: 'venta',
                            in: {
                                '_id': '$$venta._id',
                                'persona': {
                                    $arrayElemAt: [{
                                        $filter: {
                                            input: '$personas',
                                            as: 'persona',
                                            cond: {
                                                $eq: ['$$venta.idPersona', '$$persona._id']
                                            }
                                        }
                                    }, 0]
                                },
                                'inventario': {
                                    $arrayElemAt: [{
                                        $filter: {
                                            input: '$productosComprados',
                                            as: 'producto',
                                            cond: {
                                                $eq: ['$$venta.idProducto', '$$producto._id']
                                            }
                                        }
                                    }, 0]
                                },
                                'dteFecha': '$$venta.dteFecha',
                                'nmbTotalPrecio': '$$venta.nmbTotalPrecio'
                            }
                        }
                    }
                }
            }
        ]);


        if (tienda.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontraron tiendas en la base de datos.',
                cont: {
                    tienda
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion obtenida correctamente.',
                cont: {
                    tienda
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener las tiendas.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});


app.post('/', async(req, res) => {

    try {
        const tienda = new TiendaModel(req.body);

        let err = tienda.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar la tienda.',
                cont: {
                    err
                }
            });
        }

        const tiendaEncontrada = await TiendaModel.findOne({ strDireccion: { $regex: `^${tienda.strDireccion}$`, $options: 'i' } });
        if (tiendaEncontrada) return res.status(400).json({
            ok: false,
            resp: 400,
            msg: `La tienda que se desea insertar con la direccion ${tienda.strDireccion} ya se encuentra registrada en la base de datos.`,
            cont: 0
        });

        const nuevaTienda = await tienda.save();
        if (nuevaTienda.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo registrar la tienda en la base de datos.',
                cont: {
                    nuevaTienda
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion insertada correctamente.',
                cont: {
                    nuevaTienda
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar la tienda.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});


app.put('/', async(req, res) => {
    try {

        const idTienda = req.query.idTienda;

        if (idTienda == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        req.body._id = idTienda;

        const tiendaEncontrada = await TiendaModel.findById(idTienda);

        if (!tiendaEncontrada)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro la persona en la base de datos.',
                cont: tiendaEncontrada
            });

        const newTienda = new TiendaModel(req.body);

        let err = newTienda.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al actualizar la tienda.',
                cont: {
                    err
                }
            });
        }

        const tiendaActualizada = await TiendaModel.findByIdAndUpdate(idTienda, { $set: newTienda }, { new: true });

        if (!tiendaActualizada) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar actualizar la tienda.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Se actualizo la tienda correctamente.',
                cont: {
                    tiendaActualizada
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al actualizar la tienda.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/tienda/?idTienda=603e51f51a35a066388f0f28
app.delete('/', async(req, res) => {

    try {

        if (req.query.idTienda == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        idTienda = req.query.idTienda;
        blnActivo = req.body.blnActivo;

        const tiendaEncontrada = await TiendaModel.findById(idTienda);

        if (!tiendaEncontrada)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro la tienda en la base de datos.',
                cont: tiendaEncontrada
            });

        const tiendaActualizada = await TiendaModel.findByIdAndUpdate(idTienda, { $set: { blnActivo } }, { new: true });

        if (!tiendaActualizada) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar eliminar la tienda.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: `Success: Se a ${blnActivo === 'true'? 'activado': 'desactivado'} la tienda correctamente.`,
                cont: {
                    tiendaActualizada
                }
            });
        }


    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al eliminar a la tienda.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});


module.exports = app;