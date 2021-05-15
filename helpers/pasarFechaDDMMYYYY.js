const pasarFechaDDMMYYYY = (fecha) => {
    date = new Date(fecha);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    dt = date.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }

    var fechaFinal = dt + '-' + month + '-' + year;
    return fechaFinal;
}

module.exports = { pasarFechaDDMMYYYY }