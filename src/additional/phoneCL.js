/**
 * Matches CL phone number format
 *
 * Supports the following formats:
 * - Phone number with country code (e.g., +56988776655, +56228765432, and +56582553344).
 * - Phone number with leading zero instead of country code (e.g., 0988776655, 0228765432, and 0582553344).
 * - Phone number without country code or leading zero (e.g., 988776655, 228765432, and 582553344).
 */
$.validator.addMethod('phoneCL', function (phone_number, element) {
    phone_number = phone_number.replace(/\s+/g, '');
    return this.optional(element) || phone_number.length > 9 &&
        phone_number.match(/^(\+?56|0)?(2|3|4|5|6|7|9)\d{8}$/);
}, 'Please specify a valid phone number');