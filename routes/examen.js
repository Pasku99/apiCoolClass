/*
Ruta base: /api/examenes
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { crearExamen, obtenerExamenes, crearExamenResuelto, obtenerExamenResueltos, obtenerExamenesAlumnosCentro, obtenerExamenesClaseProfesor, obtenerNotasExamen, obtenerProximosExamenesAlumno, obtenerExamenesAsignaturaAlumno, obtenerExamenAlumno, obtenerExamenesResueltosAlumno, obtenerUltimosExamenesProfesor, obtenerProximosExamenesProfesor, obtenerTodosExamenesResueltosAlumno, obtenerTodosProximosExamenesAlumno, eliminarExamenProfesor, obtenerExamenResueltoAlumno } = require('../controllers/examen');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

const router = Router();

router.get('/', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('id', 'El id de profesor debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerExamenes);

router.post('/', [
    validarJWT,
    check('uidProfesor', 'El argumento uidProfesor es obligatorio').not().isEmpty().trim(),
    check('uidClase', 'El argumento uidClase es obligatorio').not().isEmpty().trim(),
    check('asignatura', 'El argumento asignatura es obligatorio').not().isEmpty(),
    // check('nombreExamen', 'El argumento nombreExamen es obligatorio').not().isEmpty(),
    // check('preguntas', 'El argumento preguntas es obligatorio').not().isEmpty(),
    check('fechaComienzo', 'El argumento fechaComienzo es obligatorio').not().isEmpty(),
    check('fechaFinal', 'El argumento fechaFinal es obligatorio').not().isEmpty(),
    validarCampos,
], crearExamen);

router.get('/examenesresueltos', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('id', 'El id de profesor debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerExamenResueltos);

router.post('/examenresuelto', [
    validarJWT,
    check('uidAlumno', 'El argumento uidAlumno es obligatorio').not().isEmpty(),
    check('uidExamen', 'El argumento uidExamen es obligatorio').not().isEmpty(),
    check('uidProfesor', 'El argumento uidProfesor es obligatorio').not().isEmpty().trim(),
    check('uidClase', 'El argumento uidClase es obligatorio').not().isEmpty().trim(),
    check('respuestasCorrectas', 'El argumento respuestas es obligatorio').not().isEmpty(),
    validarCampos,
], crearExamenResuelto);

router.get('/examen/:idExamen', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('id', 'El id de examen debe ser válido').optional().isMongoId(),
    check('idCentro', 'El id de centro debe ser válido').optional().isMongoId(),
    check('idAlumno', 'El id de alumno debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerExamenAlumno);

router.get('/notas/:idProfesor/:idAlumno', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idAlumno', 'El id de alumno debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerExamenesAsignaturaAlumno);

router.get('/examenesresueltos/:idAlumno', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idAlumno', 'El id de alumno debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerExamenesAlumnosCentro);

router.get('/examenesprofesor/:idProfesor/:idClase', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idProfesor', 'El id de profesor debe ser válido').optional().isMongoId(),
    check('idClase', 'El id de clase debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerExamenesClaseProfesor);

router.get('/examenesalumno/:idAlumno/:idProfesor/:idClase', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idAlumno', 'El id de alumno debe ser válido').optional().isMongoId(),
    check('idProfesor', 'El id de profesor debe ser válido').optional().isMongoId(),
    check('idClase', 'El id de clase debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerProximosExamenesAlumno);

router.get('/notas/:idExamen', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idExamen', 'El id de examen debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerNotasExamen);

router.get('/notasalumno/:idProfesor/:idAlumno', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idProfesor', 'El id de profesor debe ser válido').optional().isMongoId(),
    check('idAlumno', 'El id de alumno debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerExamenesResueltosAlumno);

router.get('/notaalumno/:idAlumno/:idExamen', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idAlumno', 'El id de alumno debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerExamenResueltoAlumno);

router.get('/ultimosexamenes/:idProfesor', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idProfesor', 'El id de profesor debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerUltimosExamenesProfesor);

router.get('/proximosexamenes/:idProfesor', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idProfesor', 'El id de profesor debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerProximosExamenesProfesor);

router.get('/ultimosexamenesalumno/:idAlumno', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idAlumno', 'El id de alumno debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerTodosExamenesResueltosAlumno);

router.get('/proximosexamenesalumno/:idClase/:idAlumno', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idClase', 'El id de clase debe ser válido').optional().isMongoId(),
    check('idAlumno', 'El id de alumno debe ser válido').optional().isMongoId(),
    validarCampos,
], obtenerTodosProximosExamenesAlumno);

router.delete('/:idProfesor/:idExamen', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('idProfesor', 'El id de profesor debe ser válido').optional().isMongoId(),
    check('idExamen', 'El id de examen debe ser válido').optional().isMongoId(),
    validarCampos,
], eliminarExamenProfesor);

module.exports = router;