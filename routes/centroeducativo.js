/*
Ruta base: /api/centroeducativo
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { crearCentro, obtenerCentros, obtenerClases, crearClase, actualizarCentro, generarCodigoProfesor, generarCodigoAlumno, obtenerProfesores, obtenerProfesoresClase, eliminarClase, eliminarCentro } = require('../controllers/centroeducativo');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

const router = Router();

router.get('/', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('id', 'El id de centro debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerCentros);

router.post('/', [
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('rol', 'El argumento rol es obligatorio').not().isEmpty(),
    validarCampos,
], crearCentro);

router.delete('/:idCentro', [
    validarJWT,
    check('idCentro', 'El id de centro debe ser válido').optional().isMongoId(),
    validarCampos,
], eliminarCentro);

router.get('/profesores/:id', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('id', 'El id de centro debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerProfesores);

router.put('/generarcodigoprofesor', [
    validarJWT,
], generarCodigoProfesor);

router.put('/generarcodigoalumno', [
    validarJWT,
], generarCodigoAlumno);

router.put('/:id', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    validarCampos,
], actualizarCentro);

router.get('/:id/clases', [
    validarJWT,
    // check('nombre', 'El argumento username es obligatorio').not().isEmpty().trim(),
    // check('uidCentro', 'El argumento debe ser válido').not().isEmpty().trim(),
    // validarCampos,
], obtenerClases);

router.get('/:idCentro/:idClase', [
    validarJWT,
    // check('nombre', 'El argumento username es obligatorio').not().isEmpty().trim(),
    // check('uidCentro', 'El argumento debe ser válido').not().isEmpty().trim(),
    // validarCampos,
], obtenerProfesoresClase);

router.post('/clases', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('uidCentro', 'El argumento uidCentro es obligatorio').not().isEmpty().trim(),
    validarCampos,
], crearClase);

router.delete('/:idCentro/clase/:idClase', [
    validarJWT,
    check('idCentro', 'El id de centro debe ser válido').optional().isMongoId(),
    check('idClase', 'El id de clase debe ser válido').optional().isMongoId(),
    validarCampos,
], eliminarClase);

module.exports = router;