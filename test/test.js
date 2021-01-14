if ( window.sessionStorage ) {
	sessionStorage.clear();
}
jQuery.validator.defaults.debug = true;
$.mockjaxSettings.log = $.noop;

$.mockjax( {
	url: "form.php?user=Peter&password=foobar",
	responseText: "Hi Peter, welcome back.",
	responseStatus: 200,
	responseTime: 1
} );

$.mockjax( {
	url: "users.php",
	data: {
		username: /Peter2?|asdf/
	},
	responseText: "false",
	responseStatus: 200,
	responseTime: 1
} );

$.mockjax( {
	url: "users2.php",
	data: {
		username: "asdf"
	},
	responseText: "\"asdf is already taken, please try something else\"",
	responseStatus: 200,
	responseTime: 1
} );

$.mockjax( {
	url: "echo.php",
	response: function( data ) {
		this.responseText = JSON.stringify( data.data );
	},
	responseTime: 100
} );

$.mockjax( {
	url: "response.php",
	response: function( settings ) {
		var responseText = settings.data.responseText;
		if ( responseText ) {
			if ( typeof responseText === "function" ) {
				this.responseText = responseText();
			} else {
				this.responseText = responseText;
			}
		} else {
			this.responseText = "";
		}
		this.responseStatus = settings.data.responseStatus || 200;
		this.responseTime = settings.data.responseTime || 100;
	}
} );

$.mockjax( {
	url: "issue1508.php",
	response: function( settings ) {
		if ( /abc/i.test( settings.data.val2 ) ) {
			this.responseText = "false";
		} else {
			this.responseText = "true";
		}
	},
	responseStatus: 200,
	responseTime: 1
} );

$.mockjax( {
	url: "workemail.php",
	response: function( data ) {
		this.responseStatus = data.data.special === "somevalue" ? 200 : 400; //Requires special param for request
		if ( this.responseStatus === 200 ) { //Only if valid request - processing workemail
			this.responseText = JSON.stringify( data.data.email === "john.doe@company.com" );
		}
	}
} );

$.mockjax( {
    url: "stop-request-submit-form.php",
    response: function() {
        $( "input[name='username']" ).val( "foobar" ); // Simulate input data changing before request finishes.
        this.responseText = "true"; // Data is valid.
    },
    responseTime: 1
} );

// Asserts that there is a visible error with the given text for the specified element
QUnit.assert.hasError = function( element, text, message ) {
	var errors = $( element ).closest( "form" ).validate().errorsFor( element[ 0 ] ),
		actual = ( errors.length === 1 && errors.is( ":visible" ) ) ? errors.text() : "";
	this.pushResult( {
		result: actual, actual: actual, expected: text, message: message
	} );
};

// Asserts that there is no visible error for the given element
QUnit.assert.noErrorFor = function( element, message ) {
	var errors = $( element ).closest( "form" ).validate().errorsFor( element[ 0 ] ),
		hidden = ( errors.length === 0 ) || ( errors.is( ":hidden" ) && ( errors.text() === "" ) );
	this.pushResult( {
		result: hidden, actual: hidden, expected: true, message: message
	} );
};

QUnit.module( "validator" );

QUnit.test( "Constructor", function( assert ) {
	var v1 = $( "#testForm1" ).validate(),
		v2 = $( "#testForm1" ).validate();

	assert.equal( v1, v2, "Calling validate() multiple times must return the same validator instance" );
	assert.equal( v1.elements().length, 3, "validator elements" );
} );

QUnit.test( "validate() without elements, with non-form elements", function( assert ) {
	assert.expect( 0 );
	$( "#doesntexist" ).validate();
} );

QUnit.test( "valid() plugin method", function( assert ) {
	var form = $( "#userForm" ),
		input = $( "#username" );

	form.validate();
	assert.ok( !form.valid(), "Form isn't valid yet" );
	assert.ok( !input.valid(), "Input isn't valid either" );

	input.val( "Hello world" );
	assert.ok( form.valid(), "Form is now valid" );
	assert.ok( input.valid(), "Input is valid, too" );
} );

QUnit.test( "valid() plugin method, multiple inputs", function( assert ) {
	var form = $( "#testForm1" ),
		validator = form.validate(),
		inputs = form.find( "input" );

	assert.ok( !inputs.valid(), "all invalid" );
	inputs.not( ":first" ).val( "ok" );
	assert.equal( validator.numberOfInvalids(), 2 );
	assert.strictEqual( inputs.valid(), false, "just one invalid" );
	inputs.val( "ok" );
	assert.strictEqual( inputs.valid(), true, "all valid" );
} );

QUnit.test( "valid() plugin method, special handling for checkable groups", function( assert ) {

	// Rule is defined on first checkbox, must apply to others, too
	var checkable = $( "#checkable2" );
	assert.ok( !checkable.valid(), "must be invalid, not checked yet" );
	checkable.attr( "checked", true );
	assert.ok( checkable.valid(), "valid, is now checked" );
	checkable.attr( "checked", false );
	assert.ok( !checkable.valid(), "invalid again" );
	$( "#checkable3" ).attr( "checked", true );
	assert.ok( checkable.valid(), "valid, third box is checked" );
} );

QUnit.test( "valid() ???", function( assert ) {
	assert.expect( 4 );
	var errorList = [
			{
				name: "meal",
				message: "foo",
				element: $( "#meal" )[ 0 ]
			}
		],
		v = $( "#testForm3" ).validate();

	assert.ok( v.valid(), "No errors, must be valid" );
	v.errorList = errorList;
	assert.ok( !v.valid(), "One error, must be invalid" );
	v.destroy();
	v = $( "#testForm3" ).validate();
	assert.ok( v.valid(), "No errors, must be valid and returning true" );
	v.errorList = errorList;
	assert.ok( !v.valid(), "One error, must be invalid" );
} );

QUnit.test( "valid(), ignores ignored elements", function( assert ) {
	$( "#testForm1clean" ).validate( {
		ignore: "#firstnamec",
		rules: {
			firstnamec: "required"
		}
	} );
	assert.ok( $( "#firstnamec" ).valid() );
} );

QUnit.test( "valid() should ignore elements that belong to other/nested forms", function( assert ) {
	var form = $( "#testForm28" );

	form.validate();

	// 1. Test with nested form
	form.append(
		"<form id='testForm28-nested'>" +
		"    <input type='text' name='f28nestedinput' required>" +
		"</form>"
	);

	try {
		form.valid();
		assert.ok( true, "It should ignore the input of nested form" );
	} catch ( err ) {
		assert.ok( false, "Shouldn't throw an error" );
	}

	// Remove the validator attached to testForm28
	form.removeData( "validator" );
	$( "#testForm28-nested" ).remove();

	// 2. Test using another form outside of validated one
	form.parent().append(
		"<form id='testForm28-other'>" +
		"   <input type='text' name='f28otherinput' required>" +
		"   <input type='text' name='f28input' form='testForm28' required>" +
		"</form>"
	);

	$( "#testForm28-other" ).validate();

	try {
		$( "#testForm28-other" ).valid();
		assert.ok( true, "It should ignore the input of other form" );
	} catch ( err ) {
		assert.ok( false, "Shouldn't throw an error" );
	}

	$( "#testForm28-other" ).remove();
} );

QUnit.test( "form() should ignore elements that belong to other/nested forms", function( assert ) {
	var form = $( "#testForm28" );
	var v = form.validate();

	form.validate();

	// 1. Test with nested form
	form.append(
		"<form id='testForm28-nested'>" +
		"    <input type='text' name='f28nestedinput' required>" +
		"</form>"
	);

	try {
		v.form();
		assert.ok( true, "It should ignore the input of nested form" );
	} catch ( err ) {
		assert.ok( false, "Shouldn't throw an error" );
	}

	// Remove the validator attached to testForm28
	form.removeData( "validator" );
	$( "#testForm28-nested" ).remove();

	// 2. Test using another form outside of validated one
	form.parent().append(
		"<form id='testForm28-other'>" +
		"   <input type='text' name='f28otherinput' required>" +
		"   <input type='text' name='f28input' form='testForm28' required>" +
		"</form>"
	);

	v = $( "#testForm28-other" ).validate();

	try {
		v.form();
		assert.ok( true, "It should ignore the input of other form" );
	} catch ( err ) {
		assert.ok( false, "Shouldn't throw an error" );
	}

	$( "#testForm28-other" ).remove();
} );

QUnit.test( "elements() should ignore elements that belong to other/nested forms", function( assert ) {
	var form = $( "#testForm28" );
	var v = form.validate();

	// 1. Test with nested form
	form.append(
		"<form id='testForm28-nested'>" +
		"    <input type='text' name='f28nestedinput' required>" +
		"</form>"
	);

	try {
		assert.equal( v.elements().length, 1, "There should be only one element to validate" );
	} catch ( err ) {
		assert.ok( false, "Shouldn't throw an error" );
	}

	// Remove the validator attached to testForm28
	form.removeData( "validator" );
	$( "#testForm28-nested" ).remove();

	// 2. Test using another form outside of validated one
	form.parent().append(
		"<form id='testForm28-other'>" +
		"   <input type='text' name='f28otherinput' required>" +
		"   <input type='text' name='f28input' form='testForm28' required>" +
		"</form>"
	);

	v = $( "#testForm28-other" ).validate();

	try {
		assert.equal( v.elements().length, 1, "There should be only one element to validate" );
	} catch ( err ) {
		assert.ok( false, "Shouldn't throw an error" );
	}

	$( "#testForm28-other" ).remove();
} );

QUnit.test( "Ignore elements that have form attribute set to other forms", function( assert ) {

	// Append a form that contains an input with form attribute set to "testForm28"
	$( "#testForm28" ).parent().append(
		"<form id='testForm28-other'>" +
		"   <input type='text' name='f28otherinput' required>" +
		"   <input type='text' name='f28input' form='testForm28' required>" +
		"</form>"
	);

	// Attach the plugin to the appended form
	$( "#testForm28-other" ).validate();

	// 1. Simulate typing
	try {
		$( "[name='f28input']", "#testForm28-other" ).trigger( "keyup" );
		assert.ok( true, "It should ignore the input of other form" );
	} catch ( err ) {
		assert.ok( false, "Shouldn't throw an error while typing" );
	}

	// 2. Simulate forcussing in the input
	try {
		$( "[name='f28input']", "#testForm28-other" ).trigger( "focusin" );
		assert.ok( true, "It should ignore the input of other form" );
	} catch ( err ) {
		assert.ok( false, "Shouldn't throw an error on focus" );
	}

	// 3. Simulate focussing out the input
	try {
		$( "[name='f28input']", "#testForm28-other" ).trigger( "focusout" );
		assert.ok( true, "It should ignore the input of other form" );
	} catch ( err ) {
		assert.ok( false, "Shouldn't throw an error on blur" );
	}

	$( "#testForm28-other" ).remove();
} );

QUnit.test( "addMethod", function( assert ) {
	assert.expect( 3 );
	$.validator.addMethod( "hi", function( value ) {
		return value === "hi";
	}, "hi me too" );
	var method = $.validator.methods.hi,
		e = $( "#text1" )[ 0 ];
	assert.ok( !method( e.value, e ), "Invalid" );
	e.value = "hi";
	assert.ok( method( e.value, e ), "Invalid" );
	assert.ok( jQuery.validator.messages.hi === "hi me too", "Check custom message" );
} );

QUnit.test( "addMethod2", function( assert ) {
	assert.expect( 4 );
	$.validator.addMethod( "complicatedPassword", function( value, element ) {
		return this.optional( element ) || /\D/.test( value ) && /\d/.test( value );
	}, "Your password must contain at least one number and one letter" );
	var v = jQuery( "#form" ).validate( {
			rules: {
				action: { complicatedPassword: true }
			}
		} ),
		e = $( "#text1" )[ 0 ];

	e.value = "";
	assert.strictEqual( v.element( e ), true, "Rule is optional, valid" );
	assert.equal( v.size(), 0 );
	e.value = "ko";
	assert.ok( !v.element( e ), "Invalid, doesn't contain one of the required characters" );
	e.value = "ko1";
	assert.ok( v.element( e ) );
} );

QUnit.test( "form(): simple", function( assert ) {
	assert.expect( 2 );
	var form = $( "#testForm1" )[ 0 ],
		v = $( form ).validate();

	assert.ok( !v.form(), "Invalid form" );
	$( "#firstname" ).val( "hi" );
	$( "#lastname" ).val( "hi" );
	assert.ok( v.form(), "Valid form" );
} );

QUnit.test( "form(): checkboxes: min/required", function( assert ) {
	assert.expect( 3 );
	var form = $( "#testForm6" )[ 0 ],
		v = $( form ).validate();

	assert.ok( !v.form(), "Invalid form" );
	$( "#form6check1" ).attr( "checked", true );
	assert.ok( !v.form(), "Invalid form" );
	$( "#form6check2" ).attr( "checked", true );
	assert.ok( v.form(), "Valid form" );
} );

QUnit.test( "form(): radio buttons: required", function( assert ) {
	assert.expect( 6 );
	var form = $( "#testForm10" )[ 0 ],
		v = $( form ).validate( {
			rules: {
				testForm10Radio: "required"
			}
		} );

	assert.ok( !v.form(), "Invalid Form" );
	assert.equal( $( "#testForm10Radio1" ).attr( "class" ), "error" );
	assert.equal( $( "#testForm10Radio2" ).attr( "class" ), "error" );

	$( "#testForm10Radio2" ).attr( "checked", true );
	assert.ok( v.form(), "Valid form" );

	assert.equal( $( "#testForm10Radio1" ).attr( "class" ), "valid" );
	assert.equal( $( "#testForm10Radio2" ).attr( "class" ), "valid" );
} );

QUnit.test( "form(): selects: min/required", function( assert ) {
	assert.expect( 3 );
	var form = $( "#testForm7" )[ 0 ],
		v = $( form ).validate();

	assert.ok( !v.form(), "Invalid form" );
	$( "#optionxa" ).attr( "selected", true );
	assert.ok( !v.form(), "Invalid form" );
	$( "#optionxb" ).attr( "selected", true );
	assert.ok( v.form(), "Valid form" );
} );

QUnit.test( "form(): with equalTo", function( assert ) {
	assert.expect( 2 );
	var form = $( "#testForm5" )[ 0 ],
		v = $( form ).validate();

	assert.ok( !v.form(), "Invalid form" );
	$( "#x1, #x2" ).val( "hi" );
	assert.ok( v.form(), "Valid form" );
} );

QUnit.test( "form(): with equalTo and onfocusout=false", function( assert ) {
	assert.expect( 4 );
	var form = $( "#testForm5" )[ 0 ],
		v = $( form ).validate( {
			onfocusout: false,
			showErrors: function() {
				assert.ok( true, "showErrors should only be called twice" );
				this.defaultShowErrors();
			}
		} );

	$( "#x1, #x2" ).val( "hi" );
	assert.ok( v.form(), "Valid form" );
	$( "#x2" ).val( "not equal" ).blur();
	assert.ok( !v.form(), "Invalid form" );
} );

QUnit.test( "check(): simple", function( assert ) {
	assert.expect( 3 );
	var element = $( "#firstname" )[ 0 ],
		v = $( "#testForm1" ).validate();

	assert.ok( v.size() === 0, "No errors yet" );
	v.check( element );
	assert.ok( v.size() === 1, "error exists" );
	v.errorList = [];
	$( "#firstname" ).val( "hi" );
	v.check( element );
	assert.ok( v.size() === 0, "No more errors" );
} );

QUnit.test( "numberOfInvalids(): count invalid fields with empty message", function( assert ) {
	assert.expect( 2 );

	var v = $( "#testForm23" ).validate( {
		rules: {
			box1: {
				required: true
			},
			box2: {
				required: true
			}
		}
	} );

	var requiredMsg = $.validator.messages.required;
	$.validator.messages.required = "";

	v.form();

	assert.equal( v.errorList.length, 2, "The form has two errors" );
	assert.equal( v.numberOfInvalids(), 2, "The form has two errors" );

	$.validator.messages.required = requiredMsg;
} );

QUnit.test( "hide(): input", function( assert ) {
	assert.expect( 3 );
	var errorLabel = $( "#errorFirstname" ),
		element = $( "#firstname" )[ 0 ],
		v;

	element.value = "bla";
	v = $( "#testForm1" ).validate();
	errorLabel.show();

	assert.ok( errorLabel.is( ":visible" ), "Error label visible before validation" );
	assert.ok( v.element( element ) );
	assert.ok( errorLabel.is( ":hidden" ), "Error label not visible after validation" );
} );

QUnit.test( "hide(): radio", function( assert ) {
	assert.expect( 2 );
	var errorLabel = $( "#agreeLabel" ),
		element = $( "#agb" )[ 0 ],
		v;

	element.checked = true;
	v = $( "#testForm2" ).validate( { errorClass: "xerror" } );
	errorLabel.show();

	assert.ok( errorLabel.is( ":visible" ), "Error label visible after validation" );
	v.element( element );
	assert.ok( errorLabel.is( ":hidden" ), "Error label not visible after hiding it" );
} );

QUnit.test( "hide(): errorWrapper", function( assert ) {
	assert.expect( 2 );
	var errorLabel = $( "#errorWrapper" ),
		element = $( "#meal" )[ 0 ],
		v;

	element.selectedIndex = 1;
	errorLabel.show();

	assert.ok( errorLabel.is( ":visible" ), "Error label visible after validation" );
	v = $( "#testForm3" ).validate( { wrapper: "li", errorLabelContainer: $( "#errorContainer" ) } );
	v.element( element );
	assert.ok( errorLabel.is( ":hidden" ), "Error label not visible after hiding it" );
} );

QUnit.test( "hide(): container", function( assert ) {
	assert.expect( 4 );
	var errorLabel = $( "#errorContainer" ),
		v = $( "#testForm3" ).validate( { errorWrapper: "li", errorContainer: $( "#errorContainer" ) } );

	v.form();
	assert.ok( errorLabel.is( ":visible" ), "Error label visible after validation" );
	$( "#meal" )[ 0 ].selectedIndex = 1;
	v.form();
	assert.ok( errorLabel.is( ":hidden" ), "Error label not visible after hiding it" );
	$( "#meal" )[ 0 ].selectedIndex = -1;
	v.element( "#meal" );
	assert.ok( errorLabel.is( ":visible" ), "Error label visible after validation" );
	$( "#meal" )[ 0 ].selectedIndex = 1;
	v.element( "#meal" );
	assert.ok( errorLabel.is( ":hidden" ), "Error label not visible after hiding it" );
} );

QUnit.test( "submitHandler keeps submitting button", function( assert ) {
	var button, event;

	$( "#userForm" ).validate( {
		debug: false,
		submitHandler: function( form ) {

			var hidden = $( form ).find( "input:hidden" )[ 0 ];
			assert.deepEqual( hidden.value, button.value );
			assert.deepEqual( hidden.name, button.name );

			return false;
		}
	} );
	$( "#username" ).val( "bla" );
	button = $( "#userForm :submit" )[ 0 ];
	event = $.Event( "click" );
	event.preventDefault();
	$.event.trigger( event, null, button );
	$( "#userForm" ).submit();
} );

QUnit.test( "submitHandler keeps submitting button, even if descendants are clicked", function( assert ) {
	var button = $( "#testForm27 :submit" )[ 0 ];
	var v = $( "#testForm27" ).validate( {
		debug: false,
		submitHandler: function( form ) {

			// Compare the button with the `submitButton` property
			assert.deepEqual(
				v.submitButton, button, "The submitButton property should be the same as button"
			);

			var hidden = $( form ).find( "input:hidden" )[ 0 ];
			assert.deepEqual( hidden.value, button.value );
			assert.deepEqual( hidden.name, button.name );

			return false;
		}
	} );

	$( "#testForm27 [name=\"year\"]" ).val( "2016" );

	$( button ).find( "span" ).click();
} );

QUnit.test( "handle() should ensure the value of the used submit button is passed on for scripted submit triggered by stopRequest()", function( assert ) {
	var $form = $( "#userForm" );
	var button = $( ":submit", $form )[ 0 ];
	var done = assert.async();
	var v = $form.validate( {
		debug: true,
		rules: {
			username: {
				remote: {
					url: "issue1508.php"
				}
			}
		}
	} );
	var i = 1;

	// Register a `submit` event after the one registred by this plugin
	$form.on( "submit", function() {

		// Ignoring the first submit that was triggered manually by clicking
		// the submit button. The first submit will be aborted by this plugin
		// in order to wait for `remote` method to finish validating the input
		if ( i > 0 ) {
			i--;
			return false;
		}

		// The second submit is the one triggered by `stopRequest()` after the
		// `remote` method has finished processing its attached input.

		// Compare the button with the `submitButton` property
		assert.deepEqual(
			v.submitButton, button, "The submitButton property should be the same as button"
		);

		var hidden = $form.find( "input:hidden" )[ 0 ];
		assert.deepEqual( hidden.value, button.value );
		assert.deepEqual( hidden.name, button.name );

		done();

		return false;
	} );

	$( "input[name='username']", $form ).val( "something" );

	// Submit the form
	$( button ).click();
} );

QUnit.test( "validation triggered on radio/checkbox when using keyboard", function( assert ) {
    assert.expect( 1 );
	var input, i, events, triggeredEvents = 0,
		done = assert.async();

	$( "#form" ).validate( {
		onfocusin: function() {
			triggeredEvents++;
		},
		onfocusout: function() {
			triggeredEvents++;
		},
		onkeyup: function() {
			triggeredEvents++;
		}
	} );

	events = [
		$.Event( "focusin" ),
		$.Event( "focusout" ),
		$.Event( "keyup" )
	];

	input = $( "#form :radio:first" );
	for ( i = 0; i < events.length; i++ ) {
		input.trigger( events[ i ] );
	}

	input = $( "#form :checkbox:first" );
	for ( i = 0; i < events.length; i++ ) {
		input.trigger( events[ i ] );
	}

	setTimeout( function() {

		// Assert all event handlers fired
		assert.equal( triggeredEvents, 6 );
		done();
	} );
} );

QUnit.test( "validation triggered on button", function( assert ) {
	assert.expect( 1 );
	var input, i, events, triggeredEvents = 0,
		done = assert.async();

	$( "#form" ).validate( {
		onfocusin: function() {
			triggeredEvents++;
		},
		onfocusout: function() {
			triggeredEvents++;
		},
		onkeyup: function() {
			triggeredEvents++;
		}
	} );

	events = [
		$.Event( "focusin" ),
		$.Event( "focusout" ),
		$.Event( "keyup" )
	];

	input = $( "#form :button" );
	for ( i = 0; i < events.length; i++ ) {
		input.trigger( events[ i ] );
	}

	setTimeout( function() {

		// Assert all event handlers fired
		assert.equal( triggeredEvents, 6 );
		done();
	} );
} );

QUnit.test( "validation triggered on radio/checkbox when using mouseclick", function( assert ) {
    assert.expect( 1 );
	var input, i, events, triggeredEvents = 0,
		done = assert.async();

	$( "#form" ).validate( {
		onclick: function() {
			triggeredEvents++;
		}
	} );

	events = [
		$.Event( "click" )
	];

	input = $( "#form :radio:first" );
	for ( i = 0; i < events.length; i++ ) {
		input.trigger( events[ i ] );
	}

	input = $( "#form :checkbox:first" );
	for ( i = 0; i < events.length; i++ ) {
		input.trigger( events[ i ] );
	}

	setTimeout( function() {

		// Assert all event handlers fired
		assert.equal( triggeredEvents, 2 );
		done();
	} );
} );

QUnit.test( "showErrors()", function( assert ) {
	assert.expect( 4 );
	var errorLabel = $( "#errorFirstname" ).hide(),
		v = $( "#testForm1" ).validate();

	assert.ok( errorLabel.is( ":hidden" ) );
	assert.equal( $( "#lastname" ).next( ".error:not(input)" ).length, 0 );
	v.showErrors( { "firstname": "required", "lastname": "bla" } );
	assert.equal( errorLabel.is( ":visible" ), true );
	assert.equal( $( "#lastname" ).next( ".error:not(input)" ).is( ":visible" ), true );
} );

QUnit.test( "showErrors(), allow empty string and null as default message", function( assert ) {
	$( "#userForm" ).validate( {
		rules: {
			username: {
				required: true,
				minlength: 3
			}
		},
		messages: {
			username: {
				required: "",
				minlength: "too short"
			}
		}
	} );
	assert.ok( !$( "#username" ).valid() );
	assert.equal( $( "#username" ).next( ".error:not(input)" ).text(), "" );

	$( "#username" ).val( "ab" );
	assert.ok( !$( "#username" ).valid() );
	assert.equal( $( "#username" ).next( ".error:not(input)" ).text(), "too short" );

	$( "#username" ).val( "abc" );
	assert.ok( $( "#username" ).valid() );
	assert.ok( $( "#username" ).next( ".error:not(input)" ).is( ":hidden" ) );
} );

QUnit.test( "showErrors() - external messages", function( assert ) {
	assert.expect( 4 );
	var methods = $.extend( {}, $.validator.methods ),
		messages = $.extend( {}, $.validator.messages ),
		form, v;

	$.validator.addMethod( "foo", function() { return false; } );
	$.validator.addMethod( "bar", function() { return false; } );
	assert.equal( $( "#testForm4 #f1" ).next( ".error:not(input)" ).length, 0 );
	assert.equal( $( "#testForm4 #f2" ).next( ".error:not(input)" ).length, 0 );

	form = $( "#testForm4" )[ 0 ];
	v = $( form ).validate( {
		messages: {
			f1: "Please!",
			f2: "Wohoo!"
		}
	} );
	v.form();
	assert.equal( $( "#testForm4 #f1" ).next( ".error:not(input)" ).text(), "Please!" );
	assert.equal( $( "#testForm4 #f2" ).next( ".error:not(input)" ).text(), "Wohoo!" );

	$.validator.methods = methods;
	$.validator.messages = messages;
} );

QUnit.test( "showErrors() - custom handler", function( assert ) {
	assert.expect( 5 );
	var v = $( "#testForm1" ).validate( {
		showErrors: function( errorMap, errorList ) {
			assert.equal( v, this );
			assert.equal( v.errorList, errorList );
			assert.equal( v.errorMap, errorMap );
			assert.equal( errorMap.firstname, "buga" );
			assert.equal( errorMap.lastname, "buga" );
		}
	} );
	v.form();
} );

QUnit.test( "option: (un)highlight, default", function( assert ) {
	$( "#testForm1" ).validate();
	var e = $( "#firstname" );
	assert.ok( !e.hasClass( "error" ) );
	assert.ok( !e.hasClass( "valid" ) );
	e.valid();
	assert.ok( e.hasClass( "error" ) );
	assert.ok( !e.hasClass( "valid" ) );
	e.val( "hithere" ).valid();
	assert.ok( !e.hasClass( "error" ) );
	assert.ok( e.hasClass( "valid" ) );
} );

QUnit.test( "option: (un)highlight, nothing", function( assert ) {
	assert.expect( 3 );
	$( "#testForm1" ).validate( {
		highlight: false,
		unhighlight: false
	} );
	var e = $( "#firstname" );
	assert.ok( !e.hasClass( "error" ) );
	e.valid();
	assert.ok( !e.hasClass( "error" ) );
	e.valid();
	assert.ok( !e.hasClass( "error" ) );
} );

QUnit.test( "option: (un)highlight, custom", function( assert ) {
	assert.expect( 5 );
	$( "#testForm1clean" ).validate( {
		highlight: function( element, errorClass ) {
			assert.equal( errorClass, "invalid" );
			$( element ).hide();
		},
		unhighlight: function( element, errorClass ) {
			assert.equal( errorClass, "invalid" );
			$( element ).show();
		},
		ignore: "",
		errorClass: "invalid",
		rules: {
			firstnamec: "required"
		}
	} );
	var e = $( "#firstnamec" );
	assert.ok( e.is( ":visible" ) );
	e.valid();
	assert.ok( !e.is( ":visible" ) );
	e.val( "hithere" ).valid();
	assert.ok( e.is( ":visible" ) );
} );

QUnit.test( "option: (un)highlight, custom2", function( assert ) {
	assert.expect( 6 );
	var e, l;
	$( "#testForm1" ).validate( {
		highlight: function( element, errorClass ) {
			$( element ).addClass( errorClass );
			$( element ).next( ".error:not(input)" ).addClass( errorClass );
		},
		unhighlight: function( element, errorClass ) {
			$( element ).removeClass( errorClass );
			$( element ).next( ".error:not(input)" ).removeClass( errorClass );
		},
		errorClass: "invalid"
	} );

	e = $( "#firstname" );
	l = $( "#errorFirstname" );

	assert.ok( !e.is( ".invalid" ) );
	assert.ok( !l.is( ".invalid" ) );
	e.valid();
	assert.ok( e.is( ".invalid" ) );
	assert.ok( l.is( ".invalid" ) );
	e.val( "hithere" ).valid();
	assert.ok( !e.is( ".invalid" ) );
	assert.ok( !l.is( ".invalid" ) );
} );

QUnit.test( "option: errorPlacement", function( assert ) {
	assert.expect( 1 );
	var v = $( "#testForm1" ).validate( {
		errorPlacement: function() {
			assert.strictEqual( this, v, "'this' inside errorPlacement should be the plugin instance" );
		}
	} );

	v.form();
} );

QUnit.test( "option: focusCleanup default false", function( assert ) {
	var form = $( "#userForm" );
	form.validate();
	form.valid();
	assert.ok( form.find( "#username" ).next( ".error:not(input)" ).is( ":visible" ) );
	$( "#username" ).focus();
	assert.ok( form.find( "#username" ).next( ".error:not(input)" ).is( ":visible" ) );
} );

QUnit.test( "option: focusCleanup true", function( assert ) {
	var form = $( "#userForm" );
	form.validate( {
		focusCleanup: true
	} );
	form.valid();
	assert.ok( form.find( "#username" ).next( ".error:not(input)" ).is( ":visible" ) );
	$( "#username" ).focus().trigger( "focusin" );
	assert.ok( !form.find( "#username" ).next( ".error:not(input)" ).is( ":visible" ) );
} );

QUnit.test( "option: focusCleanup with wrapper", function( assert ) {
	var form = $( "#userForm" );
	form.validate( {
		focusCleanup: true,
		wrapper: "span"
	} );
	form.valid();
	assert.ok( form.is( ":has(span:visible:has(.error#username-error))" ) );
	$( "#username" ).focus().trigger( "focusin" );
	assert.ok( !form.is( ":has(span:visible:has(.error#username-error))" ) );
} );

QUnit.test( "option: errorClass with multiple classes", function( assert ) {
	var form = $( "#userForm" );
	form.validate( {
		focusCleanup: true,
		wrapper: "span",
		errorClass: "error error1 error2"
	} );
	form.valid();
	assert.ok( form.is( ":has(span:visible:has(.error#username-error))" ) );
	assert.ok( form.is( ":has(span:visible:has(.error1#username-error))" ) );
	assert.ok( form.is( ":has(span:visible:has(.error2#username-error))" ) );
	$( "#username" ).focus().trigger( "focusin" );
	assert.ok( !form.is( ":has(span:visible:has(.error#username-error))" ) );
	assert.ok( !form.is( ":has(span:visible:has(.error1#username-error))" ) );
	assert.ok( !form.is( ":has(span:visible:has(.error2#username-error))" ) );
} );

QUnit.test( "defaultMessage(), empty title is ignored", function( assert ) {
	var v = $( "#userForm" ).validate();
	assert.equal( v.defaultMessage( $( "#username" )[ 0 ], { method: "required", parameters: true } ), "This field is required." );

	// Using the old way when we pass the name of a method as the second parameters.
	assert.equal( v.defaultMessage( $( "#username" )[ 0 ], "required" ), "This field is required." );
} );

QUnit.test( "previousValue()", function( assert ) {
	assert.expect( 2 );

	var e = $( "#username" ),
		v = $( "#userForm" ).validate(),
		expectedRemote = {
			old: null,
			valid: true,
			message: "Please fix this field."
		}, expectedRequired = {
			old: null,
			valid: true,
			message: "This field is required."
		};

	assert.deepEqual( v.previousValue( e[ 0 ] ), expectedRemote, "should be the same" );

	e.removeData( "previousValue" );
	assert.deepEqual( v.previousValue( e[ 0 ], "required" ), expectedRequired, "should be the same" );
} );

QUnit.test( "#741: move message processing from formatAndAdd to defaultMessage", function( assert ) {
	var v = $( "#testForm22" ).validate();
	assert.equal( v.defaultMessage( $( "#tF22Input" )[ 0 ], { method: "minlength", parameters: 5 } ),
		"You should enter at least 5 characters.", "defaultMessage() now format the messages" );

	$( "#tF22Input" ).val( "abc" );
	v.form();
	assert.equal( v.errorList[ 0 ].message, "You should enter at least 5 characters." );
} );

QUnit.test( "formatAndAdd", function( assert ) {
	assert.expect( 4 );
	var v = $( "#form" ).validate(),
		fakeElement = { form: $( "#form" )[ 0 ], name: "bar" };

	v.formatAndAdd( fakeElement, { method: "maxlength", parameters: 2 } );
	assert.equal( v.errorList[ 0 ].message, "Please enter no more than 2 characters." );
	assert.equal( v.errorList[ 0 ].element.name, "bar" );

	v.formatAndAdd( fakeElement, { method: "range", parameters: [ 2, 4 ] } );
	assert.equal( v.errorList[ 1 ].message, "Please enter a value between 2 and 4." );

	v.formatAndAdd( fakeElement, { method: "range", parameters: [ 0, 4 ] } );
	assert.equal( v.errorList[ 2 ].message, "Please enter a value between 0 and 4." );
} );

QUnit.test( "formatAndAdd2", function( assert ) {
	assert.expect( 3 );
	var v = $( "#form" ).validate(),
		fakeElement = { form: $( "#form" )[ 0 ], name: "bar" };

	jQuery.validator.messages.test1 = function( param, element ) {
		assert.equal( this, v );
		assert.equal( param, 0 );
		return "element " + element.name + " is not valid";
	};
	v.formatAndAdd( fakeElement, { method: "test1", parameters: 0 } );
	assert.equal( v.errorList[ 0 ].message, "element bar is not valid" );
} );

QUnit.test( "formatAndAdd, auto detect substitution string", function( assert ) {
	var v = $( "#testForm1clean" ).validate( {
		rules: {
			firstnamec: {
				required: true,
				rangelength: [ 5, 10 ]
			}
		},
		messages: {
			firstnamec: {
				rangelength: "at least ${0}, up to {1}"
			}
		}
	} );
	$( "#firstnamec" ).val( "abc" );
	v.form();
	assert.equal( v.errorList[ 0 ].message, "at least 5, up to 10" );
} );

QUnit.test( "option invalidHandler", function( assert ) {
	assert.expect( 1 );
	var done = assert.async();
	$( "#testForm1clean" ).validate( {
		invalidHandler: function() {
			assert.ok( true, "invalid-form event triggered called" );
			done();
		}
	} );
	$( "#usernamec" ).val( "asdf" ).rules( "add", { required: true, minlength: 5 } );
	$( "#testForm1clean" ).submit();
} );

QUnit.test( "findByName()", function( assert ) {
	assert.deepEqual(
		new $.validator( {}, document.getElementById( "form" ) )
			.findByName( document.getElementById( "radio1" ).name )
			.get(),
		$( "#form" ).find( "[name=radio1]" ).get()
	);
} );

QUnit.test( "focusInvalid()", function( assert ) {

	// TODO when using custom focusin, this is triggered just once
	// TODO when using 1.4 focusin, triggered twice; fix once not testing against 1.3 anymore
	// assert.expect( 1 );
	var inputs = $( "#testForm1 input" ).focus( function() {
			assert.equal( this, inputs[ 0 ], "focused first element" );
		} ),
		v = $( "#testForm1" ).validate();

	v.form();
	v.focusInvalid();
} );

QUnit.test( "focusInvalid() after validate a custom set of inputs", function( assert ) {
	var form = $( "#testForm1" ),
		validator = form.validate(),

		// It's important the order of Valid, Invalid, Valid so last active element it's a valid element before focus
		inputs = $( "#firstname, #lastname, #something" );

	$( "#firstname" ).val( "ok" );

	assert.ok( !inputs.valid(), "just one invalid" );

	validator.focusInvalid();

	assert.equal( form[ 0 ].ownerDocument.activeElement, $( "#lastname" )[ 0 ], "focused first element" );
} );

QUnit.test( "findLastActive()", function( assert ) {
	assert.expect( 3 );
	var v = $( "#testForm1" ).validate(),
		lastActive;

	assert.ok( !v.findLastActive() );
	v.form();
	v.focusInvalid();
	assert.equal( v.findLastActive(), $( "#firstname" )[ 0 ] );
	lastActive = $( "#lastname" ).trigger( "focus" ).trigger( "focusin" )[ 0 ];

	assert.equal( v.lastActive, lastActive );
} );

QUnit.test( "elementValue() finds radios/checkboxes only within the current form", function( assert ) {
	assert.expect( 1 );
	var v = $( "#userForm" ).validate(), foreignRadio = $( "#radio2" )[ 0 ];

	assert.ok( !v.elementValue( foreignRadio ) );
} );

QUnit.test( "elementValue() returns the file input's name without the prefix 'C:\\fakepath\\' ", function( assert ) {
	var v = $( "#userForm" ).validate(),

		// A fake file input
		fileInput = {
			name: "fakeFile",
			type: "file",
			files: {},
			nodeName: "INPUT",
			value: "C:\\fakepath\\somefile.txt",
			form: $( "#userForm" )[ 0 ],
			hasAttribute: function() { return false; },
			getAttribute: function( name ) {
				if ( name === "type" ) {
					return "file";
				}

				return undefined;
			},
			setAttribute: function() {}
		};

	v.defaultShowErrors = function() {};
	v.validationTargetFor = function() {
		return fileInput;
	};

	assert.equal( v.elementValue( fileInput ), "somefile.txt" );

	$( fileInput ).rules( "add", {
		minlength: 10
	} );

	assert.ok( v.element( fileInput ), "The fake file input is valid (length = 12, minlength = 10)" );

	fileInput.value = "C:\\fakepath\\file.txt";
	assert.ok( !v.element( fileInput ), "The fake file input is invalid (length = 8, minlength = 10)" );

	$( fileInput ).rules( "remove" );
	$( fileInput ).rules( "add", {
		maxlength: 10
	} );

	assert.ok( v.element( fileInput ), "The fake file input is valid (length = 8, maxlength = 10)" );

	fileInput.value = "C:\\fakepath\\fakefile.txt";
	assert.ok( !v.element( fileInput ), "The fake file input is invalid (length = 12, maxlength = 10)" );
} );

QUnit.test( "Required rule should not take precedence over number & digits rules", function( assert ) {
	var v = $( "#userForm" ).validate(),

		// A fake number input
		numberInput = {
			name: "fakeNumber",
			type: "number",
			nodeName: "INPUT",
			value: "",
			form: $( "#userForm" )[ 0 ],
			validity: {
				badInput: false
			},
			hasAttribute: function() { return false; },
			getAttribute: function( name ) {
				return this[ name ];
			},
			setAttribute: function() {}
		};

	v.defaultShowErrors = function() {};
	v.validationTargetFor = function() {
		return numberInput;
	};

	$( numberInput ).rules( "add", {
		required: true
	} );

	assert.deepEqual( $( numberInput ).rules(), { required: true, number: true } );
	assert.ok( !v.element( numberInput ), "The fake number input is invalid" );
	assert.equal( v.errorList[ 0 ].message, $.validator.messages.required, "The error message should be the one of required rule." );

	numberInput.value = "Not A Number";
	numberInput.validity.badInput = true;
	assert.ok( !v.element( numberInput ), "The fake number input is invalid" );
	assert.equal( v.errorList[ 0 ].message, $.validator.messages.number, "The error message should be the one of number rule." );

	numberInput.value = "2015";
	numberInput.validity.badInput = false;
	assert.ok( v.element( numberInput ), "The fake number input is valid" );
} );

QUnit.test( "validating multiple checkboxes with 'required'", function( assert ) {
	assert.expect( 3 );
	var checkboxes = $( "#form input[name=check3]" ).prop( "checked", false ),
		v;
	assert.equal( checkboxes.length, 5 );

	v = $( "#form" ).validate( {
		rules: {
			check3: "required"
		}
	} );
	v.form();

	assert.equal( v.size(), 1 );
	checkboxes.filter( ":last" ).prop( "checked", true );
	v.form();
	assert.equal( v.size(), 0 );
} );

QUnit.test( "dynamic form", function( assert ) {
	var counter = 0,
		v;
	function add() {
		$( "<input data-rule-required='true' name='list" + counter++ + "' />" ).appendTo( "#testForm2" );
	}
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}

	v = $( "#testForm2" ).validate();
	v.form();
	errors( 1 );
	add();
	v.form();
	errors( 2 );
	add();
	v.form();
	errors( 3 );
	$( "#testForm2 input[name=list1]" ).remove();
	v.form();
	errors( 2 );
	add();
	v.form();
	errors( 3 );
	$( "#testForm2 input[name^=list]" ).remove();
	v.form();
	errors( 1 );
	$( "#agb" ).attr( "disabled", true );
	v.form();
	errors( 0 );
	$( "#agb" ).attr( "disabled", false );
	v.form();
	errors( 1 );
} );

QUnit.test( "idOrName()", function( assert ) {
	assert.expect( 4 );
	var v = $( "#testForm1" ).validate();
	assert.equal( v.idOrName( $( "#form8input" )[ 0 ] ), "form8input" );
	assert.equal( v.idOrName( $( "#form6check1" )[ 0 ] ), "check" );
	assert.equal( v.idOrName( $( "#agb" )[ 0 ] ), "agree" );
	assert.equal( v.idOrName( $( "#form :button" )[ 0 ] ), "button" );
} );

QUnit.test( "resetForm()", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}
	var v = $( "#testForm1" ).validate();
	v.form();
	errors( 2 );
	assert.ok( $( "#firstname" ).hasClass( "error" ) );
	assert.ok( $( "#something" ).hasClass( "valid" ) );
	$( "#firstname" ).val( "hiy" );
	v.resetForm();
	errors( 0 );
	assert.ok( !$( "#firstname" ).hasClass( "error" ) );
	assert.ok( !$( "#something" ).hasClass( "valid" ) );
	assert.equal( $( "#firstname" ).val(), "", "form plugin is included, therefor resetForm must also reset inputs, not only errors" );
} );

QUnit.test( "resetForm() clean styles when custom highlight function is used", function( assert ) {
	var form = $( "#testForm1clean" ),
		e = $( "#firstnamec" );
	form.validate( {
		highlight: function( element ) {
			$( element ).hide();
		},
		unhighlight: function( element ) {
			$( element ).show();
		},
		ignore: "",
		errorClass: "invalid",
		rules: {
			firstnamec: "required"
		}
	} );
	e.valid();
	assert.ok( !e.is( ":visible" ) );
	form.validate().resetForm();
	assert.ok( e.is( ":visible" ) );
} );

QUnit.test( "message from title", function( assert ) {
	var v = $( "#withTitle" ).validate();
	v.checkForm();
	assert.equal( v.errorList[ 0 ].message, "fromtitle", "title not used" );
} );

QUnit.test( "ignoreTitle", function( assert ) {
	var v = $( "#withTitle" ).validate( { ignoreTitle: true } );
	v.checkForm();
	assert.equal( v.errorList[ 0 ].message, $.validator.messages.required, "title used when it should have been ignored" );
} );

QUnit.test( "ajaxSubmit", function( assert ) {
	assert.expect( 1 );
	var done = assert.async();
	$( "#user" ).val( "Peter" );
	$( "#password" ).val( "foobar" );
	jQuery( "#signupForm" ).validate( {
		debug: false,
		submitHandler: function( form ) {
			jQuery( form ).ajaxSubmit( {
				success: function( response ) {
					assert.equal( response, "Hi Peter, welcome back." );
					done();
				}
			} );

			return false;
		}
	} );
	jQuery( "#signupForm" ).triggerHandler( "submit" );
} );

QUnit.test( "validating groups settings parameter", function( assert ) {
	var form = $( "<form>" ),
		validate = form.validate( {
			groups: {
				arrayGroup: [ "input one", "input-two", "input three" ],
				stringGroup: "input-four input-five input-six"
			}
		} );

	assert.equal( validate.groups[ "input one" ], "arrayGroup" );
	assert.equal( validate.groups[ "input-two" ], "arrayGroup" );
	assert.equal( validate.groups[ "input three" ], "arrayGroup" );
	assert.equal( validate.groups[ "input-four" ], "stringGroup" );
	assert.equal( validate.groups[ "input-five" ], "stringGroup" );
	assert.equal( validate.groups[ "input-six" ], "stringGroup" );
} );

QUnit.test( "validating group of elements", function( assert ) {
	var form  = $( "#testForm26" ),
		day   = form.find( "[name='day']" ),
		month = form.find( "[name='month']" ),
		year  = form.find( "[name='year']" ),
		event = $.Event( "keyup", { keyCode: 9 } ),
		v = form.validate( {
			groups: {
				mydate: "day month year"
			}
		} ),
		invalidEls;

	v.form();

	assert.equal( v.invalidElements().length, 3, "All 3 elements are invalid" );

	// Tab to `month`
	day.blur();
	month.trigger( event );
	month.focus();

	month.val( 2 );

	// Trigger validation via click event
	month.trigger( "click" );

	invalidEls = v.invalidElements();

	assert.equal( invalidEls.length, 2, "Only 2 elements are invalid" );
	assert.deepEqual( invalidEls[ 0 ], day[ 0 ], "The day element is invalid" );
	assert.deepEqual( invalidEls[ 1 ], year[ 0 ], "The year element is invalid" );
} );

QUnit.test( "bypassing validation on form submission", function( assert ) {
	var form = $( "#bypassValidation" ),
		normalSubmission = $( "form#bypassValidation :input[id=normalSubmit]" ),
		bypassSubmitWithCancel = $( "form#bypassValidation :input[id=bypassSubmitWithCancel]" ),
		bypassSubmitWithNoValidate1 = $( "form#bypassValidation :input[id=bypassSubmitWithNoValidate1]" ),
		bypassSubmitWithNoValidate2 = $( "form#bypassValidation :input[id=bypassSubmitWithNoValidate2]" ),
		$v = form.validate( {
			debug: true
		} );

	bypassSubmitWithCancel.click();
	assert.equal( $v.numberOfInvalids(), 0, "Validation was bypassed using CSS 'cancel' class." );
	$v.resetForm();

	bypassSubmitWithNoValidate1.click();
	assert.equal( $v.numberOfInvalids(), 0, "Validation was bypassed using blank 'formnovalidate' attribute." );
	$v.resetForm();

	bypassSubmitWithNoValidate2.click();
	assert.equal( $v.numberOfInvalids(), 0, "Validation was bypassed using 'formnovalidate=\"formnovalidate\"' attribute." );
	$v.resetForm();

	normalSubmission.click();
	assert.equal( $v.numberOfInvalids(), 1, "Validation failed correctly" );
} );

QUnit.test( "works on contenteditable fields", function( assert ) {
	var form = $( "#contenteditableForm" );
	form.valid();
	assert.hasError( $( "#contenteditableNumberInvalid" ), "Please enter a valid number." );
	assert.hasError( $( "#contenteditableRequiredInvalid" ), "This field is required." );
	assert.hasError( $( "#contenteditableInput" ), "Please enter a valid number." );
	assert.noErrorFor( $( "#contenteditableNumberValid" ) );
	assert.noErrorFor( $( "#contenteditableRequiredValid" ) );
} );

QUnit.test( "works on contenteditable fields on input event", function( assert ) {
	$( "#contenteditableForm" ).validate();

	$( "#contenteditableNumberInvalid" ).focus();
	$( "#contenteditableRequiredInvalid" ).focus();
	$( "#contenteditableInput" ).keyup();
	$( "#contenteditableNumberValid" ).focus();
	$( "#contenteditableRequiredValid" ).keyup();

	assert.hasError( $( "#contenteditableNumberInvalid" ), "Please enter a valid number." );
	assert.noErrorFor( $( "#contenteditableNumberValid" ) );
	assert.noErrorFor( $( "#contenteditableRequiredValid" ) );
} );

QUnit.test( "Assign rules to contenteditable via .validate() method", function( assert ) {
	assert.expect( 2 );
	var form = $( "#_contenteditableForm" );
	var v = form.validate( {
		rules: {
			first_name: {
				required: true
			},
			something: {
				required: true
			}
		}
	} );
	var firstNameRules = $( "#first_name", form ).rules();
	var expectedRules = { required: true };

	assert.deepEqual(
		firstNameRules, expectedRules, "The rules should be the same"
	);

	v.form();

	assert.equal( v.numberOfInvalids(), 2, "The form has two errors" );
} );

QUnit.test( "Assign rules to contenteditable via .rules() method", function( assert ) {
	assert.expect( 2 );
	var form = $( "#_contenteditableForm" );
	var v = form.validate( {
		rules: {
			something: {
				required: true
			}
		}
	} );

	$( "#first_name", form ).rules( "add", {
		required: true
	} );

	var firstNameRules = $( "#first_name", form ).rules();
	var expectedRules = { required: true };

	assert.deepEqual(
		firstNameRules, expectedRules, "The rules should be the same"
	);

	v.form();

	assert.equal( v.numberOfInvalids(), 2, "The form has two errors" );
} );

QUnit.module( "misc" );

QUnit.test( "success option", function( assert ) {
	assert.expect( 7 );
	assert.equal( $( "#firstname" ).val(), "" );
	var v = $( "#testForm1" ).validate( {
			success: "valid"
		} ),
		label = $( "#testForm1 .error:not(input)" );

	assert.ok( label.is( ".error" ) );
	assert.ok( !label.is( ".valid" ) );
	v.form();
	assert.ok( label.is( ".error" ) );
	assert.ok( !label.is( ".valid" ) );
	$( "#firstname" ).val( "hi" );
	v.form();
	assert.ok( label.is( ".error" ) );
	assert.ok( label.is( ".valid" ) );
} );

QUnit.test( "success option2", function( assert ) {
	assert.expect( 5 );
	assert.equal( $( "#firstname" ).val(), "" );
	var v = $( "#testForm1" ).validate( {
			success: "valid"
		} ),
		label = $( "#testForm1 .error:not(input)" );

	assert.ok( label.is( ".error" ) );
	assert.ok( !label.is( ".valid" ) );
	$( "#firstname" ).val( "hi" );
	v.form();
	assert.ok( label.is( ".error" ) );
	assert.ok( label.is( ".valid" ) );
} );

QUnit.test( "success option3", function( assert ) {
	assert.expect( 5 );
	assert.equal( $( "#firstname" ).val(), "" );
	$( "#errorFirstname" ).remove();
	var v = $( "#testForm1" ).validate( {
			success: "valid"
		} ),
		labels;

	assert.equal( $( "#testForm1 .error:not(input)" ).length, 0 );
	$( "#firstname" ).val( "hi" );
	v.form();
	labels = $( "#testForm1 .error:not(input)" );

	assert.equal( labels.length, 3 );
	assert.ok( labels.eq( 0 ).is( ".valid" ) );
	assert.ok( !labels.eq( 1 ).is( ".valid" ) );
} );

QUnit.test( "successlist", function( assert ) {
	var v = $( "#form" ).validate( { success: "xyz" } );
	v.form();
	assert.equal( v.successList.length, 0 );
} );

QUnit.test( "success isn't called for optional elements with no other rules", function( assert ) {
	assert.expect( 4 );
	assert.equal( $( "#firstname" ).removeAttr( "data-rule-required" ).removeAttr( "data-rule-minlength" ).val(), "" );
	$( "#something" ).remove();
	$( "#lastname" ).remove();
	$( "#errorFirstname" ).remove();
	var v = $( "#testForm1" ).validate( {
		success: function() {
			assert.ok( false, "don't call success for optional elements!" );
		},
		rules: {
			firstname: { required: false }
		}
	} );
	assert.equal( $( "#testForm1 .error:not(input)" ).length, 0 );
	v.form();
	assert.equal( $( "#testForm1 .error:not(input)" ).length, 0 );
	$( "#firstname" ).valid();
	assert.equal( $( "#testForm1 .error:not(input)" ).length, 0 );
} );

QUnit.test( "success is called for optional elements with other rules", function( assert ) {
	assert.expect( 1 );

	$.validator.addMethod( "custom1", function() {
		return true;
	}, "" );

	$( "#testForm1clean" ).validate( {
		success: function() {
			assert.ok( true, "success called correctly!" );
		},
		rules: {
			firstnamec: {
				required: false,
				custom1: true
			}
		}
	} );

	$( "#firstnamec" ).valid();

	delete $.validator.methods.custom1;
} );

QUnit.test( "success callback with element", function( assert ) {
	assert.expect( 1 );
	var v = $( "#userForm" ).validate( {
		success: function( label, element ) {
			assert.equal( element, $( "#username" ).get( 0 ) );
		}
	} );
	$( "#username" ).val( "hi" );
	v.form();
} );

QUnit.test( "all rules are evaluated even if one returns a dependency-mistmatch", function( assert ) {
	assert.expect( 6 );
	assert.equal( $( "#firstname" ).removeAttr( "data-rule-required" ).removeAttr( "data-rule-minlength" ).val(), "" );
	$( "#lastname" ).remove();
	$( "#errorFirstname" ).remove();
	$.validator.addMethod( "custom1", function() {
		assert.ok( true, "custom method must be evaluated" );
		return true;
	}, "" );
	var v = $( "#testForm1" ).validate( {
		rules: {
			firstname: {
				email: true,
				custom1: true
			}
		}
	} );
	assert.equal( $( "#testForm1 .error:not(input)" ).length, 0 );
	v.form();
	assert.equal( $( "#testForm1 .error:not(input)" ).length, 0 );
	$( "#firstname" ).valid();
	assert.equal( $( "#testForm1 .error:not(input)" ).length, 0 );

	delete $.validator.methods.custom1;
	delete $.validator.messages.custom1;
} );

QUnit.test( "messages", function( assert ) {
	var m = jQuery.validator.messages;
	assert.equal( m.maxlength( 0 ), "Please enter no more than 0 characters." );
	assert.equal( m.minlength( 1 ), "Please enter at least 1 characters." );
	assert.equal( m.rangelength( [ 1, 2 ] ), "Please enter a value between 1 and 2 characters long." );
	assert.equal( m.max( 1 ), "Please enter a value less than or equal to 1." );
	assert.equal( m.min( 0 ), "Please enter a value greater than or equal to 0." );
	assert.equal( m.range( [ 1, 2 ] ), "Please enter a value between 1 and 2." );
	assert.equal( m.step( 2 ), "Please enter a multiple of 2." );
} );

QUnit.test( "jQuery.validator.format", function( assert ) {
	assert.equal(
		jQuery.validator.format( "Please enter a value between {0} and {1}.", 0, 1 ),
		"Please enter a value between 0 and 1."
	);
	assert.equal(
		jQuery.validator.format( "{0} is too fast! Enter a value smaller then {0} and at least {1}", 0, -15 ),
		"0 is too fast! Enter a value smaller then 0 and at least -15"
	);
	var template = jQuery.validator.format( "{0} is too fast! Enter a value smaller then {0} and at least {1}" );
	assert.equal( template( 0, -15 ), "0 is too fast! Enter a value smaller then 0 and at least -15" );
	template = jQuery.validator.format( "Please enter a value between {0} and {1}." );
	assert.equal( template( [ 1, 2 ] ), "Please enter a value between 1 and 2." );
	assert.equal( $.validator.format( "{0}", "$0" ), "$0" );
} );

QUnit.test( "option: ignore", function( assert ) {
	var v = $( "#testForm1" ).validate( {
		ignore: "[name=lastname]"
	} );
	v.form();
	assert.equal( v.size(), 1 );
} );

QUnit.test( "option: subformRequired", function( assert ) {
	jQuery.validator.addMethod( "billingRequired", function( value, element ) {
		if ( $( "#bill_to_co" ).is( ":checked" ) ) {
			return $( element ).parents( "#subform" ).length;
		}
		return !this.optional( element );
	}, "" );
	var v = $( "#subformRequired" ).validate();
	v.form();
	assert.equal( v.size(), 1 );
	$( "#bill_to_co" ).attr( "checked", false );
	v.form();
	assert.equal( v.size(), 2 );

	delete $.validator.methods.billingRequired;
	delete $.validator.messages.billingRequired;
} );

QUnit.module( "expressions" );

QUnit.test( "expression: :blank", function( assert ) {
	var e = $( "#lastname" )[ 0 ];
	assert.equal( $( e ).filter( ":blank" ).length, 1 );
	e.value = " ";
	assert.equal( $( e ).filter( ":blank" ).length, 1 );
	e.value = "   ";
	assert.equal( $( e ).filter( ":blank" ).length, 1 );
	e.value = " a ";
	assert.equal( $( e ).filter( ":blank" ).length, 0 );
} );

QUnit.test( "expression: :filled", function( assert ) {
	var e = $( "#lastname" )[ 0 ];
	assert.equal( $( e ).filter( ":filled" ).length, 0 );
	e.value = " ";
	assert.equal( $( e ).filter( ":filled" ).length, 0 );
	e.value = "   ";
	assert.equal( $( e ).filter( ":filled" ).length, 0 );
	e.value = " a ";
	assert.equal( $( e ).filter( ":filled" ).length, 1 );
  e = $( "#meal" )[ 0 ];
  assert.equal( $( e ).filter( ":filled" ).length, 0 );
	$( e ).val( "1" );
	assert.equal( $( e ).filter( ":filled" ).length, 1 );
  e = $( "#selectf7" )[ 0 ];
  assert.equal( $( e ).filter( ":filled" ).length, 0 );
	$( e ).val( [ "1", "2" ] );
	assert.equal( $( e ).filter( ":filled" ).length, 1 );
} );

QUnit.test( "expression: :unchecked", function( assert ) {
	var e = $( "#check2" )[ 0 ];
	assert.equal( $( e ).filter( ":unchecked" ).length, 1 );
	e.checked = true;
	assert.equal( $( e ).filter( ":unchecked" ).length, 0 );
	e.checked = false;
	assert.equal( $( e ).filter( ":unchecked" ).length, 1 );
} );

QUnit.module( "events" );

QUnit.test( "validate on blur", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}
	function labels( expected ) {
		assert.equal( v.errors().filter( ":visible" ).length, expected );
	}
	function blur( target ) {
		target.trigger( "blur" ).trigger( "focusout" );
	}
	$( "#errorFirstname" ).hide();
	var e = $( "#firstname" ),
		v = $( "#testForm1" ).validate();

	$( "#something" ).val( "" );
	blur( e );
	errors( 0, "No value yet, required is skipped on blur" );
	labels( 0 );
	e.val( "h" );
	blur( e );
	errors( 1, "Required was ignored, but as something was entered, check other rules, minlength isn't met" );
	labels( 1 );
	e.val( "hh" );
	blur( e );
	errors( 0, "All is fine" );
	labels( 0 );
	e.val( "" );
	v.form();
	errors( 3, "Submit checks all rules, both fields invalid" );
	labels( 3 );
	blur( e );
	errors( 1, "Blurring the field results in emptying the error list first, then checking the invalid field: its still invalid, don't remove the error" );
	labels( 3 );
	e.val( "h" );
	blur( e );
	errors( 1, "Entering a single character fulfills required, but not minlength: 2, still invalid" );
	labels( 3 );
	e.val( "hh" );
	blur( e );
	errors( 0, "Both required and minlength are met, no errors left" );
	labels( 2 );
} );

QUnit.test( "validate on keyup", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}
	function keyup( target ) {
		target.trigger( "keyup" );
	}
	var e = $( "#firstname" ),
		v = $( "#testForm1" ).validate();

	keyup( e );
	errors( 0, "No value, no errors" );
	e.val( "a" );
	keyup( e );
	errors( 0, "Value, but not invalid" );
	e.val( "" );
	v.form();
	errors( 2, "Both invalid" );
	keyup( e );
	errors( 1, "Only one field validated, still invalid" );
	e.val( "hh" );
	keyup( e );
	errors( 0, "Not invalid anymore" );
	e.val( "h" );
	keyup( e );
	errors( 1, "Field didn't loose focus, so validate again, invalid" );
	e.val( "hh" );
	keyup( e );
	errors( 0, "Valid" );
} );

QUnit.test( "validate on not keyup, only blur", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}
	var e = $( "#firstname" ),
		v = $( "#testForm1" ).validate( {
			onkeyup: false
		} );

	errors( 0 );
	e.val( "a" );
	e.trigger( "keyup" );
	e.keyup();
	errors( 0 );
	e.trigger( "blur" ).trigger( "focusout" );
	errors( 1 );
} );

QUnit.test( "validate on keyup and blur", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}
	var e = $( "#firstname" ),
		v = $( "#testForm1" ).validate();

	errors( 0 );
	e.val( "a" );
	e.trigger( "keyup" );
	errors( 0 );
	e.trigger( "blur" ).trigger( "focusout" );
	errors( 1 );
} );

QUnit.test( "validate email on keyup and blur", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}
	var e = $( "#firstname" ),
		v = $( "#testForm1" ).validate();

	v.form();
	errors( 2 );
	e.val( "a" );
	e.trigger( "keyup" );
	errors( 1 );
	e.val( "aa" );
	e.trigger( "keyup" );
	errors( 0 );
} );

QUnit.test( "don't revalidate the field when pressing special characters", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}

	function triggerEvent( element, keycode ) {
		var event = $.Event( "keyup", { keyCode: keycode } );
		element.trigger( event );
	}

	var e = $( "#firstname" ),
		v = $( "#testForm1" ).validate(),
		excludedKeys = {
			"Shift": 16,
			"Ctrl": 17,
			"Alt": 18,
			"Caps lock": 20,
			"End": 35,
			"Home": 36,
			"Left arrow": 37,
			"Up arrow": 38,
			"Right arrow": 39,
			"Down arrow": 40,
			"Insert": 45,
			"Num lock": 144,
			"Alt GR": 225
		};

	// To make sure there is only one error, that one of #firstname field
	$( "#firstname" ).val( "" );
	$( "#lastname" ).val( "something" );
	$( "#something" ).val( "something" );

	// Validate the form
	v.form();
	errors( 1, "Validate manually" );

	// Check for special keys
	e.val( "aaa" );
	$.each( excludedKeys, function( key, keyCode ) {
		triggerEvent( e, keyCode );
		errors( 1, key + " key" );
	} );

	// Normal keyup
	e.val( "aaaaa" );
	e.trigger( "keyup" );
	errors( 0, "Normal keyup" );
} );

QUnit.test( "#1508: Validation fails to trigger when next field is already filled out", function( assert ) {

	// The next field is already filled out.
	$( "#box2" ).val( "something" );

	var event   = $.Event( "keyup", { keyCode: 9 } ),
		element = $( "#box1" ),
		nextE   = $( "#box2" ),
		validator = $( "#testForm23" ).validate( {
			rules: {
				box1: {
					required: true
				},
				box2: {
					required: true
				}
			}
		} ),
		check = function( value ) {

			// Fill the first element
			element.val( "something" );

			// Tab to the next field
			element.blur();
			nextE.trigger( event );
			nextE.focus();

			// Tab back to element
			nextE.blur();
			element.trigger( event );
			element.focus();

			// Change the content
			element.val( value );
			element.trigger( "keyup" );
		},
		eq = function( expected, msg ) {
			assert.equal( validator.numberOfInvalids(), expected, "There is only one invalid element." );
			assert.equal( validator.invalidElements()[ 0 ], element[ 0 ], msg );
		};

	check( "" );
	eq( 1, "The box1 element should be invalid" );
} );

QUnit.test( "[Remote rule] #1508: Validation fails to trigger when next field is already filled out", function( assert ) {
	assert.expect( 2 );

	// The next field is already filled out.
	$( "#val3" ).val( "something" );

	var event   = $.Event( "keyup", { keyCode: 9 } ),
		element = $( "#val2" ),
		nextE   = $( "#val3" ),
		done = assert.async(),
		validator = $( "#testForm24" ).validate( {
			rules: {
				val2: {
					remote: {
						url: "issue1508.php"
					}
				},
				val3: {
					required: true
				}
			}
		} ),
		check = function( value ) {

			// Fill the first element
			element.val( "something" );

			// Tab to the next field
			element.blur();
			nextE.trigger( event );
			nextE.focus();

			// Make sure all events will be called before the bellow code
			setTimeout( function() {

				// Tab back to element
				nextE.blur();
				element.trigger( event );
				element.focus();

				// Change the content
				element.val( value );
				element.trigger( "keyup" );

				setTimeout( function() {
					assert.equal( validator.numberOfInvalids(), 1, "There is only one invalid element" );
					assert.equal( validator.invalidElements()[ 0 ], element[ 0 ], "The val2 element should be invalid" );
					done();
				} );
			} );
		};

	check( "abc" );
} );

QUnit.test( "validate checkbox on click", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}
	function trigger( element ) {
		element.click();

		// Triggered click event screws up checked-state in 1.4
		element.valid();
	}
	var e = $( "#check2" ),
		v = $( "#form" ).validate( {
			rules: {
				check2: "required"
			}
		} );

	trigger( e );
	errors( 0 );
	trigger( e );
	assert.equal( v.form(), false );
	errors( 1 );
	trigger( e );
	errors( 0 );
	trigger( e );
	errors( 1 );
} );

QUnit.test( "validate multiple checkbox on click", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}
	function trigger( element ) {
		element.click();

		// Triggered click event screws up checked-state in 1.4
		element.valid();
	}
	var e1 = $( "#check1" ).attr( "checked", false ),
		e2 = $( "#check1b" ),
		v = $( "#form" ).validate( {
			rules: {
				check: {
					required: true,
					minlength: 2
				}
			}
		} );

	trigger( e1 );
	trigger( e2 );
	errors( 0 );
	trigger( e2 );
	assert.equal( v.form(), false );
	errors( 1 );
	trigger( e2 );
	errors( 0 );
	trigger( e2 );
	errors( 1 );
} );

QUnit.test( "correct checkbox receives the error", function( assert ) {
	function trigger( element ) {
		element.click();

		// Triggered click event screws up checked-state in 1.4
		element.valid();
	}
	var e1 = $( "#check1" ).attr( "checked", false ),
		v;

	$( "#check1b" ).attr( "checked", false );
	v = $( "#form" ).find( "[type=checkbox]" ).attr( "checked", false ).end().validate( {
		rules: {
			check: {
				required: true,
				minlength: 2
			}
		}
	} );

	assert.equal( v.form(), false );
	trigger( e1 );
	assert.equal( v.form(), false );
	assert.ok( v.errorList[ 0 ].element.id === v.currentElements[ 0 ].id, "the proper checkbox has the error AND is present in currentElements" );
} );

QUnit.test( "validate radio on click", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}
	function trigger( element ) {
		element.click();

		// Triggered click event screws up checked-state in 1.4
		element.valid();
	}
	var e1 = $( "#radio1" ),
		e2 = $( "#radio1a" ),
		v = $( "#form" ).validate( {
			rules: {
				radio1: "required"
			}
		} );

	errors( 0 );
	assert.equal( v.form(), false );
	errors( 1 );
	trigger( e2 );
	errors( 0 );
	trigger( e1 );
	errors( 0 );
} );

QUnit.test( "validate input with no type attribute, defaulting to text", function( assert ) {
	function errors( expected, message ) {
		assert.equal( v.size(), expected, message );
	}
	var v = $( "#testForm12" ).validate(),
		e = $( "#testForm12text" );

	errors( 0 );
	e.valid();
	errors( 1 );
	e.val( "test" );
	e.trigger( "keyup" );
	errors( 0 );
} );

QUnit.module( "ignore hidden" );

QUnit.test( "ignore hidden elements", function( assert ) {
	var form = $( "#userForm" ),
		validate = form.validate( {
			rules: {
				"username": "required"
			}
		} );

	form.get( 0 ).reset();
	assert.ok( !validate.form(), "form should be initially invalid" );
	$( "#userForm [name=username]" ).hide();
	assert.ok( validate.form(), "hidden elements should be ignored by default" );
} );

QUnit.test( "ignore hidden elements at start", function( assert ) {
	var form = $( "#userForm" ),
		validate = form.validate( {
			rules: {
				"username": "required"
			}
		} );

	form.get( 0 ).reset();
	$( "#userForm [name=username]" ).hide();
	assert.ok( validate.form(), "hidden elements should be ignored by default" );
	$( "#userForm [name=username]" ).show();
	assert.ok( !validate.form(), "form should be invalid when required element is visible" );
} );

QUnit.module( "configuration with attributes " );

QUnit.test( "Specify error messages through data attributes", function( assert ) {
	var form = $( "#dataMessages" ),
		name = $( "#dataMessagesName" ),
		label;

	form.validate();

	form.get( 0 ).reset();
	name.valid();

	label = $( "#dataMessages .error:not(input)" );
	assert.equal( label.text(), "You must enter a value here", "Correct error label" );
} );

QUnit.test( "Updates pre-existing label if has error class", function( assert ) {
	var form = $( "#updateLabel" ),
		input = $( "#updateLabelInput" ),
		label = $( "#targetLabel" ),
		labelsBefore = form.find( ".error:not(input)" ).length,
		labelsAfter;

	form.validate();
	input.val( "" );
	input.valid();
	labelsAfter = form.find( ".error:not(input)" ).length;

	// 'label' was updated
	assert.equal( label.text(), input.attr( "data-msg-required" ) );

	// New label wasn't created
	assert.equal( labelsAfter, labelsBefore );
} );

QUnit.test( "Min date set by attribute", function( assert ) {
	var form = $( "#rangesMinDateInvalid" ),
		name = $( "#minDateInvalid" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#rangesMinDateInvalid .error:not(input)" );
	assert.equal( label.text(), "Please enter a value greater than or equal to 2012-12-21.", "Correct error label" );
} );

QUnit.test( "Max date set by attribute", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#maxDateInvalid" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a value less than or equal to 2012-12-21.", "Correct error label" );
} );

QUnit.test( "Min and Max date set by attributes greater", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeDateInvalidGreater" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a value less than or equal to 2013-01-21.", "Correct error label" );
} );

QUnit.test( "Min and Max date set by attributes less", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeDateInvalidLess" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a value greater than or equal to 2012-11-21.", "Correct error label" );
} );

QUnit.test( "Min date set by attribute valid", function( assert ) {
	var form = $( "#rangeMinDateValid" ),
		name = $( "#minDateValid" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#rangeMinDateValid .error:not(input)" );
	assert.equal( label.text(), "", "Correct error label" );
} );

QUnit.test( "Max date set by attribute valid", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#maxDateValid" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "", "Correct error label" );
} );

QUnit.test( "Min and Max date set by attributes valid", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeDateValid" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "", "Correct error label" );
} );

QUnit.test( "Min and Max strings set by attributes greater", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeTextInvalidGreater" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a value less than or equal to 200.", "Correct error label" );
} );

QUnit.test( "Min and Max strings set by attributes less", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeTextInvalidLess" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a value greater than or equal to 200.", "Correct error label" );
} );

QUnit.test( "Step string set by attribute invalid", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeTextInvalidStep" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a multiple of 100.", "Correct error label" );
} );

QUnit.test( "Min, Max and Step strings set by attributes valid", function( assert ) {
	var form = $( "#ranges" ),
		range = $( "#rangeTextValid" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	range.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "", "Correct error label" );
} );

QUnit.test( "Min, Max and Step set by data-rule valid", function( assert ) {
	var form = $( "#ranges" ),
		range = $( "#rangeTextDataRuleValid" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	range.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "", "Correct error label" );
} );

QUnit.test( "Step attribute on element with unsupported input type", function( assert ) {
	var form = $( "#stepOnUnsupportedType" ),
		input = $( "#stepOnUnsupportedTypeInput" );

	assert.throws(
		function() {
			form.validate();
			form.get( 0 ).reset();
			input.valid();
		},
		function( err ) {
			return err.message === "Step attribute on input type date is not supported.";
		},
		"Must throw an expected error to pass."
	);
} );

QUnit.test( "calling blur on ignored element", function( assert ) {
	var form = $( "#ignoredElements" );

	form.validate( {
		ignore: ".ignore",
		invalidHandler: function() {
			$( "#ss1" ).blur();
		}
	} );

	form.trigger( "submit" );
	assert.equal( form.valid(), false, "valid() should return false" );
} );

QUnit.test( "Min and Max type absent set by attributes greater", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeAbsentInvalidGreater" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a value less than or equal to 200.", "Correct error label" );
} );

QUnit.test( "Min and Max type absent set by attributes less", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeAbsentInvalidLess" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a value greater than or equal to 200.", "Correct error label" );
} );

QUnit.test( "Step type absent set by attribute invalid", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeAbsentInvalidStep" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a multiple of 100.", "Correct error label" );
} );

QUnit.test( "Min, Max and Step type absent set by attributes valid", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeAbsentValid" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "", "Correct error label" );
} );

QUnit.test( "Min, Max and Step range set by attributes valid", function( assert ) {

	//
	// Cannot test for overflow:
	// When the element is suffering from an underflow,
	// the user agent must set the element"s value to a valid
	// floating-point number that represents the minimum.
	// http://www.w3.org/TR/html5/forms.html#range-state-%28type=range%29
	//
	var form = $( "#ranges" ),
		name = $( "#rangeRangeValid" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "", "Correct error label" );
} );

QUnit.test( "Min and Max number set by attributes valid", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeNumberValid" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "", "Correct error label" );
} );

QUnit.test( "Min and Max number set by attributes greater", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeNumberInvalidGreater" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a value less than or equal to 200.", "Correct error label" );
} );

QUnit.test( "Min and Max number set by attributes less", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeNumberInvalidLess" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a value greater than or equal to 50.", "Correct error label" );
} );

QUnit.test( "Rules allowed to have a value of zero invalid", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeMinZeroInvalidLess" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "Please enter a value greater than or equal to 0.", "Correct error label" );
} );

QUnit.test( "Rules allowed to have a value of zero valid equal", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeMinZeroValidEqual" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "", "Correct error label" );
} );

QUnit.test( "Rules allowed to have a value of zero valid greater", function( assert ) {
	var form = $( "#ranges" ),
		name = $( "#rangeMinZeroValidGreater" ),
		label;

	form.validate();
	form.get( 0 ).reset();
	name.valid();

	label = $( "#ranges .error:not(input)" );
	assert.equal( label.text(), "", "Correct error label" );
} );

QUnit.test( "Validation triggered on radio and checkbox via click", function( assert ) {
	assert.expect( 2 );

	var form = $( "#radiocheckbox" );

	// Init validate
	form.validate();

	// Validate so we have errors
	assert.ok( !form.valid(), "Form invalid" );

	// Simulate native click on first checkbox to trigger change-event
	$( "#radiocheckbox-0-1" ).simulate( "click" );

	// Simulate native click on first radio to trigger change-event
	$( "#radiocheckbox-1-1" ).simulate( "click" );

	// Test if there is no error anymore
	assert.ok( form.find( "input.error" ).length === 0, "Form valid" );
} );

QUnit.test( "destroy()", function( assert ) {
	assert.expect( 14 );

	var form = $( "#testForm5" ),
		validate = form.validate();

	assert.strictEqual( form.data( "validator" ), validate );

	form.valid();
	assert.equal( $( "#x1", form ).hasClass( "validate-equalTo-blur" ), true, "The blur event should be bound to this element" );
	assert.equal( $( "#x2", form ).hasClass( "validate-equalTo-blur" ), true, "The blur event should be bound to this element" );

	assert.equal( $( "#y1", form ).hasClass( "validate-greaterThan-blur" ), true, "The blur event should be bound to this element" );
	assert.equal( $( "#y2", form ).hasClass( "validate-lessThan-blur" ), true, "The blur event should be bound to this element" );
	assert.equal( $( "#z1", form ).hasClass( "validate-greaterThanEqual-blur" ), true, "The blur event should be bound to this element" );
	assert.equal( $( "#z2", form ).hasClass( "validate-lessThanEqual-blur" ), true, "The blur event should be bound to this element" );

	validate.destroy();
	assert.strictEqual( form.data( "validator" ), undefined );
	assert.equal( $( "#x1", form ).hasClass( "validate-equalTo-blur" ), false, "The blur event should be unbound from this element" );
	assert.equal( $( "#x2", form ).hasClass( "validate-equalTo-blur" ), false, "The blur event should be unbound from this element" );

	assert.equal( $( "#y1", form ).hasClass( "validate-lessThan-blur" ), false, "The blur event should be unbound from this element" );
	assert.equal( $( "#y2", form ).hasClass( "validate-greaterThan-blur" ), false, "The blur event should be unbound from this element" );
	assert.equal( $( "#z1", form ).hasClass( "validate-equalTo-blur" ), false, "The blur event should be unbound from this element" );
	assert.equal( $( "#z2", form ).hasClass( "validate-greaterThan-blur" ), false, "The blur event should be unbound from this element" );

} );

QUnit.test( "#1618: Errorlist containing more errors than it should", function( assert ) {
	var v = $( "#testForm24" ).validate( {
			rules: {
				val1: {
					required: true
				},
				val2: {
					required: true
				},
				val3: {
					required: true
				}
			}
		} ),
		inputList = $( "#val1, #val2, #val3" );

	inputList.valid();
	assert.equal( v.errorList.length, 2, "There is only two errors" );

	inputList.valid();
	assert.equal( v.errorList.length, 2, "There should be no change in errorList's content" );
} );

QUnit.test( "addMethod, reusing remote in custom method", function( assert ) {
	assert.expect( 7 );
	$.validator.addMethod( "workemail", function( value, element, param ) {
		return $.validator.methods.remote.call( this, value, element, {
			url: "workemail.php",
			data: { email: value, special: param }
		}, "workemail" );
	}, "work email custom message" );

	var e = $( "#add-method-username" ),
		v = $( "#add-method-remote" ).validate(),
		done = assert.async();

	$( document ).ajaxStop( function() {
		$( document ).unbind( "ajaxStop" );
		assert.strictEqual( v.size(), 1, "There must be one error" );
		assert.strictEqual( v.errorList[ 0 ].message, "work email custom message", "john.doe@gmail.com is not work email" );

		$( document ).ajaxStop( function() {
			$( document ).unbind( "ajaxStop" );
			assert.strictEqual( v.size(), 0, "There must be no errors" );
			assert.ok( v.element( e ), "john.doe@company.com is work email ;)" );
			done();
		} );
		e.val( "john.doe@company.com" );
		assert.strictEqual( v.element( e ), true, "new value, new request; dependency-mismatch considered as valid though" );
	} );
	assert.strictEqual( v.element( e ), false, "invalid element, nothing entered yet" );
	e.val( "john.doe@gmail.com" );
	assert.strictEqual( v.element( e ), true, "still invalid, because remote validation must block until it returns; dependency-mismatch considered as valid though" );
} );

QUnit.test( "stopRequest() should submit the form once pendingRequests === 0", function( assert ) {
    var $form = $( "#userForm" );
    var button = $( ":submit", $form )[ 0 ];
    var done = assert.async();
    var v = $form.validate( {
        debug: true,
        rules: {
            username: {
                remote: "stop-request-submit-form.php"
            }
        }
    } );
    var i = 1;

    // Register a `submit` event after the one registered by this plugin
    $form.on( "submit", function() {

        // Ignoring the first submit that was triggered manually by clicking
        // the submit button. The first submit will be aborted by this plugin
        // in order to wait for `remote` method to finish validating the input
        if ( i > 0 ) {
            i--;
            return false;
        }

        // The second submit is the one triggered by `stopRequest()` after the
        // `remote` method has finished processing its attached input.

        // Compare the button with the `submitButton` property
        assert.deepEqual(
            v.submitButton, button, "The submitButton property should be the same as button"
        );

        var hidden = $form.find( "input:hidden" )[ 0 ];
        assert.deepEqual( hidden.value, button.value );
        assert.deepEqual( hidden.name, button.name );

        done();

        return false;
    } );

    $( "input[name='username']", $form ).val( "something" );

    // Submit the form
    $( button ).click();
} );
