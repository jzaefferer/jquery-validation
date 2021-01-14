/*
 * Validate Portuguese Postal Code:
 */
jQuery.validator.addMethod( "postalcodePT", function( value, element ) {
  return this.optional( element ) || /[0-9]{4}\-[0-9]{3}/.test( value );
}, "Please specify a valid postal code." );
