const { Schema, model } = require('mongoose');

const ClaseSchema = Schema({
    nombre: {
        type: String,
        require: true,
    },
    uidCentro: {
        type: String,
        require: true,
    },
    arrayAsignaturasProfesores: {
        type: [
            [String]
        ],
        require: true,
        default: [
            ['Matemáticas', ''],
            ['Castellano', ''],
            ['Inglés', ''],
            ['Francés', ''],
            ['Valenciano', ''],
            ['FyQ', ''],
            ['Biología', ''],
            ['Tecnología', ''],
            ['Informática', ''],
            ['C.Sociales', ''],
            ['E.Física', ''],
            ['Latín', '']
        ]
    },
    arrayProfesores: {
        type: Array,
    }
}, { collection: 'clase' });


ClaseSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Clase', ClaseSchema);