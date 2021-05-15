const { response } = require('express');
const bcrypt = require('bcryptjs');

const { generarJWT } = require('../helpers/jwt');
const jwt = require('jsonwebtoken');
const Centroeducativo = require('../models/centroeducativo');
const Profesor = require('../models/profesor');
const Alumno = require('../models/alumno');
var ObjectId = require('mongodb').ObjectID;

const loginCentroEducativo = async(req, res = response) => {

    const { email, password } = req.body;

    try {

        const centro = await Centroeducativo.findOne({ email });
        if (!centro) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const validPassword = bcrypt.compareSync(password, centro.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const { _id, rol } = centro;
        const token = await generarJWT(centro._id, centro.rol);

        res.json({
            ok: true,
            msg: 'login',
            uid: _id,
            token,
            rol
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error en login',
            token: ''
        });
    }

}

const tokenCentro = async(req, res = response) => {

    const token = req.headers['x-token'];

    try {
        const { uid, rol, ...object } = jwt.verify(token, process.env.JWTSECRET);

        const centro = await Centroeducativo.findById(uid);
        if (!centro) {
            return res.status(400).json({
                ok: false,
                msg: 'Token no válido',
                token: ''
            });
        }
        const rolBD = centro.rol;

        const nuevoToken = await generarJWT(uid, rol);

        res.json({
            ok: true,
            msg: 'Token',
            uid: uid,
            nombre: centro.nombre,
            email: centro.email,
            rol: rolBD,
            imagen: centro.imagen,
            codigoProfesor: centro.codigoProfesor,
            codigoAlumno: centro.codigoAlumno,
            token: nuevoToken
        });

    } catch {
        return res.status(400).json({
            ok: false,
            msg: 'Token no válido',
            token: ''
        });
    }
}

const loginProfesor = async(req, res = response) => {

    const { email, password } = req.body;

    try {

        const profesor = await Profesor.findOne({ email });
        if (!profesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const validPassword = bcrypt.compareSync(password, profesor.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const { _id, rol } = profesor;
        const token = await generarJWT(profesor._id, profesor.rol);

        res.json({
            ok: true,
            msg: 'login',
            uid: _id,
            token,
            rol
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error en login',
            token: ''
        });
    }
}

const tokenProfesor = async(req, res = response) => {

    const token = req.headers['x-token'];

    try {
        const { uid, rol, ...object } = jwt.verify(token, process.env.JWTSECRET);

        const profesor = await Profesor.findById(uid);
        if (!profesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Token no válido',
                token: ''
            });
        }
        const rolBD = profesor.rol;

        const nuevoToken = await generarJWT(uid, rol);

        res.json({
            ok: true,
            msg: 'Token',
            uid: uid,
            nombre: profesor.nombre,
            email: profesor.email,
            rol: rolBD,
            imagen: profesor.imagen,
            uidCentro: profesor.uidCentro,
            token: nuevoToken
        });

    } catch {
        return res.status(400).json({
            ok: false,
            msg: 'Token no válido',
            token: ''
        });
    }
}

const loginAlumno = async(req, res = response) => {

    const { email, password } = req.body;

    try {
        const alumno = await Alumno.findOne({ email: email });
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const validPassword = bcrypt.compareSync(password, alumno.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const { _id, rol } = alumno;
        const token = await generarJWT(alumno._id, alumno.rol);

        res.json({
            ok: true,
            msg: 'login',
            uid: _id,
            token,
            rol
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error en login',
            token: ''
        });
    }
}

const tokenAlumno = async(req, res = response) => {

    const token = req.headers['x-token'];

    try {
        const { uid, rol, ...object } = jwt.verify(token, process.env.JWTSECRET);

        const alumno = await Alumno.findById(uid);
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Token no válido',
                token: ''
            });
        }
        const rolBD = alumno.rol;

        const nuevoToken = await generarJWT(uid, rol);

        res.json({
            ok: true,
            msg: 'Token',
            uid: uid,
            nombre: alumno.nombre,
            email: alumno.email,
            uidCentro: alumno.uidCentro,
            uidClase: alumno.uidClase,
            nombreClase: alumno.nombreClase,
            rol: rolBD,
            imagen: alumno.imagen,
            token: nuevoToken
        });

    } catch {
        return res.status(400).json({
            ok: false,
            msg: 'Token no válido',
            token: ''
        });
    }
}

const token = async(req, res = response) => {

    const token = req.headers['x-token'];

    try {
        const { uid, rol, ...object } = jwt.verify(token, process.env.JWTSECRET);

        if (rol == 'ROL_CENTRO') {
            const centro = await Centroeducativo.findById(uid);
            if (!centro) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Token no válido',
                    token: ''
                });
            }
            const rolBD = centro.rol;

            const nuevoToken = await generarJWT(uid, rol);

            res.json({
                ok: true,
                msg: 'Token',
                uid: uid,
                nombre: centro.nombre,
                email: centro.email,
                rol: rolBD,
                imagen: centro.imagen,
                codigoProfesor: centro.codigoProfesor,
                codigoAlumno: centro.codigoAlumno,
                token: nuevoToken
            });

        } else if (rol == 'ROL_PROFESOR') {
            const profesor = await Profesor.findById(uid);
            if (!profesor) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Token no válido',
                    token: ''
                });
            }
            const rolBD = profesor.rol;

            const nuevoToken = await generarJWT(uid, rol);

            res.json({
                ok: true,
                msg: 'Token',
                uid: uid,
                nombre: profesor.nombre,
                email: profesor.email,
                rol: rolBD,
                imagen: profesor.imagen,
                uidCentro: profesor.uidCentro,
                token: nuevoToken
            });
        } else if (rol == 'ROL_ALUMNO') {
            const alumno = await Alumno.findById(uid);
            if (!alumno) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Token no válido',
                    token: ''
                });
            }
            const rolBD = alumno.rol;

            const nuevoToken = await generarJWT(uid, rol);

            res.json({
                ok: true,
                msg: 'Token',
                uid: uid,
                nombre: alumno.nombre,
                email: alumno.email,
                uidCentro: alumno.uidCentro,
                uidClase: alumno.uidClase,
                nombreClase: alumno.nombreClase,
                rol: rolBD,
                imagen: alumno.imagen,
                token: nuevoToken
            });
        }

    } catch {
        return res.status(400).json({
            ok: false,
            msg: 'Token no válido',
            token: ''
        });
    }
}

const buscarTipoUsuario = async(req, res = response) => {
    const { email } = req.body;
    let resultado;
    try {
        const centro = await Centroeducativo.find({ email: email });
        if (!centro) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al buscar el tipo de usuario',
            });
        }
        if (centro.length == 0) {
            const profesor = await Profesor.find({ email: email });
            if (!profesor) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al buscar el tipo de usuario',
                });
            }
            if (profesor.length == 0) {
                const alumno = await Alumno.find({ email: email });
                if (!alumno) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Error al buscar el tipo de usuario',
                    });
                }
                if (alumno.length == 0) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Usuario y/o contraseña incorrectos',
                    });
                } else {
                    resultado = alumno;
                }
            } else {
                resultado = profesor;
            }

        } else {
            resultado = centro;
        }
        res.json({
            ok: true,
            msg: 'buscarTipoUsuario',
            resultado
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error al buscar el tipo de usuario',
        });
    }
}

const comprobarPasswordCentro = async(req, res = response) => {
    const { uid, password } = req.body;

    try {
        // Comprobamos que exista el usuario
        const centro = await Centroeducativo.findById(uid);
        if (!centro) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        //Comprobamos que la contraseña que le llega desde el front coincide con la que hay en la base de datos
        const validPassword = bcrypt.compareSync(password, centro.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        res.json({
            ok: true,
            msg: 'contraseñaCorrecta',
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error comprobando contraseña',
        });
    }
}

const comprobarPasswordProfesor = async(req, res = response) => {
    const { uid, password } = req.body;

    try {
        // Comprobamos que exista el usuario
        const profesor = await Profesor.findById(uid);
        if (!profesor) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        //Comprobamos que la contraseña que le llega desde el front coincide con la que hay en la base de datos
        const validPassword = bcrypt.compareSync(password, profesor.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        res.json({
            ok: true,
            msg: 'contraseñaCorrecta',
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error comprobando contraseña',
        });
    }
}

const comprobarPasswordAlumno = async(req, res = response) => {
    const { uid, password } = req.body;

    try {
        // Comprobamos que exista el usuario
        const alumno = await Alumno.findById(uid);
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        //Comprobamos que la contraseña que le llega desde el front coincide con la que hay en la base de datos
        const validPassword = bcrypt.compareSync(password, alumno.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        res.json({
            ok: true,
            msg: 'contraseñaCorrecta',
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error comprobando contraseña',
        });
    }
}

module.exports = { loginCentroEducativo, tokenCentro, buscarTipoUsuario, loginProfesor, tokenProfesor, token, loginAlumno, tokenAlumno, comprobarPasswordCentro, comprobarPasswordProfesor, comprobarPasswordAlumno }