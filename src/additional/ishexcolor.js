$.validator.addMethod( "ishexcolor", function( value, element ) {
	return this.optional( element ) || /^#(?:[0-9a-f]{6}|[0-9a-f]{3})$/i.test( value );
}, "This is not hex format color" );
