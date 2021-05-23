/*
Ruta base: /api/login
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { loginCentroEducativo, buscarTipoUsuario, tokenCentro, loginProfesor, tokenProfesor, token, loginAlumno, tokenAlumno, comprobarPasswordCentro, comprobarPasswordProfesor, comprobarPasswordAlumno, sendRecoverPassword, recuperarPassword } = require('../controllers/auth');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

const router = Router();

router.get('/token', [
    check('x-token', 'El argumento x-token es obligatorio').not().isEmpty(),
    validarCampos,
], token);

router.get('/tokencentro', [
    check('x-token', 'El argumento x-token es obligatorio').not().isEmpty(),
    validarCampos,
], tokenCentro);

router.get('/tokenprofesor', [
    check('x-token', 'El argumento x-token es obligatorio').not().isEmpty(),
    validarCampos,
], tokenProfesor);

router.get('/tokenalumno', [
    check('x-token', 'El argumento x-token es obligatorio').not().isEmpty(),
    validarCampos,
], tokenAlumno);

router.post('/centroeducativo', [
    check('password', 'El argumento pasword es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    validarCampos,
], loginCentroEducativo);

router.post('/profesor', [
    check('password', 'El argumento pasword es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    validarCampos,
], loginProfesor);

router.post('/alumno', [
    check('password', 'El argumento pasword es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    validarCampos,
], loginAlumno);

router.post('/buscartipo', [
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    validarCampos,
], buscarTipoUsuario);

router.post('/comprobarpasswordcentro', [
    validarJWT,
    check('uid', 'El argumento uid es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos,
], comprobarPasswordCentro);

router.post('/comprobarpasswordprofesor', [
    validarJWT,
    check('uid', 'El argumento uid es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos,
], comprobarPasswordProfesor);

router.post('/comprobarpasswordalumno', [
    validarJWT,
    check('uid', 'El argumento uid es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos,
], comprobarPasswordAlumno);

router.post('/recovery', [
    check('email', 'El argumento email es obligatorio').not().isEmpty().trim(),
    validarCampos
], sendRecoverPassword);

router.get('/recuperar-password/:token', [

], recuperarPassword);

module.exports = router;