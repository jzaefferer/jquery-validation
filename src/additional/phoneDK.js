/**
* Matches DK phone number format
*
* allows '-' or ' ' as a separator and allows parens around area code
* some people may want to put a '+45' in front of their number
*
* +45 21-77-21-77
* +45 21 77 21 77
* +45 21772177
* +4521772177
* 21 77 21 77
* 21-77-21-77
* 2177 2177
* 2177-2177
* 21772177
*
* but not
* +1 3243121212
* +45 112
* +452143284233
* 2143284233
*/
$.validator.addMethod( "phoneDK", function( phone_number, element ) {
	phone_number = phone_number.replace( /\s+/g, "" );
	return this.optional( element ) || phone_number.length > 9 &&
		phone_number.test( /^(?:\+45(?: )?)?(?:[0-9]{2})(?:(?:-| )?[0-9]{2})(?:(?:-| )?[0-9]{2})(?:(?:-| )?[0-9]{2})$/ );
}, "Please specify a valid phone number" );
