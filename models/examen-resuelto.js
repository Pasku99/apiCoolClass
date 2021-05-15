const { Schema, model } = require('mongoose');

const ExamenResueltoSchema = Schema({
    uidAlumno: {
        type: String,
        require: true,
    },
    nombreAlumno: {
        type: String,
    },
    uidExamen: {
        type: String,
        require: true,
    },
    uidProfesor: {
        type: String,
        require: true,
    },
    uidClase: {
        type: String,
        require: true,
    },
    nombreClase: {
        type: String,
    },
    asignatura: {
        type: String,
        require: true
    },
    nombreExamen: {
        type: String,
        require: true,
    },
    preguntas: {
        type: [String],
    },
    respuestas: {
        type: [
            [String]
        ],
    },
    respuestasCorrectas: {
        type: [String],
    },
    nota: {
        type: Number
    }
}, { collection: 'examen-resuelto' });

ExamenResueltoSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('ExamenResuelto', ExamenResueltoSchema);