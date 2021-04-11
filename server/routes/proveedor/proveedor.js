/*jshint esversion: 9*/
const ProveedorModel = require('../../models/proveedor.model');
const PersonaModel = require('../../models/persona.model');
const Helper = require("../../libraries/helper");
const express = require('express');
const { mongo } = require('mongoose');
const app = express();
const db = require('mongoose');
const tiendaModel = require('../../models/tienda.model');
const proveedorModel = require('../../models/proveedor.model');

// http://localhost:3000/api/proveedor/
app.get('/', async(req, res) => {
    try {
        if (req.query.idProveedor) req.queryMatch._id = req.query.idProveedor;
        if (req.query.termino) req.queryMatch.$or = Helper(["strEmpresa", "strDireccionEmpresa"], req.query.termino);

        const proveedor = await ProveedorModel.aggregate([
            { $lookup: { from: 'producto', localField: 'aJsnAlmacen.idProducto', foreignField: '_id', as: 'productos' } },
            { $lookup: { from: 'proveedor', localField: 'proveedor.idPersona', foreignField: '_id', as: 'personas' } },
            {
                $addFields: {
                    fecha: { $arrayElemAt: ["$aJsnAlmacen.arrFechaIngreso", 0] }
                }
            },
            {
                $project: {
                    '_id': 1,
                    'strEmpresa': 1,
                    'strDireccionEmpresa': 1,
                    'productos': 1,
                    'aJsnAlmacen': {
                        $map: {
                            input: '$aJsnAlmacen',
                            as: 'almacen',
                            in: {
                                '_id': '$$almacen._id',

                                'productoDisponible': {
                                    $arrayElemAt: [{
                                        $filter: {
                                            input: '$productos',
                                            as: 'disponible',
                                            cond: { $eq: ['$$almacen.idProducto', '$$disponible._id'] }
                                        }
                                    }, 0]
                                },
                                'ultimaFecha': { $arrayElemAt: ["$$almacen.arrFechaIngreso", -1] },

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
                                'almacen': {
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

        if (proveedor.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontraron los proveedores en la base de datos.',
                cont: {
                    proveedor
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion obtenida correctamente.',
                cont: {
                    proveedor
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener los proveedores.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/proveedor/
app.post('/', async(req, res) => {

    try {
        const proveedor = new ProveedorModel(req.body);

        let err = proveedor.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el proveedor.',
                cont: {
                    err
                }
            });
        }

        const proveedorEncontrado = await ProveedorModel.findOne({ strDireccionEmpresa: { $regex: `^${proveedor.strDireccionEmpresa}$`, $options: 'i' } });
        if (proveedorEncontrado) return res.status(400).json({
            ok: false,
            resp: 400,
            msg: `El proveedor que se desea insertar con la direccion ${proveedor.strDireccionEmpresa} ya se encuentra registrado en la base de datos.`,
            cont: 0
        });

        const nuevoProveedor = await proveedor.save();
        if (nuevoProveedor.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo registrar el proveedor en la base de datos.',
                cont: {
                    nuevoProveedor
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion insertada correctamente.',
                cont: {
                    nuevoProveedor
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar el proveedor.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

//http://localhost:3000/api/proveedor/?idAlmacen=60490e3aa2653f3bdc979242&idProveedor=60490df0a2653f3bdc979241
app.put('/', async(req, res) => {
    try {

        const idProveedor = req.query.idProveedor;

        if (idProveedor == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        req.body._id = idProveedor;

        const proveedorEncontrado = await ProveedorModel.findById(idProveedor);

        if (!proveedorEncontrado)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro el proveedor en la base de datos.',
                cont: proveedorEncontrado
            });

        const newProveedor = new ProveedorModel(req.body);

        let err = newProveedor.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al actualizar el proveedor.',
                cont: {
                    err
                }
            });
        }

        const proveedorActualizado = await ProveedorModel.findByIdAndUpdate(idProveedor, { $set: newProveedor }, { new: true });

        if (!proveedorActualizado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar actualizar el proveedor.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Se actualizo la persona correctamente.',
                cont: {
                    proveedorActualizado
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al actualizar al proveedor.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/proveedor/?idAlmacen=60490e3aa2653f3bdc979242&idProveedor=60490df0a2653f3bdc979241
app.delete('/', async(req, res) => {

    try {

        if (req.query.idProveedor == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        idProveedor = req.query.idProveedor;
        blnActivo = req.body.blnActivo;

        const proveedorEncontrado = await ProveedorModel.findById(idProveedor);

        if (!proveedorEncontrado)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro el proveedor en la base de datos.',
                cont: proveedorEncontrado
            });

        const proveedorActualizado = await ProveedorModel.findByIdAndUpdate(idProveedor, { $set: { blnActivo } }, { new: true });

        if (!proveedorActualizado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar eliminar el proveedor.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: `Success: Se a ${blnActivo === 'true'? 'activado': 'desactivado'} el proveedor correctamente.`,
                cont: {
                    proveedorActualizado
                }
            });
        }


    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al eliminar el proveedor.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});
//http://localhost:3000/api/proveedor/
app.patch('/', async(req, res) => {
    const session = await db.startSession();
    try {
        const proveedor = new ProveedorModel(req.body);

        let err = proveedor.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el proveedor.',
                cont: {
                    err
                }
            });
        }
        const transaccionResultado = await session.withTransaction(async() => {
            await proveedorModel.create([proveedor], {
                session: session
            });
        });

        if (transaccionResultado) {
            const tienda = await tiendaModel.updateMany({}, { $push: { arrProvedoores: proveedor._id } }); {
                res.status(200).send({
                    estatus: '200',
                    err: false,
                    msg: 'Informacion insertada correctamente.',
                    cont: {
                        proveedor
                    }
                });
            }
        } else {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el proveedor.',
                cont: 0

            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al eliminar el proveedor.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    } finally {
        session.endSession();
    }
});

module.exports = app;