/**
 * Matches a valid Semantic Version 2 format.
 *
 * Compares the input with the RegEx pattern supplied by:
 * https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
 */
$.validator.addMethod( "semver2", function( value, element ) {
	return this.optional( element ) ||
		value.match( /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/ );
}, "Please enter a valid semantic version." );
