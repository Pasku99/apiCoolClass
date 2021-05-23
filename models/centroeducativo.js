const { Schema, model } = require('mongoose');

const CentroEducativoSchema = Schema({
    nombre: {
        type: String,
        require: true,
        unique: true
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
    imagen: {
        type: String,
    },
    rol: {
        type: String,
        require: true,
        default: 'ROL_CENTRO'
    },
    codigoProfesor: {
        type: String,
        unique: true,
    },
    codigoAlumno: {
        type: String,
        unique: true,
    },
    tokenRecovery: {
        type: String,
        default: ''
    }
}, { collection: 'centroeducativo' });


CentroEducativoSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('CentroEducativo', CentroEducativoSchema);