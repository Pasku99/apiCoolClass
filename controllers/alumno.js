const { response } = require('express');
const bcrypt = require('bcryptjs');
const Clase = require('../models/clase');
const Centroeducativo = require('../models/centroeducativo');
const Profesor = require('../models/profesor');
const Alumno = require('../models/alumno');
const ExamenResuelto = require('../models/examen-resuelto');
const { validarPassword } = require('../helpers/validarPassword');
const { infoToken } = require('../helpers/infoToken');
const { updateOne } = require('../models/clase');

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const obtenerAlumnos = async(req, res) => {
    // Para búsqueda por texto
    const texto = req.query.texto;
    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
    }
    // Obtenemos el ID del profesor por si quiere buscar solo un profesor
    const id = req.query.id || '';
    const idCentro = req.query.idCentro || '';

    try {
        // Se comprueba que sea rol admin para poder listar
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === id) || (infoToken(token).uid === idCentro))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar alumnos',
            });
        }

        let alumnos, total;
        // Si ha llegado ID, hacemos el get /id
        if (id) {

            [alumnos] = await Promise.all([
                Alumno.findById(id),
            ]);
            total = 1;
        }
        // Si no ha llegado ID, hacemos el get /
        else {
            if (texto) {
                [alumnos, total] = await Promise.all([
                    Alumno.find({ $or: [{ username: textoBusqueda }, { email: textoBusqueda }] }),
                    Alumno.countDocuments({ $or: [{ username: textoBusqueda }, { email: textoBusqueda }] })
                ]);
            } else {
                [alumnos, total] = await Promise.all([
                    Alumno.find({}),
                    Alumno.countDocuments()
                ]);
            }
        }
        res.json({
            ok: true,
            msg: 'getAlumnos',
            alumnos,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo alumnos'
        });
    }
}

const crearAlumno = async(req, res = response) => {

    const { nombre, email, password, rol, codigoAlumno } = req.body;

    try {
        // Se comprueba que dicho codigo de profesor corresponda con algún centro
        const centro = await Centroeducativo.find({ codigoAlumno: codigoAlumno });
        if (!centro) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar centro educativo correspondiente'
            });
        }
        if (centro.length == 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningún centro con ese código de alumno. Por favor, póngase en contacto con su centro educativo.'
            });
        }
        const uidCentro = centro[0]._id;
        // Se comprueba que dicho email no exista ya en ningun tipo de usuario
        const existeEmailProfesor = await Profesor.findOne({ email: email });
        if (existeEmailProfesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Email ya existe'
            });
        }

        const existeEmailCentro = await Centroeducativo.findOne({ email: email });
        if (existeEmailCentro) {
            return res.status(400).json({
                ok: false,
                msg: 'Email ya existe'
            });
        }

        const existeEmailAlumno = await Alumno.findOne({ email: email });
        if (existeEmailAlumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Email ya existe'
            });
        }

        // Se valida que la contraseña tenga minúsculas, mayúsculas, número y al menos 8 caracteres
        const passwordValidada = await validarPassword(password);

        if (!passwordValidada) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña ha de tener mínimo 8 caracteres y estar formada al menos por una mayúscula, minúscula y un número',
            });
        }
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(password, salt);

        // Vamos a tomar todo lo que nos llega por el req.body y crear el profesor
        const {...object } = req.body;
        const alumno = new Alumno(object);
        alumno.password = cpassword;
        alumno.uidCentro = uidCentro;
        // Lo guardamos en base de datos
        const alumnoGuardado = await alumno.save();
        if (!alumnoGuardado) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al almacenar el alumno',
            });
        }

        res.json({
            ok: true,
            msg: 'Alumno registrado con éxito',
            alumnoGuardado,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando alumno'
        });
    }
}

const actualizarAlumno = async(req, res = response) => {

    // Asegurarnos de que aunque venga el password no se va a actualizar, la modificaciñon del password es otra llamada
    // Comprobar que si cambia el email no existe ya en BD, si no existe puede cambiarlo
    const { nombre, email, nuevopassword, nuevopassword2, ...object } = req.body;
    const uid = req.params.id;

    try {
        // Para actualizar profesor o eres admin o eres usuario del token y el uid que nos llega es el mismo
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uid))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para obtener clases',
            });
        }

        // Comprobar si está intentando cambiar el email, que no coincida con alguno que ya esté en BD
        // Obtenemos si hay un centro en BD con el email que nos llega en post
        const existeEmail = await Alumno.findOne({ email: email });

        if (existeEmail) {
            // Si existe un centro con ese email
            // Comprobamos que sea el suyo, el UID ha de ser igual, si no el email est en uso
            if (existeEmail._id != uid) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Email ya existe'
                });
            }
        }

        // Comprueba si el email de centro ya existe

        const existeEmailCentro = await Centroeducativo.findOne({ email: email });

        if (existeEmailCentro) {
            if (existeEmailCentro._id != uid) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Email ya existe'
                });
            }
        }

        // Comprueba si el email de profesor ya existe

        const existeEmailProfesor = await Profesor.findOne({ email: email });

        if (existeEmailProfesor) {
            if (existeEmailProfesor._id != uid) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Email ya existe'
                });
            }
        }


        // Comprobar si existe el centro que queremos actualizar
        const existeAlumno = await Alumno.findById(uid);

        if (!existeAlumno) {
            return res.status(400).json({
                ok: false,
                msg: 'El centro no existe'
            });
        }
        // llegado aquí el email o es el mismo o no está en BD, es obligatorio que siempre llegue un email
        object.email = email;
        // igual con el username
        object.nombre = nombre;

        // Se actualiza la contraseña si llegan los campos
        if (nuevopassword != '' && nuevopassword2 != '') {
            if (nuevopassword !== nuevopassword2) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La contraseña repetida no coincide con la nueva contraseña',
                });
            }

            const salt = bcrypt.genSaltSync();
            const cpassword = bcrypt.hashSync(nuevopassword, salt);
            object.password = cpassword;
        }

        // Almacenar en BD
        await existeAlumno.save();
        // Si el rol es de administrador, entonces si en los datos venía el campo activo lo dejamos
        // al haber extraido password del req.body nunca se va a enviar en este put
        const alumno = await Alumno.findByIdAndUpdate(uid, object, { new: true });

        res.json({
            ok: true,
            msg: 'Alumno actualizado',
            alumno
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error actualizando alumno'
        });
    }

}

const eliminarAlumno = async(req, res = response) => {
    const uidAlumno = req.params.idAlumno;
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidAlumno))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para eliminar al alumno',
            });
        }

        const examenesResueltosEliminados = await ExamenResuelto.deleteMany({ uidAlumno: uidAlumno });
        if (!examenesResueltosEliminados) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al eliminar los exámenes resueltos del alumno',
            });
        }

        const alumnoEliminado = await Alumno.findByIdAndRemove(uidAlumno);
        if (!alumnoEliminado) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al eliminar el alumno',
            });
        }

        res.json({
            ok: true,
            msg: 'Alumno eliminado con éxito',
            resultado: alumnoEliminado
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error eliminando alumno'
        });
    }
}

const escogerClase = async(req, res = response) => {
    const { uidAlumno, uidCentro, nombreClase } = req.body;
    try {
        const centro = await Centroeducativo.findById(uidCentro);
        if (!centro) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar centro educativo correspondiente'
            });
        }

        const clase = await Clase.findOne({ nombre: nombreClase });
        if (!clase) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar clase correspondiente'
            });
        }
        const buscarClaseAlumno = await Alumno.findById(uidAlumno);
        if (!buscarClaseAlumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar alumno/a correspondiente'
            });
        }

        if (buscarClaseAlumno.nombreClase == nombreClase) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya estás registrado en dicha clase'
            });
        }

        const alumno = await Alumno.findByIdAndUpdate(uidAlumno, { uidClase: clase._id, nombreClase: clase.nombre });
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar alumno correspondiente'
            });
        }

        res.json({
            ok: true,
            msg: 'Clase escogida con éxito',
            alumno,
            nuevaClase: clase._id
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error escogiendo clase'
        });
    }
}

const obtenerAsignaturas = async(req, res = response) => {
    const uid = req.params.idAlumno;
    const uidClase = req.params.idClase;
    const filtro = req.query.asignatura;
    let asignaturasDisponibles = [];
    let profesoresDisponibles = [];
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uid))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para obtener clases',
            });
        }

        const clase = await Clase.findById(uidClase);
        if (!clase) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar clase correspondiente'
            });
        }
        if (filtro == '') {
            for (let i = 0; i < clase.arrayAsignaturasProfesores.length; i++) {
                for (let j = 0; j < clase.arrayAsignaturasProfesores[i].length; j++) {
                    if (clase.arrayAsignaturasProfesores[i][j + 1]) {
                        asignaturasDisponibles.push(clase.arrayAsignaturasProfesores[i][j]);
                        profesoresDisponibles.push(clase.arrayAsignaturasProfesores[i][j + 1])
                    }
                }
            }
        } else {
            for (let i = 0; i < clase.arrayAsignaturasProfesores.length; i++) {
                for (let j = 0; j < clase.arrayAsignaturasProfesores[i].length; j++) {
                    if (clase.arrayAsignaturasProfesores[i][j] == filtro) {
                        asignaturasDisponibles.push(clase.arrayAsignaturasProfesores[i][j]);
                        profesoresDisponibles.push(clase.arrayAsignaturasProfesores[i][j + 1])
                    }
                }
            }
        }
        res.json({
            ok: true,
            msg: 'Asignaturas obtenidas con éxito',
            asignaturas: asignaturasDisponibles,
            profesores: profesoresDisponibles
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo asignaturas'
        });
    }
}

const obtenerProfesor = async(req, res = response) => {
    const uid = req.params.id;
    const uidProfesor = req.query.id;
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uid))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para obtener clases',
            });
        }

        const profesor = await Profesor.findById(uidProfesor);
        if (!profesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al encontrar profesor correspondiente'
            });
        }

        res.json({
            ok: true,
            msg: 'Profesor obtenido con éxito',
            profesor,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo profesor'
        });
    }
}

const obtenerAlumnosClase = async(req, res = response) => {
    const uidCentro = req.params.idCentro;
    const uidClase = req.params.idClase;
    const filtro = req.query.nombre;
    const uidAlumno = req.query.idAlumno;
    const uidProfesor = req.query.idProfesor;
    try {
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uidCentro) || (infoToken(token).uid === uidProfesor))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para obtener clases',
            });
        }

        if (filtro) {
            [alumnos] = await Promise.all([
                Alumno.find({ uidClase: uidClase, nombre: filtro }),
            ]);
            total = 1;
        } else if (uidAlumno) {
            [alumnos] = await Promise.all([
                Alumno.findById(uidAlumno),
            ]);
            total = 1;
        }
        // Si no ha llegado ID, hacemos el get /
        else {
            [alumnos, total] = await Promise.all([
                Alumno.find({ uidClase: uidClase }),
                Alumno.countDocuments({ uidClase: uidClase })
            ]);
        }

        res.json({
            ok: true,
            msg: 'Alumnos obtenidos con éxito',
            alumnos,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo alumnos'
        });
    }
}

module.exports = { obtenerAlumnos, crearAlumno, eliminarAlumno, escogerClase, obtenerAsignaturas, obtenerProfesor, actualizarAlumno, obtenerAlumnosClase }