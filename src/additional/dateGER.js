/**
 * Return true, if the value is a valid date, also making this formal check dd.mm.yyyy
 *
 * @example $.validator.methods.date("01.01.1900")
 * @result true
 *
 * @example $.validator.methods.date("01.13.1990")
 * @result false
 *
 * @example $.validator.methods.date("01/01/1900")
 * @result false
 *
 * @example <input name="test" class="{dateGER:true}" />
 * @desc Declares an optional input element whose value must be a valid german date.
 *
 * @name $.validator.methods.dateGer
 * @type Boolean
 * @cat Plugins/Validate/Methods
 */
$.validator.addMethod( "dateGER", function( value, element ) {
	var check = false,
		re = /^\d{1,2}\.\d{1,2}\.\d{4}$/,
		adata, dd, mm, yyyy, xdata;
	if ( re.test( value ) ) {
		adata = value.split( "." );
		dd = parseInt( adata[ 0 ], 10 );
		mm = parseInt( adata[ 1 ], 10 );
		yyyy = parseInt( adata[ 2 ], 10 );
		xdata = new Date( yyyy, mm - 1, dd );
		if ( ( xdata.getFullYear() === yyyy ) && ( xdata.getMonth() === mm - 1 ) && ( xdata.getDate() === dd ) ) {
			check = true;
		}
	}
	return this.optional( element ) || check;
}, $.validator.messages.date );
