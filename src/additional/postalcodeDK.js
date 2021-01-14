/*
 * Danish Kingdom Postal codes
 *
 * This accept all Danish(DK) kingdom postal codes (100 to 9999)
 * also work for the Danish kingdom Greenland and Faroe Islands.
 *
 * Note: Greenland and Faroe Islands is a part of the Danish Kingdom and not the country it self.
*/

$.validator.addMethod( "postalcodeDK", function( value, element ) {
	return this.optional( element ) || /^[0-9]{3,4}$/.test( value );
}, "Please specify a valid postal code" );
