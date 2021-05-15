const { response } = require('express');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Centroeducativo = require('../models/centroeducativo');
const Profesor = require('../models/profesor');
const Examen = require('../models/examen');
const ExamenResuelto = require('../models/examen-resuelto');
const { validarPassword } = require('../helpers/validarPassword');
const { infoToken } = require('../helpers/infoToken');
const generator = require('generate-password');
const Clase = require('../models/clase');
var ObjectId = require('mongodb').ObjectID;
const Alumno = require('../models/alumno');
const { pasarFechaDDMMYYYY } = require('../helpers/pasarFechaDDMMYYYY');
const { arrayAleatorio } = require('../helpers/arrayAleatorio');
const { round } = require('../helpers/round');

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const obtenerExamenes = async(req, res) => {
    // Para búsqueda por texto
    const texto = req.query.texto;
    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
    }
    // Obtenemos el ID del profesor por si quiere buscar solo un profesor
    const id = req.query.id || '';
    const idProfesor = req.query.idProfesor || '';

    try {
        // Se comprueba que sea rol admin para poder listar
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === id) || (infoToken(token).uid === idProfesor))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar exámenes',
            });
        }

        let examenes, total;
        // Si ha llegado ID, hacemos el get /id
        if (id) {

            [examenes] = await Promise.all([
                Examen.findById(id),
            ]);
            total = 1;
        }
        // Si no ha llegado ID, hacemos el get /
        else {
            if (texto) {
                [examenes, total] = await Promise.all([
                    Examen.find({ $or: [{ username: textoBusqueda }, { email: textoBusqueda }] }),
                    Examen.countDocuments({ $or: [{ username: textoBusqueda }, { email: textoBusqueda }] })
                ]);
            } else {
                [examenes, total] = await Promise.all([
                    Examen.find({}),
                    Examen.countDocuments()
                ]);
            }
        }
        res.json({
            ok: true,
            msg: 'getExamenes',
            examenes,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo examenes'
        });
    }
}

const crearExamen = async(req, res = response) => {
    const { uidProfesor, uidClase, asignatura, nombreExamen, preguntas, respuestas, fechaComienzo, fechaFinal } = req.body;
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidProfesor))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar profesores',
            });
        }

        const profesor = await Profesor.findById(uidProfesor);
        if (!profesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar profesor correspondiente'
            });
        }

        const clase = await Clase.findById(uidClase);
        if (!clase) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar clase correspondiente'
            });
        }

        if (preguntas.length < 2) {
            return res.status(400).json({
                ok: false,
                msg: 'El examen ha de tener mínimo 2 preguntas'
            });
        }

        let fechaActualC = new Date();
        let fechaIngresadaC = new Date(fechaComienzo);
        if (fechaIngresadaC < fechaActualC) {
            return res.status(400).json({
                ok: false,
                msg: 'La fecha de comienzo no puede ser menor a la fecha actual'
            });
        }

        let fechaActualF = new Date();
        let fechaIngresadaF = new Date(fechaFinal);
        if (fechaIngresadaF < fechaActualF) {
            return res.status(400).json({
                ok: false,
                msg: 'La fecha de final no puede ser menor a la fecha actual'
            });
        }

        if (nombreExamen == '') {
            return res.status(400).json({
                ok: false,
                msg: 'Ha de ponerle un título al examen'
            });
        }

        const examenescreados = await Examen.findOne({ uidClase: uidClase, nombreExamen: nombreExamen });
        if (examenescreados) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya has creado un examen con ese nombre en la clase. Por favor, revíselo.'
            });
        }

        for (let i = 0; i < clase.arrayAsignaturasProfesores.length; i++) {
            if (clase.arrayAsignaturasProfesores[i][0] == asignatura) {
                if (clase.arrayAsignaturasProfesores[i][1] != uidProfesor) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'No puedes crear exámenes en dicha asignatura'
                    });
                }
            }
        }

        if (preguntas.length != respuestas.length) {
            return res.status(400).json({
                ok: false,
                msg: 'Has de incluir respuestas para ' + preguntas.length + ' preguntas. Ni más ni menos.'
            });
        }

        const {...object } = req.body;
        const examen = new Examen(object);
        examen.nombreClase = clase.nombre;

        const examenGuardado = await examen.save();
        if (!examenGuardado) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al almacenar el examen',
            });
        }

        res.json({
            ok: true,
            msg: 'crearExamen',
            examen,
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando examen'
        });
    }
}

const obtenerExamenResueltos = async(req, res) => {
    // Para búsqueda por texto
    const texto = req.query.texto;
    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
    }
    const id = req.query.id || '';

    try {
        // Se comprueba que sea rol admin para poder listar
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === id))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar exámenes',
            });
        }

        let examenesResueltos, total;
        // Si ha llegado ID, hacemos el get /id
        if (id) {

            [examenesResueltos] = await Promise.all([
                ExamenResuelto.findById(id),
            ]);
            total = 1;
        }
        // Si no ha llegado ID, hacemos el get /
        else {
            if (texto) {
                [examenesResueltos, total] = await Promise.all([
                    ExamenResuelto.find({ $or: [{ username: textoBusqueda }, { email: textoBusqueda }] }),
                    ExamenResuelto.countDocuments({ $or: [{ username: textoBusqueda }, { email: textoBusqueda }] })
                ]);
            } else {
                [examenesResueltos, total] = await Promise.all([
                    ExamenResuelto.find({}),
                    ExamenResuelto.countDocuments()
                ]);
            }
        }
        res.json({
            ok: true,
            msg: 'getExamenesResueltos',
            examenesResueltos,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo examenes resueltos'
        });
    }
}

const crearExamenResuelto = async(req, res = response) => {
    const { uidAlumno, uidExamen, uidProfesor, uidClase, respuestasCorrectas } = req.body;
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidAlumno))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para crear examen resuelto',
            });
        }

        const alumno = await Alumno.findById(uidAlumno);
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar alumno correspondiente'
            });
        }

        const examen = await Examen.findById(uidExamen);
        if (!examen) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar examen correspondiente'
            });
        }

        const examenRealizado = await ExamenResuelto.findOne({ uidAlumno: uidAlumno, uidExamen: uidExamen });
        if (examenRealizado) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya has realizado el examen. ¡No seas tramposo!',
            });
        }

        const profesor = await Profesor.findById(uidProfesor);
        if (!profesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar profesor correspondiente'
            });
        }

        const clase = await Clase.findById(uidClase);
        if (!clase) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar clase correspondiente'
            });
        }

        for (let i = 0; i < clase.arrayAsignaturasProfesores.length; i++) {
            if (clase.arrayAsignaturasProfesores[i][0] == examen.asignatura) {
                if (clase.arrayAsignaturasProfesores[i][1] != uidProfesor) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'No puedes crear exámenes en dicha asignatura'
                    });
                }
            }
        }

        if (examen.nombreClase != alumno.nombreClase) {
            return res.status(400).json({
                ok: false,
                msg: 'No puedes hacer este examen. No perteneces a la clase.'
            });
        }

        if (respuestasCorrectas.length != examen.preguntas.length) {
            return res.status(400).json({
                ok: false,
                msg: 'Has de incluir respuestas para ' + examen.preguntas.length + ' preguntas. Ni más ni menos.'
            });
        }

        let nota = 0;
        for (let i = 0; i < examen.respuestas.length; i++) {
            if (respuestasCorrectas[i] == examen.respuestas[i][0]) {
                nota++;
            } else if (respuestasCorrectas[i] == 'No responder') {

            } else {
                nota -= 0.33;
            }
        }

        nota = (nota * 10) / examen.preguntas.length;

        const {...object } = req.body;
        const examenResuelto = new ExamenResuelto(object);
        examenResuelto.nombreClase = clase.nombre;
        examenResuelto.nota = round(nota);
        examenResuelto.asignatura = examen.asignatura;
        examenResuelto.nombreExamen = examen.nombreExamen;
        examenResuelto.nombreAlumno = alumno.nombre;
        examenResuelto.preguntas = examen.preguntas;
        examenResuelto.respuestas = examen.respuestas;

        const examenResueltoGuardado = await examenResuelto.save();
        if (!examenResueltoGuardado) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al almacenar el examen resuelto',
            });
        }

        res.json({
            ok: true,
            msg: 'crearExamen',
            examenResuelto,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando examen resuelto'
        });
    }
}

const obtenerExamenesAlumnosCentro = async(req, res = response) => {
    const uidAlumno = req.params.idAlumno;
    const uidCentro = req.query.idCentro || '';
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidCentro))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar alumnos del centro',
            });
        }

        const alumno = await Alumno.findById(uidAlumno);
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar alumno correspondiente'
            });
        }

        const examenesAlumno = await ExamenResuelto.find({ uidAlumno: uidAlumno });
        if (!examenesAlumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar examenes del alumno'
            });
        }

        res.json({
            ok: true,
            msg: 'getExamenesAlumno',
            examenesAlumno,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo examenes resueltos del alumno'
        });
    }
}

const obtenerExamenesClaseProfesor = async(req, res = response) => {
    const uidProfesor = req.params.idProfesor;
    const uidClase = req.params.idClase;
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidProfesor))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar los exámenes',
            });
        }

        const profesor = await Profesor.findById(uidProfesor);
        if (!profesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar profesor correspondiente'
            });
        }

        const clase = await Clase.findById(uidClase);
        if (!clase) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar clase correspondiente'
            });
        }

        const examenesProfesor = await Examen.find({ uidProfesor: uidProfesor, nombreClase: clase.nombre });
        if (!examenesProfesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar examenes del profesor'
            });
        }

        res.json({
            ok: true,
            msg: 'getExamenesProfesor',
            examenesProfesor,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo examenes resueltos del alumno'
        });
    }
}

const obtenerNotasExamen = async(req, res = response) => {
    const uidExamen = req.params.idExamen;
    const uidProfesor = req.query.idProfesor;
    const nombreAlumno = req.query.nombreAlumno;
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidProfesor))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar los exámenes',
            });
        }

        const examen = await Examen.findById(uidExamen);
        if (!examen) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar examen correspondiente'
            });
        }
        let examenesResueltos;
        if (nombreAlumno) {
            examenesResueltos = await ExamenResuelto.find({ uidExamen: uidExamen, nombreAlumno: nombreAlumno });
            if (!examenesResueltos) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al encontrar examenes resueltos correspondientes'
                });
            }
        } else {
            examenesResueltos = await ExamenResuelto.find({ uidExamen: uidExamen });
            if (!examenesResueltos) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al encontrar examenes resueltos correspondientes'
                });
            }
        }

        res.json({
            ok: true,
            msg: 'getNotasExamen',
            examenesResueltos,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo notas del examen'
        });
    }
}

const obtenerProximosExamenesAlumno = async(req, res = response) => {
    const uidAlumno = req.params.idAlumno;
    const uidProfesor = req.params.idProfesor;
    const uidClase = req.params.idClase;
    const limitado = req.query.limitado;
    const nombreExamen = req.query.nombreExamen;
    let textoBusqueda = '';
    if (nombreExamen) {
        textoBusqueda = new RegExp(nombreExamen, 'i');
    }
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidAlumno))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar los exámenes próximos',
            });
        }

        const profesor = await Profesor.findById(uidProfesor);
        if (!profesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar profesor correspondiente'
            });
        }

        const clase = await Clase.findById(uidClase);
        if (!clase) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar clase correspondiente'
            });
        }

        const alumno = await Alumno.findById(uidAlumno);
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar clase correspondiente'
            });
        }

        let fechaInicio = new Date();
        let proximosexamenesAlumno, total;
        if (limitado) {
            [proximosexamenesAlumno, total] = await Promise.all([
                Examen.find({ uidProfesor: uidProfesor, nombreClase: clase.nombre, fechaFinal: { $gte: fechaInicio } }).sort({ fecha: 'desc' }).limit(6),
                Examen.countDocuments({ uidProfesor: uidProfesor, nombreClase: clase.nombre, fechaFinal: { $gte: fechaInicio } }).sort({ fecha: 'desc' }).limit(6)
            ]);
        } else if (nombreExamen) {
            [proximosexamenesAlumno, total] = await Promise.all([
                Examen.find({ $and: [{ uidProfesor: uidProfesor, nombreClase: clase.nombre, fechaFinal: { $gte: fechaInicio } }, { $or: [{ nombreExamen: textoBusqueda }] }] }).sort({ date: 'desc' }),
                Examen.countDocuments({ $and: [{ uidProfesor: uidProfesor, nombreClase: clase.nombre, fechaFinal: { $gte: fechaInicio } }, { $or: [{ nombreExamen: textoBusqueda }] }] }).sort({ date: 'desc' }),
            ]);
        } else {
            [proximosexamenesAlumno, total] = await Promise.all([
                Examen.find({ uidProfesor: uidProfesor, nombreClase: clase.nombre, fechaFinal: { $gte: fechaInicio } }).sort({ fecha: 'desc' }),
                Examen.find({ uidProfesor: uidProfesor, nombreClase: clase.nombre, fechaFinal: { $gte: fechaInicio } }).sort({ fecha: 'desc' })
            ]);
        }

        res.json({
            ok: true,
            msg: 'getExamenesProfesor',
            proximosExamenes: proximosexamenesAlumno,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo proximos examenes del alumno'
        });
    }
}

const obtenerExamenesAsignaturaAlumno = async(req, res = response) => {
    const uidAlumno = req.params.idAlumno;
    const uidProfesor = req.params.idProfesor;
    const limitado = req.query.limitado;
    const nombreExamen = req.query.nombreExamen;
    let textoBusqueda = '';
    if (nombreExamen) {
        textoBusqueda = new RegExp(nombreExamen, 'i');
    }
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidAlumno))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar los examenes resueltos del alumno',
            });
        }

        const alumno = await Alumno.findById(uidAlumno);
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar alumno correspondiente'
            });
        }

        let examenesResueltos, total;
        if (limitado) {
            [examenesResueltos, total] = await Promise.all([
                ExamenResuelto.find({ uidProfesor: uidProfesor, uidAlumno: uidAlumno, }).sort({ date: 'desc' }).limit(6),
                ExamenResuelto.countDocuments({ uidProfesor: uidProfesor, uidAlumno: uidAlumno }).sort({ date: 'desc' }).limit(6)
            ]);
        } else if (nombreExamen) {
            [examenesResueltos, total] = await Promise.all([
                ExamenResuelto.find({ $and: [{ uidProfesor: uidProfesor, uidAlumno: uidAlumno }, { $or: [{ nombreExamen: textoBusqueda }] }] }).sort({ date: 'desc' }),
                ExamenResuelto.countDocuments({ $and: [{ uidProfesor: uidProfesor, uidAlumno: uidAlumno }, { $or: [{ nombreExamen: textoBusqueda }] }] }).sort({ date: 'desc' }),
            ]);
        } else {
            [examenesResueltos, total] = await Promise.all([
                ExamenResuelto.find({ uidProfesor: uidProfesor, uidAlumno: uidAlumno }),
                ExamenResuelto.countDocuments({ uidProfesor: uidProfesor, uidAlumno: uidAlumno })
            ]);
        }

        res.json({
            ok: true,
            msg: 'getExamenesAlumno',
            examenesResueltos
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo examenes resueltos del alumno'
        });
    }
}

const obtenerExamenAlumno = async(req, res) => {

    const uidExamen = req.params.idExamen;
    const uidAlumno = req.query.idAlumno || '';
    const uidCentro = req.query.idCentro || '';
    let respuestas = [];
    let respuestasAleatorias = [];
    let preguntas = [];

    try {
        // Se comprueba que sea rol admin para poder listar
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidCentro) || (infoToken(token).uid === uidAlumno))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar exámenes',
            });
        }

        const examen = await Examen.findById(uidExamen);
        if (!examen) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al buscar examen',
            });
        }

        let nombreExamen = examen.nombreExamen;

        for (let i = 0; i < examen.preguntas.length; i++) {
            preguntas.push(examen.preguntas[i]);
        }

        for (let i = 0; i < examen.respuestas.length; i++) {
            for (let j = 0; j < examen.respuestas[i].length; j++) {
                respuestas.push(examen.respuestas[i][j]);
            }
            arrayAleatorio(respuestas);
            respuestasAleatorias.push(respuestas);
            respuestas = [];
        }

        let fechaComienzo = examen.fechaComienzo;
        let fechaFinal = examen.fechaFinal;

        res.json({
            ok: true,
            msg: 'getExamen',
            nombreExamen,
            preguntas,
            respuestasAleatorias,
            fechaComienzo,
            fechaFinal
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo examen'
        });
    }
}

const obtenerExamenesResueltosAlumno = async(req, res) => {
    const uidProfesor = req.params.idProfesor;
    const uidAlumno = req.params.idAlumno;
    const uidExamen = req.query.idExamen;

    try {
        // Se comprueba que sea rol admin para poder listar
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidProfesor))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar exámenes',
            });
        }

        let examenesResueltos, total;
        if (uidExamen) {
            [examenesResueltos] = await Promise.all([
                ExamenResuelto.findOne({ _id: uidExamen, uidAlumno: uidAlumno }),
            ]);
            total = 1;
        } else {
            [examenesResueltos, total] = await Promise.all([
                ExamenResuelto.find({ uidProfesor: uidProfesor, uidAlumno: uidAlumno }),
                ExamenResuelto.countDocuments({ uidProfesor: uidProfesor, uidAlumno: uidAlumno })
            ]);
        }

        res.json({
            ok: true,
            msg: 'getExamenesResueltosAlumno',
            examenesResueltos,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo examenes resueltos'
        });
    }
}

const obtenerUltimosExamenesProfesor = async(req, res = response) => {
    const uidProfesor = req.params.idProfesor;
    const uidClase = req.query.idClase;
    const nombreExamen = req.query.nombreExamen;
    let textoBusqueda = '';
    if (nombreExamen) {
        textoBusqueda = new RegExp(nombreExamen, 'i');
    }
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidProfesor))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para obtener los últimos exámenes',
            });
        }

        let fechaActual = new Date();
        let ultimosExamenes, total;
        if (uidClase && !nombreExamen) {
            [ultimosExamenes, total] = await Promise.all([
                Examen.find({ uidProfesor: uidProfesor, uidClase: uidClase, fechaFinal: { $lt: fechaActual } }).sort({ fechaComienzo: 'desc' }),
                Examen.countDocuments({ uidProfesor: uidProfesor, uidClase: uidClase, fechaFinal: { $lt: fechaActual } }).sort({ fechaComienzo: 'desc' })
            ]);
        } else if (uidClase && nombreExamen) {
            [ultimosExamenes, total] = await Promise.all([
                Examen.find({ $and: [{ uidProfesor: uidProfesor, uidClase: uidClase, fechaFinal: { $lt: fechaActual } }, { $or: [{ nombreExamen: textoBusqueda }] }] }).sort({ fechaComienzo: 'desc' }),
                Examen.countDocuments({ $and: [{ uidProfesor: uidProfesor, uidClase: uidClase, fechaFinal: { $lt: fechaActual } }, { $or: [{ nombreExamen: textoBusqueda }] }] }).sort({ fechaComienzo: 'desc' })
            ]);
        } else {
            [ultimosExamenes, total] = await Promise.all([
                Examen.find({ uidProfesor: uidProfesor, fechaFinal: { $lt: fechaActual } }).sort({ fechaComienzo: 'desc' }).limit(6),
                Examen.countDocuments({ uidProfesor: uidProfesor, fechaComienzo: { $gte: fechaActual } }).sort({ fechaComienzo: 'desc' }).limit(6)
            ]);
        }

        res.json({
            ok: true,
            msg: 'getUltimosExamenes',
            ultimosExamenes,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo últimos exámenes del profesor'
        });
    }
}

const obtenerProximosExamenesProfesor = async(req, res = response) => {
    const uidProfesor = req.params.idProfesor;
    const uidClase = req.query.idClase;
    const nombreExamen = req.query.nombreExamen;
    let textoBusqueda = '';
    if (nombreExamen) {
        textoBusqueda = new RegExp(nombreExamen, 'i');
    }
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidProfesor))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para obtener los próximos exámenes',
            });
        }

        let fechaActual = new Date();
        let proximosExamenes, total;
        if (uidClase && !nombreExamen) {
            [proximosExamenes, total] = await Promise.all([
                Examen.find({ uidProfesor: uidProfesor, uidClase: uidClase, fechaFinal: { $gte: fechaActual } }).sort({ fechaFinal: 'desc' }),
                Examen.countDocuments({ uidProfesor: uidProfesor, uidClase: uidClase, fechaFinal: { $gte: fechaActual } }).sort({ fechaFinal: 'desc' }),
            ]);
        } else if (uidClase && nombreExamen) {
            [proximosExamenes, total] = await Promise.all([
                Examen.find({ $and: [{ uidProfesor: uidProfesor, uidClase: uidClase, fechaFinal: { $gte: fechaActual } }, { $or: [{ nombreExamen: textoBusqueda }] }] }).sort({ fechaFinal: 'desc' }),
                Examen.countDocuments({ $and: [{ uidProfesor: uidProfesor, uidClase: uidClase, fechaFinal: { $gte: fechaActual } }, { $or: [{ nombreExamen: textoBusqueda }] }] }).sort({ fechaFinal: 'desc' })
            ]);
        } else {
            [proximosExamenes, total] = await Promise.all([
                Examen.find({ uidProfesor: uidProfesor, fechaFinal: { $gte: fechaActual } }).sort({ fechaFinal: 'desc' }).limit(6),
                Examen.countDocuments({ uidProfesor: uidProfesor, fechaFinal: { $gte: fechaActual } }).sort({ fechaFinal: 'desc' }).limit(6)
            ]);
        }

        res.json({
            ok: true,
            msg: 'getProximosExamenes',
            proximosExamenes,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo próximos exámenes del profesor'
        });
    }
}

const obtenerTodosExamenesResueltosAlumno = async(req, res = response) => {
    const uidAlumno = req.params.idAlumno;
    const limitado = req.query.limitado;
    const nombreExamen = req.query.nombreExamen;
    let textoBusqueda = '';
    if (nombreExamen) {
        textoBusqueda = new RegExp(nombreExamen, 'i');
    }
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidAlumno))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar los examenes resueltos del alumno',
            });
        }

        const alumno = await Alumno.findById(uidAlumno);
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar alumno correspondiente'
            });
        }

        let examenesAlumno, total;
        if (limitado && !nombreExamen) {
            [examenesAlumno, total] = await Promise.all([
                ExamenResuelto.find({ uidAlumno: uidAlumno }).sort({ fechaComienzo: 'desc' }).limit(6),
                ExamenResuelto.countDocuments({ uidAlumno: uidAlumno }).sort({ fechaComienzo: 'desc' }).limit(6)
            ]);
        } else if (!limitado && nombreExamen) {
            [examenesAlumno, total] = await Promise.all([
                ExamenResuelto.find({ $and: [{ uidAlumno: uidAlumno }, { $or: [{ nombreExamen: textoBusqueda }] }] }).sort({ fechaComienzo: 'desc' }),
                ExamenResuelto.countDocuments({ $and: [{ uidAlumno: uidAlumno }, { $or: [{ nombreExamen: textoBusqueda }] }] }).sort({ fechaComienzo: 'desc' }),
            ]);
        } else {
            [examenesAlumno, total] = await Promise.all([
                ExamenResuelto.find({ uidAlumno: uidAlumno }).sort({ fechaComienzo: 'desc' }),
                ExamenResuelto.countDocuments({ uidAlumno: uidAlumno }).sort({ fechaComienzo: 'desc' })
            ]);
        }

        res.json({
            ok: true,
            msg: 'getExamenesAlumno',
            examenesAlumno,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo examenes resueltos del alumno'
        });
    }
}

const obtenerTodosProximosExamenesAlumno = async(req, res = response) => {
    const uidAlumno = req.params.idAlumno;
    const uidClase = req.params.idClase;
    const limitado = req.query.limitado;
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidAlumno))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar los próximos exámenes del alumno',
            });
        }

        const alumno = await Alumno.findById(uidAlumno);
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar alumno correspondiente'
            });
        }

        let proximosExamenesAlumno, total;
        let fechaActual = new Date();
        // fechaActual.setHours(fechaActual.getHours() + 2);
        if (limitado) {
            [proximosExamenesAlumno, total] = await Promise.all([
                Examen.find({ uidClase: uidClase, fechaFinal: { $gte: fechaActual } }).sort({ fechaComienzo: 'asc' }).limit(6),
                Examen.countDocuments({ uidClase: uidClase, fechaFinal: { $gte: fechaActual } }).sort({ fechaComienzo: 'asc' }).limit(6)
            ]);
        } else {
            [proximosExamenesAlumno, total] = await Promise.all([
                Examen.find({ uidClase: uidClase, fechaFinal: { $gte: fechaActual } }).sort({ fecha: 'asc' }),
                Examen.countDocuments({ uidClase: uidClase, fechaFinal: { $gte: fechaActual } }).sort({ fechaComienzo: 'asc' })
            ]);
        }

        res.json({
            ok: true,
            msg: 'getProximosExamenesAlumno',
            proximosExamenesAlumno,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo examenes resueltos del alumno'
        });
    }
}

const eliminarExamenProfesor = async(req, res = response) => {
    const uidProfesor = req.params.idProfesor;
    const uidExamen = req.params.idExamen;
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidProfesor))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para eliminar el examen',
            });
        }

        const profesor = await Profesor.findById(uidProfesor);
        if (!profesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al buscar profesor correspondiente'
            });
        }

        const examenesResueltos = await ExamenResuelto.deleteMany({ uidExamen: uidExamen, uidProfesor: uidProfesor });
        if (!examenesResueltos) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al borrar los exámenes resueltos de dicho examen'
            });
        }

        const examenEliminado = await Examen.findOneAndRemove({ _id: uidExamen, uidProfesor: uidProfesor });
        if (!examenEliminado) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al eliminar examen'
            });
        }

        res.json({
            ok: true,
            msg: 'Usuario eliminado',
            resultado: examenEliminado,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error eliminando el examen'
        });
    }
}

module.exports = { obtenerExamenes, crearExamen, obtenerExamenResueltos, crearExamenResuelto, obtenerExamenesAlumnosCentro, obtenerExamenesClaseProfesor, obtenerNotasExamen, obtenerProximosExamenesAlumno, obtenerExamenesAsignaturaAlumno, obtenerExamenAlumno, obtenerExamenesResueltosAlumno, obtenerUltimosExamenesProfesor, obtenerProximosExamenesProfesor, obtenerTodosExamenesResueltosAlumno, obtenerTodosProximosExamenesAlumno, eliminarExamenProfesor }