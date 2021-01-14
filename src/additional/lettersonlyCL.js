/*
 * Only letters included in the Spanish alphabet
 */
$.validator.addMethod('lettersonlyCL', function (value, element) {
    const regex = /[^0-9\.\,\\\"\¿\?\¡\!\;\:\#\$\%\&\(\)\*\+\-\/\<\>\=\@\[\]\^_\{\}\|\~\€\°\`]+/;
    return regex.test(texto);
}, 'Please enter letters only');