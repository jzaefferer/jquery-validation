/*
 * The Rol Único Tributario ( RUN ) is the way tax identification used in Chile for individuals
 */
$.validator.addMethod('rutCL', function (value, element) {
    'use strict';

    if (this.optional(element)) {
        return true;
    }

    let calculateDV = function (rut) {
        let m = 0, s = 1;
        for (; rut; rut = Math.floor(rut / 10)) {
            s = (s + rut % 10 * (9 - m++ % 6)) % 11;
        }
        return s ? s - 1 : 'K';
    }

    // Basic format test
    const regex = /(\d{1,3}(\.?\d{3})*)\-([\dkK])/;
    if (!regex.test(value)) {
        return false;
    }

    // Test RUT
    let [rut, dv] = value.trim().replace(/\./g, '').toUpperCase().split('-', 2);

    return (calculateDV(rut) == dv);

}, 'Please specify a valid RUT');