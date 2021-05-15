const { Schema, model } = require('mongoose');

const ExamenSchema = Schema({
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
    fechaComienzo: {
        type: Date,
    },
    fechaFinal: {
        type: Date,
    }
}, { collection: 'examen' });

ExamenSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Examen', ExamenSchema);