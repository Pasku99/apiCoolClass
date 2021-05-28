const { response } = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { generarJWT } = require('../helpers/jwt');
const generator = require('generate-password');
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

        const { _id, rol, uidCentro } = profesor;
        const token = await generarJWT(profesor._id, profesor.rol);

        res.json({
            ok: true,
            msg: 'login',
            uid: _id,
            uidCentro,
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

        const { _id, rol, uidClase } = alumno;
        const token = await generarJWT(alumno._id, alumno.rol);

        res.json({
            ok: true,
            msg: 'login',
            uid: _id,
            uidClase,
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

const sendRecoverPassword = async(req, res = response) => {
    //cogemos el email 
    const email = req.body.email;
    let resultadoGuardado;
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
                    resultadoGuardado = await Alumno.findOneAndUpdate({ email: email }, { tokenRecovery: crypto.randomBytes(16).toString('hex') }, { new: true });
                }
            } else {
                resultado = profesor;
                resultadoGuardado = await Profesor.findOneAndUpdate({ email: email }, { tokenRecovery: crypto.randomBytes(16).toString('hex') }, { new: true });
            }

        } else {
            resultado = centro;
            resultadoGuardado = await Centroeducativo.findOneAndUpdate({ email: email }, { tokenRecovery: crypto.randomBytes(16).toString('hex') }, { new: true });
        }
        // Envíamos el email vía nodemailer al usuario
        var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'coolclasscontacto@gmail.com', pass: 'Kernel2021' } });
        var mailOptions = { from: 'coolclasscontacto@gmail.com', to: resultadoGuardado.email, subject: 'Recuperación de contraseña - CoolClass', text: 'Muy buenas,\n\n' + 'Por favor clique en el siguiente enlace para recuperar su contraseña:' + process.env.HOSTX + '\/recuperar-password\/' + resultadoGuardado.tokenRecovery };
        transporter.sendMail(mailOptions, function(err) {
            // Si hay algún error en el envío devolvemos un error 500
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: err.message
                });
            }
            // Si todo va bien se devolverá lo siguiente
            res.json({
                ok: true,
                msg: 'Un email de recuperación de contraseña ha sido enviado a ' + resultadoGuardado.email + '.',
                usuario: resultadoGuardado,
            });
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error recuperando contraseña'
        });
    }
}

const recuperarPassword = async(req, res = response) => {
    const token = req.params.token;
    let resultadoGuardado;
    let passwordNueva;
    try {
        const centro = await Centroeducativo.findOne({ tokenRecovery: token });
        if (!centro) {
            const profesor = await Profesor.findOne({ tokenRecovery: token });
            if (!profesor) {
                const alumno = await Alumno.findOne({ tokenRecovery: token });
                if (!alumno) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Usuario y/o contraseña incorrectos',
                    });
                } else {
                    passwordNueva = generator.generate({
                        length: 8,
                        numbers: true
                    });
                    const salt = bcrypt.genSaltSync();
                    const cpassword = bcrypt.hashSync(passwordNueva, salt);
                    alumno.password = cpassword;
                    resultadoGuardado = await alumno.save();
                }
            } else {
                passwordNueva = generator.generate({
                    length: 8,
                    numbers: true
                });
                const salt = bcrypt.genSaltSync();
                const cpassword = bcrypt.hashSync(passwordNueva, salt);
                profesor.password = cpassword;
                resultadoGuardado = await profesor.save();
            }

        } else {
            passwordNueva = generator.generate({
                length: 8,
                numbers: true
            });
            const salt = bcrypt.genSaltSync();
            const cpassword = bcrypt.hashSync(passwordNueva, salt);
            centro.password = cpassword;
            resultadoGuardado = await centro.save();
        }

        res.setHeader('Content-type', 'text/html');
        res.write('<p style="font-size: 4rem; white-space: pre-line;">Su nueva contrase&ntildea es ' + '<b>' + passwordNueva + '</b>' + '. Podr&aacute cambiarla en el apartado editar perfil dentro de la aplicaci&oacuten.</p>');
        res.end();

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error recuperando contraseña'
        });
    }
}

module.exports = { loginCentroEducativo, tokenCentro, buscarTipoUsuario, loginProfesor, tokenProfesor, token, loginAlumno, tokenAlumno, comprobarPasswordCentro, comprobarPasswordProfesor, comprobarPasswordAlumno, sendRecoverPassword, recuperarPassword }