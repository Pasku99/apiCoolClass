const { Schema, model } = require('mongoose');

const AlumnoSchema = Schema({
    nombre: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    uidCentro: {
        type: String,
        require: true,
    },
    uidClase: {
        type: String,
    },
    nombreClase: {
        type: String,
    },
    imagen: {
        type: String,
    },
    arrayProfesores: {
        type: Array,
    },
    rol: {
        type: String,
        require: true,
        default: 'ROL_ALUMNO'
    }
}, { collection: 'alumno' });

AlumnoSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Alumno', AlumnoSchema);