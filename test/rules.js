QUnit.module( "rules" );

QUnit.test( "rules() - internal - input", function( assert ) {
	var element = $( "#firstname" );

	$( "#testForm1" ).validate();

	assert.deepEqual( element.rules(), { required: true, minlength: 2 } );
} );

QUnit.test( "rules(), ignore method:false", function( assert ) {
	var element = $( "#firstnamec" );

	$( "#testForm1clean" ).validate( {
		rules: {
			firstnamec: { required: false, minlength: 2 }
		}
	} );

	assert.deepEqual( element.rules(), { minlength: 2 } );
} );

QUnit.test( "rules() HTML5 required (no value)", function( assert ) {
	var element = $( "#testForm11text1" );

	$( "#testForm11" ).validate();

	assert.deepEqual( element.rules(), { required: true } );
} );

QUnit.test( "rules() - internal - select", function( assert ) {
	var element = $( "#meal" );

	$( "#testForm3" ).validate();

	assert.deepEqual( element.rules(), { required: true } );
} );

QUnit.test( "rules() - external", function( assert ) {
	var element = $( "#text1" );

	$( "#form" ).validate( {
		rules: {
			action: { date: true, min: 5 }
		}
	} );

	assert.deepEqual( element.rules(), { date: true, min: 5 } );
} );

QUnit.test( "rules() - external - complete form", function( assert ) {
	assert.expect( 1 );

	var methods = $.extend( {}, $.validator.methods ),
		messages = $.extend( {}, $.validator.messages ),
		v;

	$.validator.addMethod( "verifyTest", function() {
		assert.ok( true, "method executed" );
		return true;
	} );
	v = $( "#form" ).validate( {
		rules: {
			action: { verifyTest: true }
		}
	} );
	v.form();

	$.validator.methods = methods;
	$.validator.messages = messages;
} );

QUnit.test( "rules() - internal - input", function( assert ) {
	var element = $( "#form8input" );

	$( "#testForm8" ).validate();

	assert.deepEqual( element.rules(), { required: true, number: true, rangelength: [ 2, 8 ] } );
} );

QUnit.test( "rules(), merge min/max to range, minlength/maxlength to rangelength", function( assert ) {
	jQuery.validator.autoCreateRanges = true;

	$( "#testForm1clean" ).validate( {
		rules: {
			firstnamec: {
				min: -15,
				max: 0
			},
			lastname: {
				minlength: 0,
				maxlength: 10
			}
		}
	} );

	assert.deepEqual( $( "#firstnamec" ).rules(), { range: [ -15, 0 ] } );
	assert.deepEqual( $( "#lastnamec" ).rules(), { rangelength: [ 0, 10 ] } );

	jQuery.validator.autoCreateRanges = false;
} );

QUnit.test( "rules(), guarantee that required is at front", function( assert ) {
	$( "#testForm1" ).validate();
	var v = $( "#v2" ).validate(),
		v1 = $( "#subformRequired" ).validate();
	function flatRules( element ) {
		var result = [];
		jQuery.each( $( element ).rules(), function( key ) { result.push( key ); } );
		return result.join( " " );
	}
	assert.equal( flatRules( "#firstname" ), "required minlength" );
	assert.equal( flatRules( "#v2-i6" ), "required minlength maxlength" );
	assert.equal( flatRules( "#co_name" ), "required maxlength" );

	v.destroy();
	v1.destroy();
	jQuery.validator.autoCreateRanges = true;
	v = $( "#v2" ).validate();
	assert.equal( flatRules( "#v2-i6" ), "required rangelength" );

	v1 = $( "#subformRequired" ).validate( {
		rules: {
			co_name: "required"
		}
	} );
	$( "#co_name" ).removeClass();
	assert.equal( flatRules( "#co_name" ), "required maxlength" );
	jQuery.validator.autoCreateRanges = false;
} );

QUnit.test( "rules(), evaluate dynamic parameters", function( assert ) {
	assert.expect( 2 );

	$( "#testForm1clean" ).validate( {
		rules: {
			firstnamec: {
				min: function( element ) {
					assert.equal( $( "#firstnamec" )[ 0 ], element );
					return 12;
				}
			}
		}
	} );

	assert.deepEqual( $( "#firstnamec" ).rules(), { min: 12 } );
} );

QUnit.test( "rules(), class and attribute combinations", function( assert ) {

	$.validator.addMethod( "customMethod1", function() {
		return false;
	}, "" );
	$.validator.addMethod( "customMethod2", function() {
		return false;
	}, "" );

	$( "#v2" ).validate( {
		rules: {
			"v2-i9": {
				required: true,
				minlength: 2,
				customMethod: true
			}
		}
	} );

	assert.deepEqual( $( "#v2-i1" ).rules(), { required: true } );
	assert.deepEqual( $( "#v2-i2" ).rules(), { required: true, email: true } );
	assert.deepEqual( $( "#v2-i3" ).rules(), { url: true } );
	assert.deepEqual( $( "#v2-i4" ).rules(), { required: true, minlength: 2 } );
	assert.deepEqual( $( "#v2-i5" ).rules(), { required: true, minlength: 2, maxlength: 5, customMethod1: "123" } );
	jQuery.validator.autoCreateRanges = true;
	assert.deepEqual( $( "#v2-i5" ).rules(), { required: true, customMethod1: "123", rangelength: [ 2, 5 ] } );
	assert.deepEqual( $( "#v2-i6" ).rules(), { required: true, customMethod2: true, rangelength: [ 2, 5 ] } );
	assert.deepEqual( $( "#v2-i7" ).rules(), { required: true, number: true } );
	assert.deepEqual( $( "#v2-i8" ).rules(), { required: true, number: true } );
	jQuery.validator.autoCreateRanges = false;
	assert.deepEqual( $( "#v2-i9" ).rules(), { required: true, minlength: 2, customMethod: true } );

	delete $.validator.methods.customMethod1;
	delete $.validator.messages.customMethod1;
	delete $.validator.methods.customMethod2;
	delete $.validator.messages.customMethod2;
	delete $.validator.classRuleSettings.customMethod2;
} );

QUnit.test( "rules(), dependency checks", function( assert ) {
	var v = $( "#testForm1clean" ).validate( {
			rules: {
				firstnamec: {
					min: {
						param: 5,
						depends: function( el ) {
							return ( /^a/ ).test( $( el ).val() );
						}
					}
				},
				lastname: {
					max: {
						param: 12
					},
					email: {
						depends: function() { return true; }
					}
				}
			}
		} ),
		rules = $( "#firstnamec" ).rules();

	assert.equal( v.objectLength( rules ), 0 );

	$( "#firstnamec" ).val( "ab" );
	assert.deepEqual( $( "#firstnamec" ).rules(), { min: 5 } );

	assert.deepEqual( $( "#lastnamec" ).rules(), { max: 12, email: true } );
} );

QUnit.test( "rules(), add and remove", function( assert ) {
	$.validator.addMethod( "customMethod1", function() {
		return false;
	}, "" );
	$( "#v2" ).validate();
	$( "#v2-i5" ).removeClass( "required" ).removeAttr( "minlength maxlength" );
	assert.deepEqual( $( "#v2-i5" ).rules(), { customMethod1: "123" } );

	$( "#v2-i5" ).addClass( "required" ).attr( {
		minlength: 2,
		maxlength: 5
	} );
	assert.deepEqual( $( "#v2-i5" ).rules(), { required: true, minlength: 2, maxlength: 5, customMethod1: "123" } );

	$( "#v2-i5" ).addClass( "email" ).attr( { min: 5 } );
	assert.deepEqual( $( "#v2-i5" ).rules(), { required: true, email: true, minlength: 2, maxlength: 5, min: 5, customMethod1: "123" } );

	$( "#v2-i5" ).removeClass( "required email" ).removeAttr( "minlength maxlength customMethod1 min" );
	assert.deepEqual( $( "#v2-i5" ).rules(), {} );

	delete $.validator.methods.customMethod1;
	delete $.validator.messages.customMethod1;
} );

QUnit.test( "rules(), add and remove static rules", function( assert ) {

	$( "#testForm1clean" ).validate( {
		rules: {
			firstnamec: "required date"
		}
	} );

	assert.deepEqual( $( "#firstnamec" ).rules(), { required: true, date: true } );

	$( "#firstnamec" ).rules( "remove", "date" );
	assert.deepEqual( $( "#firstnamec" ).rules(), { required: true } );
	$( "#firstnamec" ).rules( "add", "email" );
	assert.deepEqual( $( "#firstnamec" ).rules(), { required: true, email: true } );

	$( "#firstnamec" ).rules( "remove", "required" );
	assert.deepEqual( $( "#firstnamec" ).rules(), { email: true } );

	assert.deepEqual( $( "#firstnamec" ).rules( "remove" ), { email: true } );
	assert.deepEqual( $( "#firstnamec" ).rules(), {} );

	$( "#firstnamec" ).rules( "add", "required email" );
	assert.deepEqual( $( "#firstnamec" ).rules(), { required: true, email: true } );

	assert.deepEqual( $( "#lastnamec" ).rules(), {} );
	$( "#lastnamec" ).rules( "add", "required" );
	$( "#lastnamec" ).rules( "add", {
		minlength: 2
	} );
	assert.deepEqual( $( "#lastnamec" ).rules(), { required: true, minlength: 2 } );

	var removedRules = $( "#lastnamec" ).rules( "remove", "required email" );
	assert.deepEqual( $( "#lastnamec" ).rules(), { minlength: 2 } );
	$( "#lastnamec" ).rules( "add", removedRules );
	assert.deepEqual( $( "#lastnamec" ).rules(), { required: true, minlength: 2 } );
} );

QUnit.test( "rules(), add messages", function( assert ) {
	$( "#firstnamec" ).attr( "title", null );
	var v = $( "#testForm1clean" ).validate( {
		rules: {
			firstnamec: "required"
		}
	} );
	$( "#testForm1clean" ).valid();
	$( "#firstnamec" ).valid();
	assert.deepEqual( v.settings.messages.firstname, undefined );

	$( "#firstnamec" ).rules( "add", {
		messages: {
			required: "required"
		}
	} );

	$( "#firstnamec" ).valid();
	assert.deepEqual( v.errorList[ 0 ] && v.errorList[ 0 ].message, "required" );

	$( "#firstnamec" ).val( "test" );
	$( "#firstnamec" ).valid();
	assert.equal( v.errorList.length, 0 );
} );

QUnit.test( "rules(), rangelength attribute as array", function( assert ) {
	$( "#testForm13" ).validate();
	assert.deepEqual( $( "#cars-select" ).rules(), {
		required: true,
		rangelength: [ 2, 3 ]
	} );
} );

QUnit.test( "rules(), global/local normalizer", function( assert ) {
	var username = $( "#usernamec" ),
		urlc = $( "#urlc" ),
		lastname = $( "#lastnamec" ),
		v;

	username.val( "\t\t \r" );
	urlc.val( "" );

	v = $( "#testForm1clean" ).validate( {

		// Using the normalizer to trim the value of all elements before validating them.
		normalizer: function( value ) {

			// This normalizer should only be called for the username element, and nothing else.
			assert.notEqual( this, urlc[ 0 ], "This normalizer should not be called for urlc element." );
			assert.equal( this, username[ 0 ], "`this` in this normalizer should be the username element." );

			// Trim the value of the input
			return $.trim( value );
		},

		rules: {
			username: {
				required: true
			},
			urlc: {
				required: true,
				url: true,

				// Using the normalizer to append https:// if it's not
				// present on the input value
				normalizer: function( value ) {
					assert.equal( this, urlc[ 0 ], "`this` in the normalizer should be the urlc element." );

					var url = value;

					// Check if it doesn't start with http:// or https:// or ftp://
					if ( url && url.substr( 0, 7 ) !== "http://" &&
						url.substr( 0, 8 ) !== "https://" &&
						url.substr( 0, 6 ) !== "ftp://" ) {

						// Then prefix with http:// or even https://
						url = "https://" + url;
					}

					// Return the new url
					return url;
				}
			},
			lastname: {
				required: true,
				normalizer: function() {
					assert.equal( this, lastname[ 0 ], "`this` in the normalizer should be the lastname element." );

					// The normalizer can return any value
					return null;
				}
			}
		}
	} );

	// Validate only the username and the url elements.
	username.valid();
	assert.equal( v.invalidElements().filter( username )[ 0 ], username[ 0 ], "The username should be invalid" );

	urlc.valid();
	assert.equal( v.invalidElements().filter( urlc )[ 0 ], urlc[ 0 ], "The url should be invalid" );

	assert.equal( v.numberOfInvalids(), 2, "There is two invalid elements" );

	username.val( "something" );
	urlc.val( "google.com" );

	username.trigger( "keyup" );
	urlc.trigger( "keyup" );

	lastname.valid();

	assert.equal( v.numberOfInvalids(), 1, "Only one element is invalid" );
	assert.equal( v.size(), 1, "Only one element is invalid" );
} );

QUnit.test( "rules() - on unexpected input", function( assert ) {
	var emptySet = $( "#firstname .mynonexistantclass" ),
		nonFormElement = $( "div#foo" ),
		result;

	result = emptySet.rules( "add", "whatever" );
	assert.deepEqual( result, undefined, "can work on an empty set without a js error" );

	result = nonFormElement.rules( "add", "whatever" );
	assert.deepEqual( result, undefined, "can work on a non-form element" );
} );

QUnit.test( "required method should return false for undefined & null values", function( assert ) {
	var username = $( "#usernamec" ),
		urlc = $( "#urlc" ),
		v = $( "#testForm1clean" ).validate( {
			rules: {
				username: {
					required: true,
					normalizer: function() { return null; }
				},
				urlc: {
					required: true,
					normalizer: function() { return undefined; }
				}
			}
		} );

	assert.notOk( v.element( username ), "The username element should be invalid" );
	assert.notOk( v.element( urlc ), "The urlc element should be invalid" );
} );
