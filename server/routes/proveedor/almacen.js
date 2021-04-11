/*jshint esversion: 9*/
const ProveedorModel = require('../../models/proveedor.model');
const AlmacenModel = require('../../models/almacen.model');
const ProductoModel = require('../../models/producto.model');
const express = require('express');
const app = express();


// http://localhost:3000/api/almacen/?idProveedor=60490df0a2653f3bdc979241
app.get('/', async(req, res) => {

    try {

        let idAlmacen = '';

        const idProveedor = req.query.idProveedor;

        if (req.query.idAlmacen)
            idAlmacen = req.query.idAlmacen;

        let queryFind = {};
        let queryOptions = {};

        if (idAlmacen) {
            queryFind = {
                '_id': idProveedor,
                'aJsnAlmacen': {
                    $elemMatch: {
                        '_id': idAlmacen
                    }
                }
            };
            queryOptions = { 'aJsnAlmacen.$': 1 };
        } else {
            queryFind = {
                '_id': idProveedor
            };
            queryOptions = {};
        }

        if (idProveedor == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        const almacen = await ProveedorModel.find(queryFind, queryOptions);
        let producto = '';
        let infoFinal = {};
        for (const info of almacen) {
            for (const almacen of info.aJsnAlmacen) {
                producto = await ProductoModel.findById(almacen.idProducto);
            }
        }

        if (almacen.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontro el almacen en la base de datos.',
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
                    almacen
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener el almacen.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }


});

// http://localhost:3000/api/almacen/?idProveedor=60490df0a2653f3bdc979241
app.post('/', async(req, res) => {

    try {
        const idProveedor = req.query.idProveedor;

        if (idProveedor == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        const almacen = new AlmacenModel(req.body);
        let err = almacen.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el almacen.',
                cont: {
                    err
                }
            });
        }


        console.log(); {
            const nuevoAlmacen = await ProveedorModel.findByIdAndUpdate(idProveedor, { $push: { 'aJsnAlmacen': almacen } }, { new: true });
            if (nuevoAlmacen.length <= 0) {
                res.status(400).send({
                    estatus: '400',
                    err: true,
                    msg: 'No se pudo registrar el almacen en la base de datos.',
                    cont: 0
                });
            } else {
                res.status(200).send({
                    estatus: '200',
                    err: false,
                    msg: 'Informacion insertada correctamente.',
                    cont: {
                        almacen
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

// http://localhost:3000/api/almacen/?idProveedor=60490df0a2653f3bdc979241&idAlmacen=60490e3aa2653f3bdc979242
app.put('/', async(req, res) => {

    try {

        const idProveedor = req.query.idProveedor;
        const idAlmacen = req.query.idAlmacen;

        if (idProveedor == undefined || idAlmacen == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        req.body._id = idAlmacen;

        const almacen = new AlmacenModel(req.body);
        let err = almacen.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al actualizar el almacen.',
                cont: {
                    err
                }
            });
        }

        const nuevoAlmacen = await ProveedorModel.findOneAndUpdate({ '_id': idProveedor, 'aJsnAlmacen._id': idAlmacen }, { $set: { 'aJsnAlmacen.$[i]': almacen } }, { arrayFilters: [{ 'i._id': idAlmacen }], new: true });

        if (nuevoAlmacen.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo actualizar el almacen en la base de datos.',
                cont: 0
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion actualizada correctamente.',
                cont: {
                    almacen
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

//http://localhost:3000/api/almacen/?idProveedor=60490df0a2653f3bdc979241&idAlmacen=60490e3aa2653f3bdc979242
app.delete('/', async(req, res) => {

    try {

        const idProveedor = req.query.idProveedor;
        const idAlmacen = req.query.idAlmacen;
        const blnActivo = req.body.blnActivo;

        if (idProveedor == undefined || idAlmacen == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }


        const nuevoAlmacen = await ProveedorModel.findOneAndUpdate({ '_id': idProveedor, 'aJsnAlmacen._id': idAlmacen }, { $set: { 'aJsnAlmacen.$.blnActivo': blnActivo } }, { new: true });

        if (nuevoAlmacen.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo eliminar el almacen en la base de datos.',
                cont: 0
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion eliminada correctamente.',
                cont: {
                    nuevoAlmacen
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