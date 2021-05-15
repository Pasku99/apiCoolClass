const { Schema, model } = require('mongoose');

const ProfesorSchema = Schema({
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
    imagen: {
        type: String,
    },
    rol: {
        type: String,
        require: true,
        default: 'ROL_PROFESOR'
    },
    uidCentro: {
        type: String,
        require: true,
    },
    tokenRecovery: {
        type: String,
        default: ''
    },
}, { collection: 'profesor' });

ProfesorSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Profesor', ProfesorSchema);