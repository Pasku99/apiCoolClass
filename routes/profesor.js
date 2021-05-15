/*
Ruta base: /api/profesores
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerProfesores, crearProfesor, escogerClasesProfesor, obtenerClasesCentro, obtenerAsignaturas, escogerAsignaturasProfesor, eliminarClaseAsignaturaProfesor, obtenerClasesProfesor, actualizarProfesor, obtenerAlumnos, obtenerClase, eliminarProfesor } = require('../controllers/profesor');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

const router = Router();

router.get('/', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('id', 'El id de profesor debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerProfesores);

router.post('/', [
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('rol', 'El argumento rol es obligatorio').not().isEmpty(),
    check('codigoProfesor', 'El argumento codigoProfesor es obligatorio').not().isEmpty(),
    validarCampos,
], crearProfesor);

router.delete('/:idCentro/:idProfesor', [
    validarJWT,
    check('idProfesor', 'El id de profesor debe ser válido').optional().isMongoId(),
    validarCampos,
], eliminarProfesor);

router.put('/eliminarclaseprofesor', [
    validarJWT,
    check('nombreClase', 'El argumento nombreClase es obligatorio').not().isEmpty().trim(),
    check('uidCentro', 'El argumento uidCentro es obligatorio').not().isEmpty(),
    check('uidProfesor', 'El argumento uidProfesor es obligatorio').not().isEmpty(),
    // check('asignatura', 'El argumento asignatura es obligatorio').not().isEmpty(),
    validarCampos,
], eliminarClaseAsignaturaProfesor);

router.put('/:id', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    validarCampos,
], actualizarProfesor);

router.get('/clases/:idcentro/:idprofesor', [
    validarJWT,
], obtenerClasesCentro);

router.get('/clasesprofesor/:idcentro/:idprofesor', [
    validarJWT,
], obtenerClasesProfesor);

router.get('/:id/alumnos', [
    validarJWT,
], obtenerAlumnos);

router.post('/escogerasignaturas', [
    validarJWT,
    check('nombreClase', 'El argumento nombreClase es obligatorio').not().isEmpty().trim(),
    check('uidCentro', 'El argumento email debe ser un email').not().isEmpty(),
    check('uidProfesor', 'El argumento uidProfesor es obligatorio').not().isEmpty(),
    check('asignatura', 'El argumento asignatura es obligatorio').not().isEmpty(),
    validarCampos,
], escogerAsignaturasProfesor);

router.post('/escogerclases', [
    validarJWT,
    check('nombreClase', 'El argumento nombreClase es obligatorio').not().isEmpty().trim(),
    check('uidCentro', 'El argumento email debe ser un email').not().isEmpty(),
    check('uidProfesor', 'El argumento uidProfesor es obligatorio').not().isEmpty(),
    validarCampos,
], escogerClasesProfesor);

router.get('/asignaturas', [], obtenerAsignaturas);

router.get('/:idProfesor/clase/:idClase', [
    validarJWT
], obtenerClase);

module.exports = router;