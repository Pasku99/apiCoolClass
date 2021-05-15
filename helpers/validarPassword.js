const validarPassword = async(password) => {
    if (password.length >= 8) {
        var mayuscula = false;
        var minuscula = false;
        var numero = false;

        for (var i = 0; i < password.length; i++) {
            if (password.charCodeAt(i) >= 65 && password.charCodeAt(i) <= 90) {
                mayuscula = true;
            } else if (password.charCodeAt(i) >= 97 && password.charCodeAt(i) <= 122) {
                minuscula = true;
            } else if (password.charCodeAt(i) >= 48 && password.charCodeAt(i) <= 57) {
                numero = true;
            }
        }
        if (mayuscula == true && minuscula == true && numero == true) {
            return true;
        }
    } else {
        return false;
    }
}

module.exports = { validarPassword };