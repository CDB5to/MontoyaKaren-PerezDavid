/*jshint esversion: 9*/
const ProductoModel = require('../../models/producto.model');
const Helper = require("../../libraries/helper");
const express = require('express');
const app = express();

const email = require('../../libraries/email');

// http://localhost:3000/api/producto/
app.get('/', async(req, res) => {
    try {
        if (req.query.idProducto) req.queryMatch._id = req.query.idProducto;
        if (req.query.termino) req.queryMatch.$or = Helper(["strNombre", "strDescripcion"], req.query.termino);

        const producto = await ProductoModel.find({...req.queryMatch });

        if (producto.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontraron los productos en la base de datos.',
                cont: {
                    producto
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion obtenida correctamente.',
                cont: {
                    producto
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener a los productos.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/producto/
app.post('/', async(req, res) => {

    try {
        const nuevoProducto = new ProductoModel(req.body);

        let err = nuevoProducto.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el producto.',
                cont: {
                    err
                }
            });
        }

        const productoEncontrado = await ProductoModel.findOne({ strNombre: { $regex: `^${nuevoProducto.strNombre}$`, $options: 'i' } });
        if (productoEncontrado) return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'El producto que desea registrar ya se encuentra en uso.',
            cont: {
                Nombre: productoEncontrado.strNombre
            }
        });

        const producto = await nuevoProducto.save();
        if (producto.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo registrar el producto en la base de datos.',
                cont: {
                    producto
                }
            });
        } else {
            email.sendEmail(req.body.strNombre);
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion insertada correctamente.',
                cont: {
                    producto
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar el producto.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/producto/?idProducto=604a21d8ff1a663434b70a13
app.put('/', async(req, res) => {
    try {

        const idProducto = req.query.idProducto;

        if (idProducto == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        req.body._id = idProducto;

        const productoEncontrado = await ProductoModel.findById(idProducto);

        if (!productoEncontrado)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro el producto en la base de datos.',
                cont: productoEncontrado
            });

        const newProducto = new ProductoModel(req.body);

        let err = newProducto.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el producto.',
                cont: {
                    err
                }
            });
        }

        const productoActualizado = await ProductoModel.findByIdAndUpdate(idProducto, { $set: newProducto }, { new: true });

        if (!productoActualizado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar actualizar el producto.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Se actualizo el producto correctamente.',
                cont: {
                    productoActualizado
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al actualizar el producto.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

//http://localhost:3000/api/producto/?idProducto=604a21d8ff1a663434b70a13
app.delete('/', async(req, res) => {

    try {

        if (req.query.idProducto == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        idProducto = req.query.idProducto;
        blnActivo = req.body.blnActivo;

        const productoEncontrado = await ProductoModel.findById(idProducto);

        if (!productoEncontrado)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro el producto en la base de datos.',
                cont: productoEncontrado
            });

        const productoActualizado = await ProductoModel.findByIdAndUpdate(idProducto, { $set: { blnActivo } }, { new: true });

        if (!productoActualizado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar eliminar el producto.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: `Success: Se a ${blnActivo === 'true'? 'activado': 'desactivado'} el producto correctamente.`,
                cont: {
                    productoActualizado
                }
            });
        }


    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al eliminar el producto.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});


module.exports = app;