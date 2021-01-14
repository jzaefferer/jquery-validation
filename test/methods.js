function methodTest( methodName ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods[ methodName ],
		element = $( "#firstname" )[ 0 ];

	return function( value, param ) {
		element.value = value;
		return method.call( v, value, element, param );
	};
}

/**
 * Creates a dummy DOM file input with FileList
 * @param filename
 * @param mimeType
 * @returns {{}}
 */
function acceptFileDummyInput( filename, mimeType ) {

	function dummy() {
		return file;
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/FileList
	var file = {
			name: filename,
			size: 500001,
			type: mimeType
		},
		fileList = {
			0: file,
			length: 1,
			item: dummy
		};

	return {
		type: "file",
		files: fileList,
		nodeName: "INPUT",
		value: "/tmp/fake_value",
		hasAttribute: function() { return false; }
	};
}

function fileDummyInput( selectedFiles ) {
	var aFiles = [],
		oFiles;

	for ( var i = 0; i < selectedFiles.length; i++ ) {
		aFiles.push( {
			name: selectedFiles[ i ].name,
			size: selectedFiles[ i ].size,
			type: "image/jpeg"
		} );
	}

	//Convert the array of objects to an object.
	oFiles = aFiles.reduce( function( acc, cur, i ) {
		acc[ i ] = cur;
		return acc;
	}, {} );

	//Add the "length" property to the object.
	oFiles.length = selectedFiles.length;

	//Add the "item()" method to the object.
	oFiles.item = function( i ) { return aFiles[ i ]; };

	return {
		type: "file",
		files: oFiles,
		nodeName: "INPUT",
		value: "/tmp/fake_value",
		hasAttribute: function() { return false; }
	};
}

QUnit.module( "methods" );

QUnit.test( "default messages", function( assert ) {
	var m = $.validator.methods;
	$.each( m, function( key ) {
		assert.ok( jQuery.validator.messages[ key ], key + " has a default message." );
	} );
} );

QUnit.test( "digit", function( assert ) {
	var method = methodTest( "digits" );
	assert.ok( method( "123" ), "Valid digits" );
	assert.ok( !method( "123.000" ), "Invalid digits" );
	assert.ok( !method( "123.000,00" ), "Invalid digits" );
	assert.ok( !method( "123.0.0,0" ), "Invalid digits" );
	assert.ok( !method( "x123" ), "Invalid digits" );
	assert.ok( !method( "100.100,0,0" ), "Invalid digits" );
} );

QUnit.test( "url", function( assert ) {
	var method = methodTest( "url" );
	assert.ok( method( "http://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
	assert.ok( method( "https://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
	assert.ok( method( "ftp://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
	assert.ok( method( "http://www.føtex.dk/" ), "Valid url, danish unicode characters" );
	assert.ok( method( "http://bösendorfer.de/" ), "Valid url, german unicode characters" );
	assert.ok( method( "http://142.42.1.1" ), "Valid IP Address" );
	assert.ok( method( "http://pro.photography" ), "Valid long TLD" );
	assert.ok( method( "//code.jquery.com/jquery-1.11.3.min.js" ), "Valid protocol-relative url" );
	assert.ok( method( "//142.42.1.1" ), "Valid protocol-relative IP Address" );
	assert.ok( !method( "htp://code.jquery.com/jquery-1.11.3.min.js" ), "Invalid protocol" );
	assert.ok( !method( "http://192.168.8." ), "Invalid IP Address" );
	assert.ok( !method( "http://bassistance" ), "Invalid url" ); // Valid
	assert.ok( !method( "http://bassistance." ), "Invalid url" ); // Valid
	assert.ok( !method( "http://bassistance,de" ), "Invalid url" );
	assert.ok( !method( "http://bassistance;de" ), "Invalid url" );
	assert.ok( !method( "http://.bassistancede" ), "Invalid url" );
	assert.ok( !method( "bassistance.de" ), "Invalid url" );
} );

QUnit.test( "url2 (tld optional)", function( assert ) {
	var method = methodTest( "url2" );
	assert.ok( method( "http://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
	assert.ok( method( "https://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
	assert.ok( method( "ftp://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
	assert.ok( method( "http://www.føtex.dk/" ), "Valid url, danish unicode characters" );
	assert.ok( method( "http://bösendorfer.de/" ), "Valid url, german unicode characters" );
	assert.ok( method( "http://192.168.8.5" ), "Valid IP Address" );
	assert.ok( !method( "http://192.168.8." ), "Invalid IP Address" );
	assert.ok( method( "http://bassistance" ), "Invalid url" );
	assert.ok( method( "http://bassistance." ), "Invalid url" );
	assert.ok( !method( "http://bassistance,de" ), "Invalid url" );
	assert.ok( !method( "http://bassistance;de" ), "Invalid url" );
	assert.ok( !method( "http://.bassistancede" ), "Invalid url" );
	assert.ok( !method( "bassistance.de" ), "Invalid url" );
} );

QUnit.test( "email", function( assert ) {
	var method = methodTest( "email" );
	assert.ok( method( "name@domain.tld" ), "Valid email" );
	assert.ok( method( "name@domain.tl" ), "Valid email" );
	assert.ok( method( "bart+bart@tokbox.com" ), "Valid email" );
	assert.ok( method( "bart+bart@tokbox.travel" ), "Valid email" );
	assert.ok( method( "n@d.tld" ), "Valid email" );
	assert.ok( method( "bla.blu@g.mail.com" ), "Valid email" );
	assert.ok( method( "name@domain" ), "Valid email" );
	assert.ok( method( "name.@domain.tld" ), "Valid email" );
	assert.ok( method( "name@website.a" ), "Valid email" );
	assert.ok( method( "name@pro.photography" ), "Valid email" );
	assert.ok( !method( "ole@føtex.dk" ), "Invalid email" );
	assert.ok( !method( "jörn@bassistance.de" ), "Invalid email" );
	assert.ok( !method( "name" ), "Invalid email" );
	assert.ok( !method( "test@test-.com" ), "Invalid email" );
	assert.ok( !method( "name@" ), "Invalid email" );
	assert.ok( !method( "name,@domain.tld" ), "Invalid email" );
	assert.ok( !method( "name;@domain.tld" ), "Invalid email" );
	assert.ok( !method( "name;@domain.tld." ), "Invalid email" );
} );

QUnit.test( "number", function( assert ) {
	var method = methodTest( "number" );
	assert.ok( method( "123" ), "Valid number" );
	assert.ok( method( "-123" ), "Valid number" );
	assert.ok( method( "123,000" ), "Valid number" );
	assert.ok( method( "-123,000" ), "Valid number" );
	assert.ok( method( "123,000.00" ), "Valid number" );
	assert.ok( method( "-123,000.00" ), "Valid number" );
	assert.ok( !method( "-" ), "Invalid number" );
	assert.ok( !method( "123.000,00" ), "Invalid number" );
	assert.ok( !method( "123.0.0,0" ), "Invalid number" );
	assert.ok( !method( "x123" ), "Invalid number" );
	assert.ok( !method( "100.100,0,0" ), "Invalid number" );

	assert.ok( method( "" ), "Blank is valid" );
	assert.ok( method( "123" ), "Valid decimal" );
	assert.ok( method( "123000" ), "Valid decimal" );
	assert.ok( method( "123000.12" ), "Valid decimal" );
	assert.ok( method( "-123000.12" ), "Valid decimal" );
	assert.ok( method( "123.000" ), "Valid decimal" );
	assert.ok( method( "123,000.00" ), "Valid decimal" );
	assert.ok( method( "-123,000.00" ), "Valid decimal" );
	assert.ok( method( ".100" ), "Valid decimal" );
	assert.ok( !method( "1230,000.00" ), "Invalid decimal" );
	assert.ok( !method( "123.0.0,0" ), "Invalid decimal" );
	assert.ok( !method( "x123" ), "Invalid decimal" );
	assert.ok( !method( "100.100,0,0" ), "Invalid decimal" );
} );

/* Disabled for now, need to figure out how to test localized methods
QUnit.test("numberDE", function( assert ) {
	var method = methodTest("numberDE");
	assert.ok( method( "123" ), "Valid numberDE" );
	assert.ok( method( "-123" ), "Valid numberDE" );
	assert.ok( method( "123.000" ), "Valid numberDE" );
	assert.ok( method( "-123.000" ), "Valid numberDE" );
	assert.ok( method( "123.000,00" ), "Valid numberDE" );
	assert.ok( method( "-123.000,00" ), "Valid numberDE" );
	assert.ok(!method( "123,000.00" ), "Invalid numberDE" );
	assert.ok(!method( "123,0,0.0" ), "Invalid numberDE" );
	assert.ok(!method( "x123" ), "Invalid numberDE" );
	assert.ok(!method( "100,100.0.0" ), "Invalid numberDE" );

	assert.ok( method( "" ), "Blank is valid" );
	assert.ok( method( "123" ), "Valid decimalDE" );
	assert.ok( method( "123000" ), "Valid decimalDE" );
	assert.ok( method( "123000,12" ), "Valid decimalDE" );
	assert.ok( method( "-123000,12" ), "Valid decimalDE" );
	assert.ok( method( "123.000" ), "Valid decimalDE" );
	assert.ok( method( "123.000,00" ), "Valid decimalDE" );
	assert.ok( method( "-123.000,00" ), "Valid decimalDE" )
	assert.ok(!method( "123.0.0,0" ), "Invalid decimalDE" );
	assert.ok(!method( "x123" ), "Invalid decimalDE" );
	assert.ok(!method( "100,100.0.0" ), "Invalid decimalDE" );
});
*/

QUnit.test( "date", function( assert ) {
	var method = methodTest( "date" );
	assert.ok( method( "06/06/1990" ), "Valid date" );
	assert.ok( method( "6/6/06" ), "Valid date" );
	assert.ok( !method( "1990x-06-06" ), "Invalid date" );
} );

QUnit.test( "dateISO", function( assert ) {
	var method = methodTest( "dateISO" );
	assert.ok( method( "1990-06-06" ), "Valid date" );
	assert.ok( method( "1990-01-01" ), "Valid date" );
	assert.ok( method( "1990-01-31" ), "Valid date" );
	assert.ok( method( "1990-12-01" ), "Valid date" );
	assert.ok( method( "1990-12-31" ), "Valid date" );
	assert.ok( method( "1990/06/06" ), "Valid date" );
	assert.ok( method( "1990-6-6" ), "Valid date" );
	assert.ok( method( "1990/6/6" ), "Valid date" );
	assert.ok( !method( "1990-106-06" ), "Invalid date" );
	assert.ok( !method( "190-06-06" ), "Invalid date" );
	assert.ok( !method( "1990-00-06" ), "Invalid date" );
	assert.ok( !method( "1990-13-01" ), "Invalid date" );
	assert.ok( !method( "1990-01-00" ), "Invalid date" );
	assert.ok( !method( "1990-01-32" ), "Invalid date" );
	assert.ok( !method( "1990-13-32" ), "Invalid date" );
} );

/* Disabled for now, need to figure out how to test localized methods
QUnit.test("dateDE", function( assert ) {
	var method = methodTest("dateDE");
	assert.ok( method( "03.06.1984" ), "Valid dateDE" );
	assert.ok( method( "3.6.84" ), "Valid dateDE" );
	assert.ok(!method( "6-6-06" ), "Invalid dateDE" );
	assert.ok(!method( "1990-06-06" ), "Invalid dateDE" );
	assert.ok(!method( "06/06/1990" ), "Invalid dateDE" );
	assert.ok(!method( "6/6/06" ), "Invalid dateDE" );
});
*/

QUnit.test( "required", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.required,
		e = $( "#text1, #text1b, #hidden2, #select1, #select2" );
	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ] ), "Valid text input" );
	assert.ok( !method.call( v, e[ 1 ].value, e[ 1 ] ), "Invalid text input" );
	assert.ok( !method.call( v, e[ 2 ].value, e[ 2 ] ), "Invalid text input" );

	assert.ok( !method.call( v, e[ 3 ].value, e[ 3 ] ), "Invalid select" );
	assert.ok( method.call( v, e[ 4 ].value, e[ 4 ] ), "Valid select" );

	e = $( "#area1, #area2, #pw1, #pw2" );
	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ] ), "Valid textarea" );
	assert.ok( !method.call( v, e[ 1 ].value, e[ 1 ] ), "Invalid textarea" );
	assert.ok( method.call( v, e[ 2 ].value, e[ 2 ] ), "Valid password input" );
	assert.ok( !method.call( v, e[ 3 ].value, e[ 3 ] ), "Invalid password input" );

	e = $( "#radio1, #radio2, #radio3" );
	assert.ok( !method.call( v, e[ 0 ].value, e[ 0 ] ), "Invalid radio" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ] ), "Valid radio" );
	assert.ok( method.call( v, e[ 2 ].value, e[ 2 ] ), "Valid radio" );

	e = $( "#check1, #check2" );
	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ] ), "Valid checkbox" );
	assert.ok( !method.call( v, e[ 1 ].value, e[ 1 ] ), "Invalid checkbox" );

	e = $( "#select1, #select2, #select3, #select4" );
	assert.ok( !method.call( v, e[ 0 ].value, e[ 0 ] ), "Invalid select" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ] ), "Valid select" );
	assert.ok( method.call( v, e[ 2 ].value, e[ 2 ] ), "Valid select" );
	assert.ok( method.call( v, e[ 3 ].value, e[ 3 ] ), "Valid select" );
} );

QUnit.test( "required with dependencies", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.required,
		e = $( "#hidden2, #select1, #area2, #radio1, #check2" );
	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], "asffsaa" ), "Valid text input due to dependency not met" );
	assert.ok( !method.call( v, e[ 0 ].value, e[ 0 ], "input" ), "Invalid text input" );
	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], function() { return false; } ), "Valid text input due to dependency not met" );
	assert.ok( !method.call( v, e[ 0 ].value, e[ 0 ], function() { return true; } ), "Invalid text input" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ], "asfsfa" ), "Valid select due to dependency not met" );
	assert.ok( !method.call( v, e[ 1 ].value, e[ 1 ], "input" ), "Invalid select" );
	assert.ok( method.call( v, e[ 2 ].value, e[ 2 ], "asfsafsfa" ), "Valid textarea due to dependency not met" );
	assert.ok( !method.call( v, e[ 2 ].value, e[ 2 ], "input" ), "Invalid textarea" );
	assert.ok( method.call( v, e[ 3 ].value, e[ 3 ], "asfsafsfa" ), "Valid radio due to dependency not met" );
	assert.ok( !method.call( v, e[ 3 ].value, e[ 3 ], "input" ), "Invalid radio" );
	assert.ok( method.call( v, e[ 4 ].value, e[ 4 ], "asfsafsfa" ), "Valid checkbox due to dependency not met" );
	assert.ok( !method.call( v, e[ 4 ].value, e[ 4 ], "input" ), "Invalid checkbox" );
} );

QUnit.test( "minlength", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.minlength,
		param = 2,
		e = $( "#text1, #text1c, #text2, #text3" );
	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], param ), "Valid text input" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ], param ), "Valid text input" );
	assert.ok( !method.call( v, e[ 2 ].value, e[ 2 ], param ), "Invalid text input" );
	assert.ok( method.call( v, e[ 3 ].value, e[ 3 ], param ), "Valid text input" );

	e = $( "#check1, #check2, #check3" );
	assert.ok( !method.call( v, e[ 0 ].value, e[ 0 ], param ), "Valid checkbox" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ], param ), "Valid checkbox" );
	assert.ok( method.call( v, e[ 2 ].value, e[ 2 ], param ), "Invalid checkbox" );

	e = $( "#select1, #select2, #select3, #select4, #select5" );
	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], param ), "Valid select " + e[ 0 ].id );
	assert.ok( !method.call( v, e[ 1 ].value, e[ 1 ], param ), "Invalid select " + e[ 1 ].id );
	assert.ok( method.call( v, e[ 2 ].value, e[ 2 ], param ), "Valid select " + e[ 2 ].id );
	assert.ok( method.call( v, e[ 3 ].value, e[ 3 ], param ), "Valid select " + e[ 3 ].id );
	assert.ok( method.call( v, e[ 4 ].value, e[ 4 ], param ), "Valid select " + e[ 4 ].id );
} );

QUnit.test( "maxlength", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.maxlength,
		param = 4,
		e = $( "#text1, #text2, #text3" );

	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], param ), "Valid text input" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ], param ), "Valid text input" );
	assert.ok( !method.call( v, e[ 2 ].value, e[ 2 ], param ), "Invalid text input" );

	e = $( "#check1, #check2, #check3" );
	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], param ), "Valid checkbox" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ], param ), "Invalid checkbox" );
	assert.ok( !method.call( v, e[ 2 ].value, e[ 2 ], param ), "Invalid checkbox" );

	e = $( "#select1, #select2, #select3, #select4" );
	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], param ), "Valid select" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ], param ), "Valid select" );
	assert.ok( method.call( v, e[ 2 ].value, e[ 2 ], param ), "Valid select" );
	assert.ok( !method.call( v, e[ 3 ].value, e[ 3 ], param ), "Invalid select" );
} );

QUnit.test( "rangelength", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.rangelength,
		param = [ 2, 4 ],
		e = $( "#text1, #text2, #text3" );

	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], param ), "Valid text input" );
	assert.ok( !method.call( v, e[ 1 ].value, e[ 1 ], param ), "Invalid text input" );
	assert.ok( !method.call( v, e[ 2 ].value, e[ 2 ], param ), "Invalid text input" );
} );

QUnit.test( "min", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.min,
		param = 8,
		e = $( "#value1, #value2, #value3" );

	assert.ok( !method.call( v, e[ 0 ].value, e[ 0 ], param ), "Invalid text input" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ], param ), "Valid text input" );
	assert.ok( method.call( v, e[ 2 ].value, e[ 2 ], param ), "Valid text input" );
} );

QUnit.test( "max", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.max,
		param = 12,
		e = $( "#value1, #value2, #value3" );

	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], param ), "Valid text input" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ], param ), "Valid text input" );
	assert.ok( !method.call( v, e[ 2 ].value, e[ 2 ], param ), "Invalid text input" );
} );

QUnit.test( "range", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.range,
		param = [ 4, 12 ],
		e = $( "#value1, #value2, #value3" );

	assert.ok( !method.call( v, e[ 0 ].value, e[ 0 ], param ), "Invalid text input" );
	assert.ok( method.call( v, e[ 1 ].value, e[ 1 ], param ), "Valid text input" );
	assert.ok( !method.call( v, e[ 2 ].value, e[ 2 ], param ), "Invalid text input" );
} );

QUnit.test( "step", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.step,
		param = 1000,
		e = $( "#value1, #value2, #value3, #value4" );

	assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], param ), "Valid text input" );
	assert.ok( !method.call( v, e[ 1 ].value, e[ 1 ], param ), "Invalid text input" );
	assert.ok( method.call( v, e[ 2 ].value, e[ 2 ], param ), "Valid text input" );
} );

QUnit.test( "#1760 - step modulo/remainder regression tests", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.step,
		param = 0.00125,
		e = $( "#value4" );

	for ( var i = 1; i <= 1000; i++ ) {
		e[ 0 ].value = ( param * 100000 * i ) / 100000;
		assert.ok( method.call( v, e[ 0 ].value, e[ 0 ], param ), "Ensure " + e[ 0 ].value + " % " + param + " === 0 is valid" );
	}
} );

QUnit.test( "lessThan", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.lessThan,
		e = $( "#value2" );

	assert.ok( method.call( v, "1", e[ 0 ], "#value2" ), "Valid integer" );
	assert.ok( !method.call( v, "10", e[ 0 ], "#value2" ), "Invalid integer" );
	assert.ok( !method.call( v, "11", e[ 0 ], "#value2" ), "Invalid integer" );
} );

QUnit.test( "lessThanEqual", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.lessThanEqual,
		e = $( "#value2" );

	assert.ok( method.call( v, "1", e[ 0 ], "#value2" ), "Valid integer" );
	assert.ok( method.call( v, "10", e[ 0 ], "#value2" ), "Valid integer" );
	assert.ok( !method.call( v, "11", e[ 0 ], "#value2" ), "Invalid integer" );
} );

QUnit.test( "equalTo", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.equalTo,
		e = $( "#text1, #text2" );

	assert.ok( method.call( v, "Test", e[ 0 ], "#text1" ), "Text input" );
	assert.ok( method.call( v, "T", e[ 1 ], "#text2" ), "Another one" );
} );

QUnit.test( "greaterThanEqual", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.greaterThanEqual,
		e = $( "#value2" );

	assert.ok( !method.call( v, "1", e[ 0 ], "#value2" ), "Invalid integer" );
	assert.ok( method.call( v, "10", e[ 0 ], "#value2" ), "Valid integer" );
	assert.ok( method.call( v, "11", e[ 0 ], "#value2" ), "Valid integer" );
} );

QUnit.test( "greaterThan", function( assert ) {
	var v = jQuery( "#form" ).validate(),
		method = $.validator.methods.greaterThan,
		e = $( "#value2" );

	assert.ok( !method.call( v, "1", e[ 0 ], "#value2" ), "Invalid integer" );
	assert.ok( !method.call( v, "10", e[ 0 ], "#value2" ), "Invalid integer" );
	assert.ok( method.call( v, "11", e[ 0 ], "#value2" ), "Valid integer" );
} );

QUnit.test( "extension", function( assert ) {
	var method = methodTest( "extension" ),
		v;
	assert.ok( method( "picture.gif" ), "Valid default accept type" );
	assert.ok( method( "picture.jpg" ), "Valid default accept type" );
	assert.ok( method( "picture.jpeg" ), "Valid default accept type" );
	assert.ok( method( "picture.png" ), "Valid default accept type" );
	assert.ok( !method( "picture.pgn" ), "Invalid default accept type" );

	v = jQuery( "#form" ).validate();
	method = function( value, param ) {
		return $.validator.methods.extension.call( v, value, $( "#text1" )[ 0 ], param );
	};
	assert.ok( method( "picture.doc", "doc" ), "Valid custom accept type" );
	assert.ok( method( "picture.pdf", "doc|pdf" ), "Valid custom accept type" );
	assert.ok( method( "picture.pdf", "pdf|doc" ), "Valid custom accept type" );
	assert.ok( !method( "picture.pdf", "doc" ), "Invalid custom accept type" );
	assert.ok( !method( "picture.doc", "pdf" ), "Invalid custom accept type" );

	assert.ok( method( "picture.pdf", "doc,pdf" ), "Valid custom accept type, comma separated" );
	assert.ok( method( "picture.pdf", "pdf,doc" ), "Valid custom accept type, comma separated" );
	assert.ok( !method( "picture.pdf", "gop,top" ), "Invalid custom accept type, comma separated" );
} );

QUnit.test( "remote", function( assert ) {
	assert.expect( 7 );
	var e = $( "#username" ),
		v = $( "#userForm" ).validate( {
			rules: {
				username: {
					required: true,
					remote: "users.php"
				}
			},
			messages: {
				username: {
					required: "Please",
					remote: jQuery.validator.format( "{0} in use" )
				}
			}
		} ),
		done = assert.async();

	$( document ).ajaxStop( function() {
		$( document ).unbind( "ajaxStop" );
		assert.equal( v.size(), 1, "There must be one error" );
		assert.equal( v.errorList[ 0 ].message, "Peter in use" );

		$( document ).ajaxStop( function() {
			$( document ).unbind( "ajaxStop" );
			assert.equal( v.size(), 1, "There must be one error" );
			assert.equal( v.errorList[ 0 ].message, "Peter2 in use" );
			done();
		} );
		e.val( "Peter2" );
		assert.strictEqual( v.element( e ), true, "new value, new request; dependency-mismatch considered as valid though" );
	} );
	assert.strictEqual( v.element( e ), false, "invalid element, nothing entered yet" );
	e.val( "Peter" );
	assert.strictEqual( v.element( e ), true, "still invalid, because remote validation must block until it returns; dependency-mismatch considered as valid though" );
} );

QUnit.test( "remote, pending class added to element while call outstanding", function( assert ) {
	assert.expect( 3 );
	var e = $( "#username" ),
		done = assert.async(),
		v = $( "#userForm" ).validate( {
			rules: {
				username: {
					remote: {
						url: "users.php",
						complete: function() {
							assert.strictEqual( e.hasClass( "pending" ), false, "not pending since ajax call complete" );
							done();
						}
					}
				}
			}
		} );
	assert.strictEqual( e.hasClass( "pending" ), false, "not pending since no data entered" );
	e.val( "Peter" );

	// This fires off the validation:
	v.element( e );
	assert.strictEqual( e.hasClass( "pending" ), true, "pending while validation outstanding" );
} );

QUnit.test( "remote, customized ajax options", function( assert ) {
	assert.expect( 2 );
	var done = assert.async();
	$( "#userForm" ).validate( {
		rules: {
			username: {
				required: true,
				remote: {
					url: "users.php",
					type: "POST",
					beforeSend: function( request, settings ) {
						assert.deepEqual( settings.type, "POST" );
						assert.deepEqual( settings.data, "username=asdf&email=email.com" );
					},
					data: {
						email: function() {
							return "email.com";
						}
					},
					complete: function() {
						done();
					}
				}
			}
		}
	} );
	$( "#username" ).val( "asdf" );
	$( "#userForm" ).valid();
} );

QUnit.test( "remote extensions", function( assert ) {
	assert.expect( 5 );
	var e = $( "#username" ),
		v = $( "#userForm" ).validate( {
			rules: {
				username: {
					required: true,
					remote: "users2.php"
				}
			},
			messages: {
				username: {
					required: "Please"
				}
			}
		} ),
		done = assert.async();

	$( document ).ajaxStop( function() {
		$( document ).unbind( "ajaxStop" );
		if ( v.size() !== 0 ) {
			assert.ok( "There must be one error" );
			assert.equal( v.errorList[ 0 ].message, "asdf is already taken, please try something else" );
			v.element( e );
			assert.equal( v.errorList[ 0 ].message, "asdf is already taken, please try something else", "message doesn't change on revalidation" );
		}
		done();
	} );
	assert.strictEqual( v.element( e ), false, "invalid element, nothing entered yet" );
	e.val( "asdf" );
	assert.strictEqual( v.element( e ), true, "still invalid, because remote validation must block until it returns; dependency-mismatch considered as valid though" );
} );

QUnit.test( "remote, data previous querystring", function( assert ) {
	assert.expect( 4 );
	var succeeded = 0,
		$f = $( "#firstnamec" ),
		$l = $( "#lastnamec" ),
		done1 = assert.async(),
		done2 = assert.async(),
		done3 = assert.async(),
		v = $( "#testForm1clean" ).validate( {
			rules: {
				lastname: {
					remote: {
						url: "users.php",
						type: "POST",
						data: {
							firstname: function() {
								return $f.val();
							}
						},
						complete: function() {
							succeeded++;
						}
					}
				}
			}
		} );
	$f.val( "first-name" );
	$l.val( "last-name" );
	assert.strictEqual( succeeded, 0, "no valid call means no successful validation" );
	v.element( $l );
	setTimeout( function() {
		assert.strictEqual( succeeded, 1, "first valid check should submit given first name" );
		done1();
		v.element( $l );
		setTimeout( function() {
			assert.strictEqual( succeeded, 1, "second valid check should not resubmit given same first name" );
			done2();
			$f.val( "different-first-name" );
			v.element( $l );
			setTimeout( function() {
				assert.strictEqual( succeeded, 2, "third valid check should resubmit given different first name" );
				done3();
			} );
		} );
	} );
} );

QUnit.test( "remote, highlight all invalid fields", function( assert ) {
	assert.expect( 3 );

	var done = assert.async(),
		$form = $( "#testForm1" ),
		$firstnameField = $form.find( "input[name='firstname']" ),
		$lastnameField = $form.find( "input[name='lastname']" ),
		$somethingField = $form.find( "input[name='something']" ),
		validateOptions = {
	        rules: {
				firstname: {
	                required: true
	            },
	            lastname: {
	                required: true
	            },
				something: {
	                required: true,
	                remote: {
	                    url: "response.php",
	                    type: "post",
						data: {
							responseText: "false"
						}
					}
				}
			}
		};

	$firstnameField.val( "" );
	$lastnameField.val( "" );
	$somethingField.val( "something value" );

	$form.validate( validateOptions );
	$form.valid();

	setTimeout( function() {
		assert.equal( $firstnameField.hasClass( "error" ), true, "Field 'firstname' should have a '.error' class" );
		assert.equal( $lastnameField.hasClass( "error" ), true, "Field 'lastname' should have a '.error' class" );
		assert.equal( $somethingField.hasClass( "error" ), true, "Field 'something' should have a '.error' class" );
		done();
	}, 500 );
} );
QUnit.test( "remote, unhighlighted should be invoked after being highlighted/invalid", function( assert ) {
	assert.expect( 6 );

	var done1 = assert.async(),
		done2 = assert.async(),
		$form = $( "#testForm25" ),
		$somethingField = $form.find( "input[name='something25']" ),
		responseText = "false",
		response = function() { return responseText; },
		validateOptions = {
			highlight: function( e ) {
				$( e ).addClass( "error" );
				assert.ok( true, "highlight should be called" );
			},
			unhighlight: function( e ) {
				$( e ).removeClass( "error" );
				assert.ok( true, "unhighlight should be called" );
			},
	        rules: {
				something25: {
	                required: true,
	                remote: {
	                    url: "response.php",
	                    type: "post",
						data: {
							responseText: response
						},
						async: false
					}
				}
			}
		};

	$somethingField.val( "something value" );
	var v = $form.validate( validateOptions );
	v.element( $somethingField );

	setTimeout( function() {
		assert.equal( $somethingField.hasClass( "error" ), true, "Field 'something' should have the error class" );
		done1();
		$somethingField.val( "something value 2" );
		responseText = "true";

		v.element( $somethingField );

		setTimeout( function() {
			assert.equal( $somethingField.hasClass( "error" ), false, "Field 'something' should not have the error class" );
			done2();
		}, 500 );
	}, 500 );
} );

QUnit.test( "Fix #697: remote validation uses wrong error messages", function( assert ) {
	var e = $( "#username" ),
		done1 = assert.async(),
		done2 = assert.async(),
		done3 = assert.async(),
		v = $( "#userForm" ).validate( {
			rules: {
				username: {
					required: true,
					remote: {
						url: "users.php"
					}
				}
			},
			messages: {
				username: {
					remote: $.validator.format( "{0} in use" )
				}
			}
		} );

	$( "#userForm" ).valid();

	e.val( "Peter" );
	v.element( e );
	setTimeout( function() {
		assert.equal( v.errorList[ 0 ].message, "Peter in use" );
		done1();

		e.val( "something" );
		v.element( e );

		e.val( "Peter" );
		v.element( e );
		setTimeout( function() {
			assert.equal( v.errorList[ 0 ].message, "Peter in use" );
			done2();

			e.val( "asdf" );
			v.element( e );
			setTimeout( function() {
				assert.equal( v.errorList[ 0 ].message, "asdf in use", "error message should be updated" );
				done3();
			} );
		} );
	} );
} );

QUnit.module( "additional methods" );

QUnit.test( "phone (us)", function( assert ) {
	var method = methodTest( "phoneUS" );
	assert.ok( method( "1(212)-999-2345" ), "Valid US phone number" );
	assert.ok( method( "212 999 2344" ), "Valid US phone number" );
	assert.ok( method( "212-999-0983" ), "Valid US phone number" );
	assert.ok( method( "234-911-5678" ), "Valid US phone number" );
	assert.ok( !method( "111-123-5434" ), "Invalid US phone number. Area Code cannot start with 1" );
	assert.ok( !method( "212 123 4567" ), "Invalid US phone number. NXX cannot start with 1" );
	assert.ok( !method( "911-333-5678" ), "Invalid US phone number, because the area code cannot be in the form N11" );
	assert.ok( method( "234-912-5678" ), "Valid US phone number" );
} );

QUnit.test( "phoneUK", function( assert ) {
	var method = methodTest( "phoneUK" );
	assert.ok( method( "0117 333 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "0121 555 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "01633 555555" ), "Valid UK Phone Number" );
	assert.ok( method( "01298 28555" ), "Valid UK Phone Number" );
	assert.ok( method( "015395 55555" ), "Valid UK Phone Number" );
	assert.ok( method( "016977 3999" ), "Valid UK Phone Number" );
	assert.ok( method( "020 3000 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "024 7500 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "0333 555 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "0500 555555" ), "Valid UK Phone Number" );
	assert.ok( method( "055 3555 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "07122 555555" ), "Valid UK Phone Number" );
	assert.ok( method( "07222 555555" ), "Valid UK Phone Number" );
	assert.ok( method( "07322 555555" ), "Valid UK Phone Number" );
	assert.ok( method( "0800 555 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "0800 355555" ), "Valid UK Phone Number" );
	assert.ok( method( "0843 555 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "0872 555 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "0903 555 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "0983 555 5555" ), "Valid UK Phone Number" );
	assert.ok( method( "(07122) 555555" ), "Valid UK Phone Number" );
	assert.ok( method( "(07222) 555555" ), "Valid UK Phone Number" );
	assert.ok( method( "(07322) 555555" ), "Valid UK Phone Number" );
	assert.ok( method( "+44 7122 555 555" ), "Valid UK Phone Number" );
	assert.ok( method( "+44 7222 555 555" ), "Valid UK Phone Number" );
	assert.ok( method( "+44 7322 555 555" ), "Valid UK Phone Number" );
	assert.ok( !method( "7222 555555" ), "Invalid UK Phone Number" );
	assert.ok( !method( "+44 07222 555555" ), "Invalid UK Phone Number" );
} );

QUnit.test( "mobileUK", function( assert ) {
	var method = methodTest( "mobileUK" );
	assert.ok( method( "07134234323" ), "Valid UK Mobile Number" );
	assert.ok( method( "07334234323" ), "Valid UK Mobile Number" );
	assert.ok( method( "07624234323" ), "Valid UK Mobile Number" );
	assert.ok( method( "07734234323" ), "Valid UK Mobile Number" );
	assert.ok( method( "+447134234323" ), "Valid UK Mobile Number" );
	assert.ok( method( "+447334234323" ), "Valid UK Mobile Number" );
	assert.ok( method( "+447624234323" ), "Valid UK Mobile Number" );
	assert.ok( method( "+447734234323" ), "Valid UK Mobile Number" );
	assert.ok( !method( "07034234323" ), "Invalid UK Mobile Number" );
	assert.ok( !method( "0753423432" ), "Invalid UK Mobile Number" );
	assert.ok( !method( "07604234323" ), "Invalid UK Mobile Number" );
	assert.ok( !method( "077342343234" ), "Invalid UK Mobile Number" );
	assert.ok( !method( "044342343234" ), "Invalid UK Mobile Number" );
	assert.ok( !method( "+44753423432" ), "Invalid UK Mobile Number" );
	assert.ok( !method( "+447604234323" ), "Invalid UK Mobile Number" );
	assert.ok( !method( "+4477342343234" ), "Invalid UK Mobile Number" );
	assert.ok( !method( "+4444342343234" ), "Invalid UK Mobile Number" );
} );

QUnit.test( "mobileRU", function( assert ) {
	var method = methodTest( "mobileRU" );
	assert.ok( method( "+74957207089" ), "Valid RU Mobile Number" );
	assert.ok( method( "84957207089" ), "Valid RU Mobile Number" );
	assert.ok( !method( "+447604234323" ), "Invalid RU Mobile Number" );
	assert.ok( !method( "9477342343234" ), "Invalid RU Mobile Number" );
	assert.ok( !method( "344342343234" ), "Invalid RU Mobile Number" );
} );

QUnit.test( "dateITA", function( assert ) {
	var method = methodTest( "dateITA" );
	assert.ok( method( "01/01/1900" ), "Valid date ITA" );
	assert.ok( method( "17/10/2010" ), "Valid date ITA" );
	assert.ok( !method( "01/13/1990" ), "Invalid date ITA" );
	assert.ok( !method( "01.01.1900" ), "Invalid date ITA" );
	assert.ok( !method( "01/01/199" ), "Invalid date ITA" );
} );

QUnit.test( "dateFA", function( assert ) {
	var method = methodTest( "dateFA" );

	assert.ok( method( "1342/12/29" ), "Valid date FA" );
	assert.ok( method( "1342/12/30" ), "Valid date FA" );
	assert.ok( method( "1361/6/31" ), "Valid date FA" );
	assert.ok( method( "1321/11/30" ), "Valid date FA" );
	assert.ok( method( "1361/1/1" ), "Valid date FA" );
	assert.ok( method( "1020/3/3" ), "Valid date FA" );
	assert.ok( method( "1020/03/3" ), "Valid date FA" );
	assert.ok( method( "1020/3/03" ), "Valid date FA" );
	assert.ok( method( "1020/03/03" ), "Valid date FA" );
	assert.ok( method( "1001/7/30" ), "Valid date FA" );

	assert.ok( !method( "1000/1/32" ), "Invalid date FA" );
	assert.ok( !method( "1323/12/31" ), "Invalid date FA" );
	assert.ok( !method( "1361/0/11" ), "Invalid date FA" );
	assert.ok( !method( "63/4/4" ), "Invalid date FA" );
	assert.ok( !method( "15/6/1361" ), "Invalid date FA" );
} );

QUnit.test( "iban", function( assert ) {
	var method = methodTest( "iban" );
	assert.ok( method( "NL20INGB0001234567" ), "Valid IBAN" );
	assert.ok( method( "DE68 2105 0170 0012 3456 78" ), "Valid IBAN" );
	assert.ok( method( "NL20 INGB0001234567" ), "Valid IBAN: invalid spacing" );
	assert.ok( method( "NL20 INGB 00 0123 4567" ), "Valid IBAN: invalid spacing" );
	assert.ok( method( "XX40INGB000123456712341234" ), "Valid (more or less) IBAN: unknown country, but checksum OK" );

	assert.ok( !method( "1" ), "Invalid IBAN: too short" );
	assert.ok( !method( "NL20INGB000123456" ), "Invalid IBAN: too short" );
	assert.ok( !method( "NL20INGB00012345678" ), "Invalid IBAN: too long" );
	assert.ok( !method( "NL20INGB0001234566" ), "Invalid IBAN: checksum incorrect" );
	assert.ok( !method( "DE68 2105 0170 0012 3456 7" ), "Invalid IBAN: too short" );
	assert.ok( !method( "DE68 2105 0170 0012 3456 789" ), "Invalid IBAN: too long" );
	assert.ok( !method( "DE68 2105 0170 0012 3456 79" ), "Invalid IBAN: checksum incorrect" );

	assert.ok( !method( "NL54INGB00012345671234" ), "Invalid IBAN too long, BUT CORRECT CHECKSUM" );
	assert.ok( !method( "XX00INGB000123456712341234" ), "Invalid IBAN: unknown country and checksum incorrect" );

	// Sample IBANs for different countries
	assert.ok( method( "AL47 2121 1009 0000 0002 3569 8741" ), "Valid IBAN - AL" );
	assert.ok( method( "AD12 0001 2030 2003 5910 0100" ), "Valid IBAN - AD" );
	assert.ok( method( "AT61 1904 3002 3457 3201" ), "Valid IBAN - AT" );
	assert.ok( method( "AZ21 NABZ 0000 0000 1370 1000 1944" ), "Valid IBAN - AZ" );
	assert.ok( method( "BH67 BMAG 0000 1299 1234 56" ), "Valid IBAN - BH" );
	assert.ok( method( "BE62 5100 0754 7061" ), "Valid IBAN - BE" );
	assert.ok( method( "BA39 1290 0794 0102 8494" ), "Valid IBAN - BA" );
	assert.ok( method( "BG80 BNBG 9661 1020 3456 78" ), "Valid IBAN - BG" );
	assert.ok( method( "HR12 1001 0051 8630 0016 0" ), "Valid IBAN - HR" );
	assert.ok( method( "CH93 0076 2011 6238 5295 7" ), "Valid IBAN - CH" );
	assert.ok( method( "CY17 0020 0128 0000 0012 0052 7600" ), "Valid IBAN - CY" );
	assert.ok( method( "CZ65 0800 0000 1920 0014 5399" ), "Valid IBAN - CZ" );
	assert.ok( method( "DK50 0040 0440 1162 43" ), "Valid IBAN - DK" );
	assert.ok( method( "EE38 2200 2210 2014 5685" ), "Valid IBAN - EE" );
	assert.ok( method( "FO97 5432 0388 8999 44" ), "Valid IBAN - FO" );
	assert.ok( method( "FI21 1234 5600 0007 85" ), "Valid IBAN - FI" );
	assert.ok( method( "FR14 2004 1010 0505 0001 3M02 606" ), "Valid IBAN - FR" );
	assert.ok( method( "GE29 NB00 0000 0101 9049 17" ), "Valid IBAN - GE" );
	assert.ok( method( "DE89 3704 0044 0532 0130 00" ), "Valid IBAN - DE" );
	assert.ok( method( "GI75 NWBK 0000 0000 7099 453" ), "Valid IBAN - GI" );
	assert.ok( method( "GR16 0110 1250 0000 0001 2300 695" ), "Valid IBAN - GR" );
	assert.ok( method( "GL56 0444 9876 5432 10" ), "Valid IBAN - GL" );
	assert.ok( method( "HU42 1177 3016 1111 1018 0000 0000" ), "Valid IBAN - HU" );
	assert.ok( method( "IS14 0159 2600 7654 5510 7303 39" ), "Valid IBAN - IS" );
	assert.ok( method( "IE29 AIBK 9311 5212 3456 78" ), "Valid IBAN - IE" );
	assert.ok( method( "IL62 0108 0000 0009 9999 999" ), "Valid IBAN - IL" );
	assert.ok( method( "IT40 S054 2811 1010 0000 0123 456" ), "Valid IBAN - IT" );
	assert.ok( method( "LV80 BANK 0000 4351 9500 1" ), "Valid IBAN - LV" );
	assert.ok( method( "LB62 0999 0000 0001 0019 0122 9114" ), "Valid IBAN - LB" );
	assert.ok( method( "LI21 0881 0000 2324 013A A" ), "Valid IBAN - LI" );
	assert.ok( method( "LT12 1000 0111 0100 1000" ), "Valid IBAN - LT" );
	assert.ok( method( "LU28 0019 4006 4475 0000" ), "Valid IBAN - LU" );
	assert.ok( method( "MK07 2501 2000 0058 984" ), "Valid IBAN - MK" );
	assert.ok( method( "MT84 MALT 0110 0001 2345 MTLC AST0 01S" ), "Valid IBAN - MT" );
	assert.ok( method( "MU17 BOMM 0101 1010 3030 0200 000M UR" ), "Valid IBAN - MU" );
	assert.ok( method( "MD24 AG00 0225 1000 1310 4168" ), "Valid IBAN - MD" );
	assert.ok( method( "MC93 2005 2222 1001 1223 3M44 555" ), "Valid IBAN - MC" );
	assert.ok( method( "ME25 5050 0001 2345 6789 51" ), "Valid IBAN - ME" );
	assert.ok( method( "NL39 RABO 0300 0652 64" ), "Valid IBAN - NL" );
	assert.ok( method( "NO93 8601 1117 947" ), "Valid IBAN - NO" );
	assert.ok( method( "PK36 SCBL 0000 0011 2345 6702" ), "Valid IBAN - PK" );
	assert.ok( method( "PL60 1020 1026 0000 0422 7020 1111" ), "Valid IBAN - PL" );
	assert.ok( method( "PT50 0002 0123 1234 5678 9015 4" ), "Valid IBAN - PT" );
	assert.ok( method( "RO49 AAAA 1B31 0075 9384 0000" ), "Valid IBAN - RO" );
	assert.ok( method( "SM86 U032 2509 8000 0000 0270 100" ), "Valid IBAN - SM" );
	assert.ok( method( "SA03 8000 0000 6080 1016 7519" ), "Valid IBAN - SA" );
	assert.ok( method( "RS35 2600 0560 1001 6113 79" ), "Valid IBAN - RS" );
	assert.ok( method( "SK31 1200 0000 1987 4263 7541" ), "Valid IBAN - SK" );
	assert.ok( method( "SI56 1910 0000 0123 438" ), "Valid IBAN - SI" );
	assert.ok( method( "ES80 2310 0001 1800 0001 2345" ), "Valid IBAN - ES" );
	assert.ok( method( "SE35 5000 0000 0549 1000 0003" ), "Valid IBAN - SE" );
	assert.ok( method( "CH93 0076 2011 6238 5295 7" ), "Valid IBAN - CH" );
	assert.ok( method( "TN59 1000 6035 1835 9847 8831" ), "Valid IBAN - TN" );
	assert.ok( method( "TR33 0006 1005 1978 6457 8413 26" ), "Valid IBAN - TR" );
	assert.ok( method( "AE07 0331 2345 6789 0123 456" ), "Valid IBAN - AE" );
	assert.ok( method( "GB29 NWBK 6016 1331 9268 19" ), "Valid IBAN - GB" );
} );

/**
 * BIC tests (For BIC definition take a look on the implementation itself)
 */
QUnit.test( "bic", function( assert ) {
	var method = methodTest( "bic" );

	assert.ok( !method( "PBNKDEF" ), "Invalid BIC: too short" );
	assert.ok( !method( "DEUTDEFFA1" ), "Invalid BIC: disallowed length" );
	assert.ok( !method( "PBNKDEFFXXX1" ), "Invalid BIC: too long" );
	assert.ok( !method( "1BNKDEFF" ), "Invalid BIC: invalid digit" );
	assert.ok( !method( "PBNKDE1F" ), "Invalid BIC: invalid digit" );
	assert.ok( !method( "PBNKDEFO" ), "Invalid BIC: invalid char" );
	assert.ok( !method( "INGDDEFFXAA" ), "Invalid BIC: invalid char" );
	assert.ok( !method( "DEUTDEF0" ), "Invalid BIC: invalid digit" );

	assert.ok( method( "DEUTDEFF" ), "Valid BIC" );
	assert.ok( method( "DEUTDEFFXXX" ), "Valid BIC" );
	assert.ok( method( "PBNKDE2F" ), "Valid BIC" );
	assert.ok( method( "INGDDEFF101" ), "Valid BIC" );
	assert.ok( method( "INGDDEF2134" ), "Valid BIC" );
	assert.ok( method( "INGDDE91XXX" ), "Valid BIC" );
	assert.ok( method( "INGDDEF2" ), "Valid BIC" );
	assert.ok( method( "AAFFFRP1" ), "Valid BIC" );
	assert.ok( method( "DEUTDEFFAB1" ), "Valid BIC" );
	assert.ok( method( "DEUTDEFFAXX" ), "Valid BIC" );
	assert.ok( method( "SSKNDE77XXX" ), "Valid BIC" );

	// BIC accept also lowercased values
	assert.ok( !method( "pbnkdef" ), "Invalid BIC: too short" );
	assert.ok( !method( "deutdeffa1" ), "Invalid BIC: disallowed length" );
	assert.ok( !method( "pbnkdeffxxx1" ), "Invalid BIC: too long" );
	assert.ok( !method( "1bnkdeff" ), "Invalid BIC: invalid digit" );
	assert.ok( !method( "ingddeffxaa" ), "Invalid BIC: invalid char" );

	assert.ok( method( "deutdeff" ), "Valid BIC (lowercase value)" );
	assert.ok( method( "deutdeffxxx" ), "Valid BIC (lowercase value)" );
	assert.ok( method( "pbnkde2f" ), "Valid BIC (lowercase value)" );
	assert.ok( method( "ingdde91xxx" ), "Valid BIC (lowercase value)" );
	assert.ok( method( "ingddef2" ), "Valid BIC (lowercase value)" );
	assert.ok( method( "deutdeffab1" ), "Valid BIC (lowercase value)" );
} );

QUnit.test( "postcodeUK", function( assert ) {
	var method = methodTest( "postcodeUK" );
	assert.ok( method( "AA9A 9AA" ), "Valid postcode" );
	assert.ok( method( "A9A 9AA" ), "Valid postcode" );
	assert.ok( method( "A9 9AA" ), "Valid postcode" );
	assert.ok( method( "A99 9AA" ), "Valid postcode" );
	assert.ok( method( "AA9 9AA" ), "Valid postcode" );
	assert.ok( method( "AA99 9AA" ), "Valid postcode" );

	// Channel Island
	assert.ok( !method( "AAAA 9AA" ), "Invalid postcode" );
	assert.ok( !method( "AA-2640" ), "Invalid postcode" );

	assert.ok( !method( "AAA AAA" ), "Invalid postcode" );
	assert.ok( !method( "AA AAAA" ), "Invalid postcode" );
	assert.ok( !method( "A AAAA" ), "Invalid postcode" );
	assert.ok( !method( "AAAAA" ), "Invalid postcode" );
	assert.ok( !method( "999 999" ), "Invalid postcode" );
	assert.ok( !method( "99 9999" ), "Invalid postcode" );
	assert.ok( !method( "9 9999" ), "Invalid postcode" );
	assert.ok( !method( "99999" ), "Invalid postcode" );
} );

QUnit.test( "dateNL", function( assert ) {
	var method = methodTest( "dateNL" );
	assert.ok( method( "01-01-1900" ), "Valid date NL" );
	assert.ok( method( "01.01.1900" ), "Valid date NL" );
	assert.ok( method( "01/01/1900" ), "Valid date NL" );
	assert.ok( method( "01-01-00" ), "Valid date NL" );
	assert.ok( method( "1-01-1900" ), "Valid date NL" );
	assert.ok( method( "10-10-1900" ), "Valid date NL" );
	assert.ok( !method( "0-01-1900" ), "Invalid date NL" );
	assert.ok( !method( "00-01-1900" ), "Invalid date NL" );
	assert.ok( !method( "35-01-1990" ), "Invalid date NL" );
	assert.ok( !method( "01.01.190" ), "Invalid date NL" );
} );

QUnit.test( "phoneNL", function( assert ) {
	var method = methodTest( "phoneNL" );
	assert.ok( method( "0701234567" ), "Valid phone NL" );
	assert.ok( method( "0687654321" ), "Valid phone NL" );
	assert.ok( method( "020-1234567" ), "Valid phone NL" );
	assert.ok( method( "020 - 12 34 567" ), "Valid phone NL" );
	assert.ok( method( "010-2345678" ), "Valid phone NL" );
	assert.ok( method( "+3120-1234567" ), "Valid phone NL" );
	assert.ok( method( "+31(0)10-2345678" ), "Valid phone NL" );
	assert.ok( !method( "020-123456" ), "Invalid phone NL: too short" );
	assert.ok( !method( "020-12345678" ), "Invalid phone NL: too long" );
	assert.ok( !method( "-0201234567" ), "Invalid phone NL" );
	assert.ok( !method( "+310201234567" ), "Invalid phone NL: no 0 after +31 allowed" );
} );

QUnit.test( "mobileNL", function( assert ) {
	var method = methodTest( "mobileNL" );
	assert.ok( method( "0612345678" ), "Valid NL Mobile Number" );
	assert.ok( method( "06-12345678" ), "Valid NL Mobile Number" );
	assert.ok( method( "06-12 345 678" ), "Valid NL Mobile Number" );
	assert.ok( method( "+316-12345678" ), "Valid NL Mobile Number" );
	assert.ok( method( "+31(0)6-12345678" ), "Valid NL Mobile Number" );
	assert.ok( !method( "abcdefghij" ), "Invalid NL Mobile Number: text" );
	assert.ok( !method( "0123456789" ), "Invalid NL Mobile Number: should start with 06" );
	assert.ok( !method( "0823456789" ), "Invalid NL Mobile Number: should start with 06" );
	assert.ok( !method( "06-1234567" ), "Invalid NL Mobile Number: too short" );
	assert.ok( !method( "06-123456789" ), "Invalid NL Mobile Number: too long" );
	assert.ok( !method( "-0612345678" ), "Invalid NL Mobile Number" );
	assert.ok( !method( "+310612345678" ), "Invalid NL Mobile Number: no 0 after +31 allowed" );
} );

QUnit.test( "postalcodeNL", function( assert ) {
	var method = methodTest( "postalcodeNL" );
	assert.ok( method( "1234AB" ), "Valid NL Postal Code" );
	assert.ok( method( "1234ab" ), "Valid NL Postal Code" );
	assert.ok( method( "1234 AB" ), "Valid NL Postal Code" );
	assert.ok( method( "6789YZ" ), "Valid NL Postal Code" );
	assert.ok( !method( "123AA" ), "Invalid NL Postal Code: not enough digits" );
	assert.ok( !method( "12345ZZ" ), "Invalid NL Postal Code: too many digits" );
	assert.ok( !method( "1234  AA" ), "Invalid NL Postal Code: too many spaces" );
	assert.ok( !method( "AA1234" ), "Invalid NL Postal Code" );
	assert.ok( !method( "1234-AA" ), "Invalid NL Postal Code" );
} );

QUnit.test( "bankaccountNL", function( assert ) {
	var method = methodTest( "bankaccountNL" );
	assert.ok( method( "755490975" ), "Valid NL bank account" );
	assert.ok( method( "75 54 90 975" ), "Valid NL bank account" );
	assert.ok( method( "123456789" ), "Valid NL bank account" );
	assert.ok( method( "12 34 56 789" ), "Valid NL bank account" );
	assert.ok( !method( "12 3456789" ), "Valid NL bank account: inconsistent spaces" );
	assert.ok( !method( "123 45 67 89" ), "Valid NL bank account: incorrect spaces" );
	assert.ok( !method( "755490971" ), "Invalid NL bank account" );
	assert.ok( !method( "755490973" ), "Invalid NL bank account" );
	assert.ok( !method( "755490979" ), "Invalid NL bank account" );
	assert.ok( !method( "123456781" ), "Invalid NL bank account" );
	assert.ok( !method( "123456784" ), "Invalid NL bank account" );
	assert.ok( !method( "123456788" ), "Invalid NL bank account" );
} );

QUnit.test( "giroaccountNL", function( assert ) {
	var method = methodTest( "giroaccountNL" );
	assert.ok( method( "123" ), "Valid NL giro  account" );
	assert.ok( method( "1234567" ), "Valid NL giro account" );
	assert.ok( !method( "123456788" ), "Invalid NL giro account" );
} );

QUnit.test( "bankorgiroaccountNL", function( assert ) {
	var method = methodTest( "bankorgiroaccountNL" );
	assert.ok( method( "123" ), "Valid NL giro account" );
	assert.ok( method( "1234567" ), "Valid NL giro account" );
	assert.ok( method( "123456789" ), "Valid NL bank account" );
	assert.ok( !method( "12345678" ), "Invalid NL bank or giro account" );
	assert.ok( !method( "123456788" ), "Invalid NL bank or giro account" );
} );

QUnit.test( "time", function( assert ) {
	var method = methodTest( "time" );
	assert.ok( method( "00:00" ), "Valid time, lower bound" );
	assert.ok( method( "23:59" ), "Valid time, upper bound" );
	assert.ok( method( "3:59" ), "Valid time, single digit hour" );
	assert.ok( !method( "12" ), "Invalid time" );
	assert.ok( !method( "29:59" ), "Invalid time" );
	assert.ok( !method( "00:60" ), "Invalid time" );
	assert.ok( !method( "24:60" ), "Invalid time" );
	assert.ok( !method( "24:00" ), "Invalid time" );
	assert.ok( !method( "30:00" ), "Invalid time" );
	assert.ok( !method( "29:59" ), "Invalid time" );
	assert.ok( !method( "120:00" ), "Invalid time" );
	assert.ok( !method( "12:001" ), "Invalid time" );
	assert.ok( !method( "12:00a" ), "Invalid time" );
} );

QUnit.test( "time12h", function( assert ) {
	var method = methodTest( "time12h" );
	assert.ok( method( "12:00 AM" ), "Valid time, lower bound, am" );
	assert.ok( method( "11:59 AM" ), "Valid time, upper bound, am" );
	assert.ok( method( "12:00AM" ), "Valid time, no space, am" );
	assert.ok( method( "12:00PM" ), "Valid time, no space, pm" );
	assert.ok( method( "12:00 PM" ), "Valid time, lower bound, pm" );
	assert.ok( method( "11:59 PM" ), "Valid time, upper bound, pm" );
	assert.ok( method( "11:59 am" ), "Valid time, also accept lowercase" );
	assert.ok( method( "11:59 pm" ), "Valid time, also accept lowercase" );
	assert.ok( method( "1:59 pm" ), "Valid time, single hour, no leading 0" );
	assert.ok( method( "01:59 pm" ), "Valid time, single hour, leading 0" );
	assert.ok( !method( "12:00" ), "Invalid time" );
	assert.ok( !method( "9" ), "Invalid time" );
	assert.ok( !method( "9 am" ), "Invalid time" );
	assert.ok( !method( "12:61 am" ), "Invalid time" );
	assert.ok( !method( "13:00 am" ), "Invalid time" );
	assert.ok( !method( "00:00 am" ), "Invalid time" );
} );

QUnit.test( "minWords", function( assert ) {
	var method = methodTest( "minWords" );
	assert.ok( method( "hello worlds", 2 ), "plain text, valid" );
	assert.ok( method( "<b>hello</b> world", 2 ), "html, valid" );
	assert.ok( !method( "hello", 2 ), "plain text, invalid" );
	assert.ok( !method( "<b>world</b>", 2 ), "html, invalid" );
	assert.ok( !method( "world <br/>", 2 ), "html, invalid" );
} );

QUnit.test( "maxWords", function( assert ) {
	var method = methodTest( "maxWords" );
	assert.ok( method( "hello", 2 ), "plain text, valid" );
	assert.ok( method( "<b>world</b>", 2 ), "html, valid" );
	assert.ok( method( "world <br/>", 2 ), "html, valid" );
	assert.ok( method( "hello worlds", 2 ), "plain text, valid" );
	assert.ok( method( "<b>hello</b> world", 2 ), "html, valid" );
	assert.ok( !method( "hello 123 world", 2 ), "plain text, invalid" );
	assert.ok( !method( "<b>hello</b> 123 world", 2 ), "html, invalid" );
} );

QUnit.test( "rangeWords", function( assert ) {
	var method = methodTest( "rangeWords" );
	assert.ok( method( "hello", [ 0, 2 ] ), "plain text, valid" );
	assert.ok( method( "hello worlds", [ 0, 2 ] ), "plain text, valid" );
	assert.ok( method( "<b>hello</b> world", [ 0, 2 ] ), "html, valid" );
	assert.ok( !method( "hello worlds what is up", [ 0, 2 ] ), "plain text, invalid" );
	assert.ok( !method( "<b>Hello</b> <b>world</b> <b>hello</b>", [ 0, 2 ] ), "html, invalid" );
} );

QUnit.test( "pattern", function( assert ) {
	var method = methodTest( "pattern" );
	assert.ok( method( "AR1004", "AR\\d{4}" ), "Correct format for the given RegExp" );
	assert.ok( method( "AR1004", /^AR\d{4}$/ ), "Correct format for the given RegExp" );
	assert.ok( !method( "BR1004", /^AR\d{4}$/ ), "Invalid format for the given RegExp" );
	assert.ok( method( "1ABC", "[0-9][A-Z]{3}" ), "Correct format for the given RegExp" );
	assert.ok( !method( "ABC", "[0-9][A-Z]{3}" ), "Invalid format for the given RegExp" );
	assert.ok( !method( "1ABC DEF", "[0-9][A-Z]{3}" ), "Invalid format for the given RegExp" );
	assert.ok( method( "1ABCdef", "[a-zA-Z0-9]+" ), "Correct format for the given RegExp" );
	assert.ok( !method( "1ABC def", "[a-zA-Z0-9]+" ), "Invalid format for the given RegExp" );
	assert.ok( method( "2014-10-02", "[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" ), "Correct format for the given RegExp" );
	assert.ok( !method( "02-10-2014", "[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" ), "Invalid format for the given RegExp" );
} );

function testCardTypeByNumber( assert, number, cardname, expected ) {
	$( "#cardnumber" ).val( number );
	var actual = $( "#ccform" ).valid();
	assert.equal( actual, expected, $.validator.format( "Expect card number {0} to validate to {1}, actually validated to ", number, expected ) );
}

QUnit.test( "creditcardtypes, all", function( assert ) {
	$( "#ccform" ).validate( {
		rules: {
			cardnumber: {
				creditcard: true,
				creditcardtypes: {
					all: true
				}
			}
		}
	} );

	testCardTypeByNumber( assert, "4111-1111-1111-1111", "VISA", true );
	testCardTypeByNumber( assert, "2211-1111-1111-1114", "MasterCard", true );
	testCardTypeByNumber( assert, "5111-1111-1111-1118", "MasterCard", true );
	testCardTypeByNumber( assert, "6111-1111-1111-1116", "Discover", true );
	testCardTypeByNumber( assert, "3400-0000-0000-009", "AMEX", true );

	testCardTypeByNumber( assert, "4111-1111-1111-1110", "VISA", false );
	testCardTypeByNumber( assert, "5432-1111-1111-1111", "MasterCard", false );
	testCardTypeByNumber( assert, "6611-6611-6611-6611", "Discover", false );
	testCardTypeByNumber( assert, "3777-7777-7777-7777", "AMEX", false );
} );

QUnit.test( "creditcardtypes, visa", function( assert ) {
	$( "#ccform" ).validate( {
		rules: {
			cardnumber: {
				creditcard: true,
				creditcardtypes: {
					visa: true
				}
			}
		}
	} );

	testCardTypeByNumber( assert, "4111-1111-1111-1111", "VISA", true );
	testCardTypeByNumber( assert, "5111-1111-1111-1118", "MasterCard", false );
	testCardTypeByNumber( assert, "6111-1111-1111-1116", "Discover", false );
	testCardTypeByNumber( assert, "3400-0000-0000-009", "AMEX", false );
} );

QUnit.test( "creditcardtypes, mastercard", function( assert ) {
	$( "#ccform" ).validate( {
		rules: {
			cardnumber: {
				creditcard: true,
				creditcardtypes: {
					mastercard: true
				}
			}
		}
	} );

	testCardTypeByNumber( assert, "2211-1111-1111-1114", "MasterCard", true );
	testCardTypeByNumber( assert, "5111-1111-1111-1118", "MasterCard", true );
	testCardTypeByNumber( assert, "6111-1111-1111-1116", "Discover", false );
	testCardTypeByNumber( assert, "3400-0000-0000-009", "AMEX", false );
	testCardTypeByNumber( assert, "4111-1111-1111-1111", "VISA", false );
} );

function fillFormWithValuesAndExpect( assert, formSelector, inputValues, expected ) {
	var i, actual;

	for ( i = 0; i < inputValues.length; i++ ) {
		$( formSelector + " input:eq(" + i + ")" ).val( inputValues[ i ] );
	}
	actual = $( formSelector ).valid();
	assert.equal( actual, expected, $.validator.format( "Filled inputs of form '{0}' with {1} values ({2})", formSelector, inputValues.length, inputValues.toString() ) );

}

QUnit.test( "require_from_group", function( assert ) {
	$( "#productInfo" ).validate( {
		rules: {
			partnumber: { require_from_group: [ 2, ".productInfo" ] },
			description: { require_from_group: [ 2, ".productInfo" ] },
			discount: { require_from_group: [ 2, ".productInfo" ] }
		}
	} );

	fillFormWithValuesAndExpect( assert, "#productInfo", [], false );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123 ], false );
	$( "#productInfo input[type='checkbox']" ).attr( "checked", "checked" );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123 ], true );
	$( "#productInfo input[type='checkbox']" ).removeAttr( "checked" );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "widget" ], true );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "widget", "red" ], true );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "widget", "red" ], true );
} );

QUnit.test( "require_from_group preserve other rules", function( assert ) {
	$( "#productInfo" ).validate( {
		rules: {
			partnumber: { require_from_group: [ 2, ".productInfo" ] },
			description: { require_from_group: [ 2, ".productInfo" ] },
			color: { require_from_group: [ 2, ".productInfo" ] },
			supplier: { required: true }
		}
	} );

	fillFormWithValuesAndExpect( assert, "#productInfo", [], false );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123 ], false );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "widget" ], false );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ "", "", "", "Acme" ], false );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "", "", "Acme" ], false );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "widget", "", "Acme" ], true );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "widget", "red", "Acme" ], true );
} );

QUnit.test( "skip_or_fill_minimum", function( assert ) {
	$( "#productInfo" ).validate( {
		rules: {
			partnumber:  { skip_or_fill_minimum: [ 2, ".productInfo" ] },
			description: { skip_or_fill_minimum: [ 2, ".productInfo" ] },
			color:       { skip_or_fill_minimum: [ 2, ".productInfo" ] }
		}
	} );

	fillFormWithValuesAndExpect( assert, "#productInfo", [], true );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123 ], false );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "widget" ], true );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "widget", "red" ], true );
} );

QUnit.test( "skip_or_fill_minimum preserve other rules", function( assert ) {
	$( "#productInfo" ).validate( {
		rules: {
			partnumber:  { skip_or_fill_minimum: [ 2, ".productInfo" ] },
			description: { skip_or_fill_minimum: [ 2, ".productInfo" ] },
			color:       { skip_or_fill_minimum: [ 2, ".productInfo" ] },
			supplier: { required: true }
		}
	} );

	fillFormWithValuesAndExpect( assert, "#productInfo", [], false );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ "", "", "", "Acme" ], true );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "", "", "Acme" ], false );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "widget", "", "Acme" ], true );
	fillFormWithValuesAndExpect( assert, "#productInfo", [ 123, "widget", "red", "Acme" ], true );
} );

QUnit.test( "zipcodeUS", function( assert ) {
	var method = methodTest( "zipcodeUS" );
	assert.ok( method( "12345" ), "Valid zip" );
	assert.ok( method( "12345-2345" ), "Valid zip" );
	assert.ok( method( "90210-4567" ), "Valid zip" );
	assert.ok( !method( "1" ), "Invalid zip" );
	assert.ok( !method( "1234" ), "Invalid zip" );
	assert.ok( !method( "123-23" ), "Invalid zip" );
	assert.ok( !method( "12345-43" ), "Invalid zip" );
	assert.ok( !method( "123456-7890" ), "Invalid zip" );
} );

QUnit.test( "nifES", function( assert ) {
	var method = methodTest( "nifES" );
	assert.ok( method( "11441059P" ), "NIF valid" );
	assert.ok( method( "80054306T" ), "NIF valid" );
	assert.ok( method( "76048581R" ), "NIF valid" );
	assert.ok( method( "28950849J" ), "NIF valid" );
	assert.ok( method( "34048598L" ), "NIF valid" );
	assert.ok( method( "28311529R" ), "NIF valid" );
	assert.ok( method( "34673804Q" ), "NIF valid" );
	assert.ok( method( "92133247P" ), "NIF valid" );
	assert.ok( method( "77149717N" ), "NIF valid" );
	assert.ok( method( "15762034L" ), "NIF valid" );
	assert.ok( method( "05122654W" ), "NIF valid" );
	assert.ok( method( "05122654w" ), "NIF valid: lower case" );
	assert.ok( method( "M1503708Z" ), "NIF valid. Temporary foreign nif" );
	assert.ok( !method( "1144105R" ), "NIF invalid: less than 8 digits without zero" );
	assert.ok( !method( "11441059 R" ), "NIF invalid: white space" );
	assert.ok( !method( "11441059" ), "NIF invalid: no letter" );
	assert.ok( !method( "11441059PR" ), "NIF invalid: two letters" );
	assert.ok( !method( "11440059R" ), "NIF invalid: wrong number" );
	assert.ok( !method( "11441059S" ), "NIF invalid: wrong letter" );
	assert.ok( !method( "114410598R" ), "NIF invalid: > 8 digits" );
	assert.ok( !method( "11441059-R" ), "NIF invalid: dash" );
	assert.ok( !method( "asdasdasd" ), "NIF invalid: all letters" );
	assert.ok( !method( "11.144.059R" ), "NIF invalid: two dots" );
	assert.ok( !method( "05.122.654R" ), "NIF invalid: starts with 0 and dots" );
	assert.ok( !method( "5.122.654-R" ), "NIF invalid:  dots and dash" );
	assert.ok( !method( "05.122.654-R" ), "NIF invalid: starts with zero and dot and dash" );
} );

QUnit.test( "nieES", function( assert ) {
	var method = methodTest( "nieES" );
	assert.ok( method( "X0093999K" ), "NIE valid" );
	assert.ok( method( "X1923000Q" ), "NIE valid" );
	assert.ok( method( "Z9669587R" ), "NIE valid" );
	assert.ok( method( "Z8945005B" ), "NIE valid" );
	assert.ok( method( "Z6663465W" ), "NIE valid" );
	assert.ok( method( "Y7875935J" ), "NIE valid" );
	assert.ok( method( "X3390130E" ), "NIE valid" );
	assert.ok( method( "Y7699182S" ), "NIE valid" );
	assert.ok( method( "Y1524243R" ), "NIE valid" );
	assert.ok( method( "X3744072V" ), "NIE valid" );
	assert.ok( method( "X7436800A" ), "NIE valid" );
	assert.ok( method( "X00002153Z" ), "NIE valid" );
	assert.ok( method( "X02323232W" ), "NIE valid" );
	assert.ok( method( "Z0569549M" ), "NIE valid" );
	assert.ok( method( "X0479906B" ), "NIE valid" );
	assert.ok( method( "y7875935j" ), "NIE valid: lower case" );

	assert.ok( !method( "X0093999 K" ), "NIE invalid: white space" );
	assert.ok( !method( "X 0093999 K" ), "NIE invalid:  white space" );
	assert.ok( !method( "11441059" ), "NIE invalid: no letter" );
	assert.ok( !method( "11441059PR" ), "NIE invalid: two letters" );
	assert.ok( !method( "11440059R" ), "NIE invalid: wrong number" );
	assert.ok( !method( "11441059S" ), "NIE invalid: wrong letter" );
	assert.ok( !method( "114410598R" ), "NIE invalid: > 8 digits" );
	assert.ok( !method( "11441059-R" ), "NIE invalid: dash" );
	assert.ok( !method( "asdasdasd" ), "NIE invalid: all letters" );
	assert.ok( !method( "11.144.059R" ), "NIE invalid: two dots" );
	assert.ok( !method( "05.122.654R" ), "NIE invalid: starts with 0 and dots" );
	assert.ok( !method( "5.122.654-R" ), "NIE invalid: dots and dash" );
	assert.ok( !method( "05.122.654-R" ), "NIE invalid: starts with zero and dot and dash" );
} );

QUnit.test( "cifES", function( assert ) {
	var method = methodTest( "cifES" );
	assert.ok( method( "A58818501" ), "CIF valid" );
	assert.ok( method( "A79082244" ), "CIF valid" );
	assert.ok( method( "A60917978" ), "CIF valid" );
	assert.ok( method( "A39000013" ), "CIF valid" );
	assert.ok( method( "A28315182" ), "CIF valid" );
	assert.ok( method( "A75409573" ), "CIF valid" );
	assert.ok( method( "A34396994" ), "CIF valid" );
	assert.ok( method( "A08153538" ), "CIF valid" );
	assert.ok( method( "A09681396" ), "CIF valid" );
	assert.ok( method( "A06706303" ), "CIF valid" );
	assert.ok( method( "A66242173" ), "CIF valid" );
	assert.ok( method( "A61416699" ), "CIF valid" );
	assert.ok( method( "A99545444" ), "CIF valid" );
	assert.ok( method( "A10407252" ), "CIF valid" );
	assert.ok( method( "A76170885" ), "CIF valid" );
	assert.ok( method( "A83535047" ), "CIF valid" );
	assert.ok( method( "A46031969" ), "CIF valid" );
	assert.ok( method( "A97252910" ), "CIF valid" );
	assert.ok( method( "A79082244" ), "CIF valid" );
	assert.ok( !method( "A7908224D" ), "CIF invalid: digit control must be a number (4)" );

	assert.ok( method( "B71413892" ), "CIF valid" );
	assert.ok( method( "B37484755" ), "CIF valid" );
	assert.ok( method( "B15940893" ), "CIF valid" );
	assert.ok( method( "B55429161" ), "CIF valid" );
	assert.ok( method( "B93337087" ), "CIF valid" );
	assert.ok( method( "B43522192" ), "CIF valid" );
	assert.ok( method( "B38624334" ), "CIF valid" );
	assert.ok( method( "B21920426" ), "CIF valid" );
	assert.ok( method( "B74940156" ), "CIF valid" );
	assert.ok( method( "B46125746" ), "CIF valid" );
	assert.ok( method( "B67077537" ), "CIF valid" );
	assert.ok( method( "B21283155" ), "CIF valid" );
	assert.ok( method( "B57104176" ), "CIF valid" );
	assert.ok( method( "B25060179" ), "CIF valid" );
	assert.ok( method( "B06536338" ), "CIF valid" );
	assert.ok( method( "B50964592" ), "CIF valid" );
	assert.ok( method( "B15653330" ), "CIF valid" );
	assert.ok( method( "B83524710" ), "CIF valid" );
	assert.ok( !method( "B8352471J" ), "CIF invalid: digit control must be a number (0)" );

	assert.ok( !method( "C27827551" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C27827552" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C27827553" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C27827554" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C27827555" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C27827556" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C27827557" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C27827558" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C27827550" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C2782755A" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C2782755B" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C2782755C" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C2782755D" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C2782755E" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C2782755F" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C2782755G" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C2782755H" ), "CIF invalid: wrong digit control" );
	assert.ok( !method( "C2782755J" ), "CIF invalid: wrong digit control" );
	assert.ok( method( "C2782755I" ), "CIF valid. Digit control can be either a number or letter" );
	assert.ok( method( "C27827559" ), "CIF valid. Digit control can be either a number or letter" );

	assert.ok( method( "E48911572" ), "CIF valid" );
	assert.ok( method( "E93928703" ), "CIF valid" );
	assert.ok( method( "E17472952" ), "CIF valid" );
	assert.ok( !method( "E1747295B" ), "CIF invalid: digit control must be a number (2)" );

	assert.ok( method( "F41190612" ), "CIF valid" );
	assert.ok( method( "F4119061B" ), "CIF valid. Digit control can be either a number or letter" );

	assert.ok( method( "G72102064" ), "CIF valid" );
	assert.ok( method( "G32937757" ), "CIF valid" );
	assert.ok( method( "G8984953C" ), "CIF valid" );
	assert.ok( method( "G3370454E" ), "CIF valid" );
	assert.ok( method( "G33704545" ), "CIF valid. Digit control can be either a number or letter" );

	assert.ok( method( "H48911572" ), "CIF valid" );
	assert.ok( method( "H93928703" ), "CIF valid" );
	assert.ok( method( "H17472952" ), "CIF valid" );
	assert.ok( !method( "H1747295B" ), "CIF invalid: digit control must be a number (2)" );

	assert.ok( !method( "I48911572" ), "CIF invalid: starts with I" );

	assert.ok( method( "J85081081" ), "CIF valid" );
	assert.ok( method( "J8508108A" ), "CIF valid" );

	assert.ok( method( "K3902238I" ), "CIF valid" );
	assert.ok( !method( "K39022389" ), "CIF invalid. Digit control must be a letter (I)" );

	assert.ok( method( "M9916080F" ), "CIF valid" );
	assert.ok( method( "M1566151E" ), "CIF valid" );
	assert.ok( method( "M15661515" ), "CIF valid" );
	assert.ok( method( "M4778730D" ), "CIF valid" );

	assert.ok( method( "N1172218H" ), "CIF valid" );
	assert.ok( method( "N4094938J" ), "CIF valid" );
	assert.ok( method( "N40949380" ), "CIF valid. Digit control can be either a number or letter" );

	assert.ok( method( "P5141387J" ), "CIF valid" );
	assert.ok( method( "P9803881C" ), "CIF valid" );
	assert.ok( !method( "P98038813" ), "CIF invalid: digit control must be a letter (C)" );

	assert.ok( method( "Q5141387J" ), "CIF valid" );
	assert.ok( method( "Q9803881C" ), "CIF valid" );
	assert.ok( !method( "Q98038813" ), "CIF invalid: digit control must be a letter (C)" );

	assert.ok( method( "S5141387J" ), "CIF valid" );
	assert.ok( method( "S9803881C" ), "CIF valid" );
	assert.ok( !method( "S98038813" ), "CIF invalid: digit control must be a letter (C)" );
	assert.ok( method( "s98038813" ), "CIF valid: lower case" );

	assert.ok( !method( "X48911572" ), "CIF invalid: starts with X" );
	assert.ok( !method( "Y48911572" ), "CIF invalid: starts with Y" );
	assert.ok( !method( "Z48911572" ), "CIF invalid: starts with Z" );
	assert.ok( !method( "Z98038813" ), "CIF invalid: wrong letter" );
	assert.ok( !method( "B 43522192" ), "CIF invalid: white spaces" );
	assert.ok( !method( "43522192" ), "CIF invalid: missing letter" );
	assert.ok( !method( "BB43522192" ), "CIF invalid: two letters" );
	assert.ok( !method( "B53522192" ), "CIF invalid: wrong number" );
	assert.ok( !method( "B433522192" ), "CIF invalid: > 8 digits" );
	assert.ok( !method( "B3522192" ), "CIF invalid: < 8 digits" );
	assert.ok( !method( "B-43522192" ), "CIF invalid: dash" );
	assert.ok( !method( "Basdasdas" ), "CIF invalid: all letters" );
	assert.ok( !method( "B43.522.192" ), "CIF invalid: dots" );
	assert.ok( !method( "B-43.522.192" ), "CIF invalid: dots and dash" );
} );

QUnit.test( "nipPL", function( assert ) {
	var method = methodTest( "nipPL" );
	assert.ok( method( "3514242002" ), "NIP valid" );
	assert.ok( method( "8117892840" ), "NIP valid" );
	assert.ok( method( "7249598309" ), "NIP valid" );
	assert.ok( method( "6853539166" ), "NIP valid" );
	assert.ok( method( "5715750580" ), "NIP valid" );
	assert.ok( method( "3496120813" ), "NIP valid" );
	assert.ok( method( "1565710251" ), "NIP valid" );
	assert.ok( method( "8190761165" ), "NIP valid" );
	assert.ok( method( "9487499667" ), "NIP valid" );
	assert.ok( method( "9283384684" ), "NIP valid" );
	assert.ok( method( "3887569138" ), "NIP valid" );
	assert.ok( method( "3962898856" ), "NIP valid" );
	assert.ok( !method( "76355753" ), "NIP invalid: too short" );
	assert.ok( !method( "454" ), "NIP invalid: too short" );
	assert.ok( !method( "234565545" ), "NIP invalid: too short" );
	assert.ok( !method( "543455" ), "NIP invalid: too short" );
	assert.ok( !method( "6345634563456" ), "NIP invalid: too long" );
	assert.ok( !method( "53453453455335" ), "NIP invalid: too long" );
	assert.ok( !method( "543453760902" ), "NIP invalid: too long" );
	assert.ok( !method( "43090012454" ), "NIP invalid: too long" );
	assert.ok( !method( "3958250194" ), "NIP invalid: wrong checksum" );
	assert.ok( !method( "3928541049" ), "NIP invalid: wrong checksum" );
	assert.ok( !method( "5920397295" ), "NIP invalid: wrong checksum" );
	assert.ok( !method( "9502947712" ), "NIP invalid: wrong checksum" );
} );

QUnit.test( "phonePL", function( assert ) {
    var method = methodTest( "phonePL" );
	assert.ok( method( "+48 123 456 789" ), "Valid phone PL" );
	assert.ok( method( "00 48 123 456 789" ), "Valid phone PL" );
	assert.ok( method( "(+48) 123 456 789" ), "Valid phone PL" );
	assert.ok( method( "(48) 123 456 789" ), "Valid phone PL" );
	assert.ok( method( " 13 34 56 78  9 " ), "Valid phone PL" );
	assert.ok( method( "13 345 67 89" ), "Valid phone PL" );
	assert.ok( !method( "100 000 000" ), "Invalid phone PL: cannot start with 10x xxx xxx" );
	assert.ok( !method( "111 111 111" ), "Invalid phone PL: cannot start with 11x xxx xxx" );
	assert.ok( !method( "123 456 78" ), "Invalid phone PL: too short" );
	assert.ok( !method( "123 4567890" ), "Invalid phone PL: too long" );
	assert.ok( !method( "700 123 456" ), "Invalid phone PL: intelligent network, premium rate" );
	assert.ok( !method( "800 123 456" ), "Invalid phone PL: intelligent network, freephone" );
	assert.ok( !method( "980 000 000" ), "Invalid phone PL: cannot start with 98x xxx xxx" );
	assert.ok( !method( "990 000 000" ), "Invalid phone PL: cannot start with 99x xxx xxx" );
} );

QUnit.test( "maxWords", function( assert ) {
	var method = methodTest( "maxWords" ),
		maxWords = 6;

	assert.ok( method( "I am a sentence", maxWords ), "Max Words" );
	assert.ok( !method( "I'm way too long for this sentence!", maxWords ), "Too many words" );
	assert.ok( method( "Don’t “count” me as too long", maxWords ), "Right amount of words with smartquotes" );
	assert.ok( !method( "But you can “count” me as too long", maxWords ), "Too many words with smartquotes" );
	assert.ok( method( "<div>Don’t “count” me as too long</div>", maxWords ), "Right amount of words with smartquotes w/ HTML" );
	assert.ok( !method( "<div>But you can “count” me as too long</div>", maxWords ), "Too many words with smartquotes w/ HTML" );
} );

QUnit.test( "minWords", function( assert ) {
	var method = methodTest( "minWords" ),
		minWords = 6;

	assert.ok( !method( "I am a short sentence", minWords ), "Max Words" );
	assert.ok( method( "I'm way too long for this sentence!", minWords ), "Too many words" );
	assert.ok( !method( "Don’t “count” me as short.", minWords ), "Right amount of words with smartquotes" );
	assert.ok( method( "But you can “count” me as too short", minWords ), "Too many words with smartquotes" );
	assert.ok( !method( "<div>“Count” me as too short.</div>", minWords ), "Right amount of words with smartquotes w/ HTML" );
	assert.ok( method( "<div>But you can “count” me as too long</div>", minWords ), "Too many words with smartquotes w/ HTML" );
} );

QUnit.test( "rangeWords", function( assert ) {
	var method = methodTest( "rangeWords" ),
		rangeWords = [ 3, 6 ];

	assert.ok( !method( "I'm going to be longer than “six words!”", rangeWords ), "Longer than 6 with smartquotes" );
	assert.ok( method( "I'm just the right amount!", rangeWords ), "In between" );
	assert.ok( method( "Super short sentence’s.", rangeWords ), "Low end" );
	assert.ok( !method( "I", rangeWords ), "Too short" );
	assert.ok( method( "<div>“Count” me as perfect.</div>", rangeWords ), "Right amount of words with smartquotes w/ HTML" );
	assert.ok( !method( "<div>But you can “count” me as too long</div>", rangeWords ), "Too many words with smartquotes w/ HTML" );
} );

QUnit.test( "currency", function( assert ) { // Works with any symbol
	var method = methodTest( "currency" );
	assert.ok( method( "£9", "£" ), "Symbol no decimal" );
	assert.ok( method( "£9.9", "£" ), "£, one decimal" );
	assert.ok( method( "£9.99", "£" ), "£, two decimal" );
	assert.ok( method( "£9.90", "£" ), "Valid currency" );
	assert.ok( method( "£9,999.9", "£" ), "£, thousand, comma separator, one decimal" );
	assert.ok( method( "£9,999.99", "£" ), "£, thousand, comma separator, two decimal" );
	assert.ok( method( "£9,999,999.9", "£" ), "£, million, comma separators, one decimal" );
	assert.ok( method( "9", [ "£", false ] ), "Valid currency" );
	assert.ok( method( "9.9", [ "£", false ] ), "Valid currency" );
	assert.ok( method( "9.99", [ "£", false ] ), "Valid currency" );
	assert.ok( method( "9.90", [ "£", false ] ), "Valid currency" );
	assert.ok( method( "9,999.9", [ "£", false ] ), "Valid currency" );
	assert.ok( method( "9,999.99", [ "£", false ] ), "Valid currency" );
	assert.ok( method( "9,999,999.9", [ "£", false ] ), "Valid currency" );
	assert.ok( !method( "9,", "£" ), "Invalid currency" );
	assert.ok( !method( "9,99.99", "£" ), "Invalid currency" );
	assert.ok( !method( "9,", "£" ), "Invalid currency" );
	assert.ok( !method( "9.999", "£" ), "Invalid currency" );
	assert.ok( !method( "9.999", "£" ), "Invalid currency" );
	assert.ok( !method( "9.99,9", "£" ), "Invalid currency" );
} );

QUnit.test( "postalCodeCA", function( assert ) {
	var method = methodTest( "postalCodeCA" );
	assert.ok( method( "H0H0H0" ), "Valid Canadian postal code: all upper case with no space" );
	assert.ok( method( "H0H 0H0" ), "Valid Canadian postal code: all upper case with one space" );
	assert.ok( method( "H0H  0H0" ), "Valid Canadian postal code: all upper case with multiple spaces" );
	assert.ok( method( "h0h 0h0" ), "Valid Canadian postal code: all lower case with space" );
	assert.ok( method( "h0h0h0" ), "Valid Canadian postal code: all lower case with no space" );
	assert.ok( !method( "H0H-0H0" ), "Invalid Canadian postal code: dash used as separator" );
	assert.ok( !method( "H0H 0H" ), "Invalid Canadian postal code: too short" );
	assert.ok( !method( "Z0H 0H0" ), "Invalid Canadian postal code: only 'ABCEGHJKLMNPRSTVXY' are valid first characters for the Forward Sorting Area" );
	assert.ok( !method( "H0D 0H0" ), "Invalid Canadian postal code: only 'ABCEGHJKLMNPRSTVWXYZ' are valid third characters for the Forward Sorting Area" );
	assert.ok( !method( "H0H 0D0" ), "Invalid Canadian postal code: only 'ABCEGHJKLMNPRSTVWXYZ' are valid second characters for the Local Delivery Unit" );
} );

QUnit.test( "stateUS", function( assert ) {
	var method = methodTest( "stateUS" );
	assert.ok( method( "AZ" ), "Valid US state" );
	assert.ok( method( "OH" ), "Valid US state" );
	assert.ok( method( "DC" ), "Valid US state" );
	assert.ok( method( "PR", { includeTerritories: true } ), "Valid US territory" );
	assert.ok( method( "AA", { includeMilitary: true } ), "Valid US military zone" );
	assert.ok( method( "me", { caseSensitive: false } ), "Valid US state" );
	assert.ok( !method( "az", { caseSensitive: true } ), "Must be capital letters" );
	assert.ok( !method( "mp", { caseSensitive: false, includeTerritories: false } ), "US territories not allowed" );
} );

QUnit.test( "postalcodeBR", function( assert ) {
	var method = methodTest( "postalcodeBR" );
	assert.ok( method( "99999-999" ), "Valid BR Postal Code" );
	assert.ok( method( "99999999" ), "Valid BR Postal Code" );
	assert.ok( method( "99.999-999" ), "Valid BR Postal Code" );
	assert.ok( !method( "99.999999" ), "Invalid BR Postal Code" );
} );

QUnit.test( "cpfBR", function( assert ) {
	var method = methodTest( "cpfBR" );
	assert.ok( method( "11144477735" ), "Valid CPF Number" );
	assert.ok( method( "263.946.533-30" ), "Valid CPF Number" );
	assert.ok( method( "325 861 044 47" ), "Valid CPF Number" );
	assert.ok( method( "859-684-732-40" ), "Valid CPF Number" );
	assert.ok( !method( "99999999999" ), "Invalid CPF Number: dump data" );
	assert.ok( !method( "1114447773" ), "Invalid CPF Number: < 11 digits" );
	assert.ok( !method( "111444777355" ), "Invalid CPF Number: > 11 digits" );
	assert.ok( !method( "11144477715" ), "Invalid CPF Number: 1st check number failed" );
	assert.ok( !method( "11144477737" ), "Invalid CPF Number: 2nd check number failed" );
} );

QUnit.test( "cnpjBR", function( assert ) {
	var method = methodTest( "cnpjBR" );
	assert.ok( method( "18517604000175" ), "Valid CNPJ Number" );
	assert.ok( method( "18.517.604/0001-75" ), "Valid CNPJ Number" );
	assert.ok( method( "06994660000111" ), "Valid CNPJ Number" );
	assert.ok( method( "06.994.660/0001-11" ), "Valid CNPJ Number" );
	assert.ok( !method( "00000000000000" ), "Invalid CNPJ Number: dump data" );
	assert.ok( !method( "11111111111111" ), "Invalid CNPJ Number: dump data" );
	assert.ok( !method( "22222222222222" ), "Invalid CNPJ Number: dump data" );
	assert.ok( !method( "99999999999999" ), "Invalid CNPJ Number: dump data" );
	assert.ok( !method( "8517604000175" ), "Invalid CNPJ Number: < 14 digits" );
	assert.ok( !method( "8.517.604/0001-75" ), "Invalid CNPJ Number: < 14 digits" );
	assert.ok( !method( "1185176040001750" ), "Invalid CNPJ Number: > 14 digits" );
	assert.ok( !method( "18.517.604/0001-750" ), "Invalid CNPJ Number: > 14 digits" );
	assert.ok( !method( "18517604000174" ), "Invalid CNPJ Number" );
	assert.ok( !method( "18.517.604/0001-74" ), "Invalid CNPJ Number" );
	assert.ok( !method( "06994660000211" ), "Invalid CNPJ Number" );
	assert.ok( !method( "06.994.660/0002-11" ), "Invalid CNPJ Number" );
} );

QUnit.test( "nisBR", function( assert ) {
	var method = methodTest( "nisBR" );
	assert.ok( method( "10757995753" ), "Valid NIS/PIS Number" );
	assert.ok( method( "107.57995.75-3" ), "Valid NIS/PIS Number" );
	assert.ok( method( "107.579.957-53" ), "Valid NIS/PIS Number" );
	assert.ok( method( "107-579-957-53" ), "Valid NIS/PIS Number" );
	assert.ok( method( "107.579.957.5-3" ), "Valid NIS/PIS Number" );
	assert.ok( !method( "99999999999" ), "Invalid NIS/PIS Number: dump data" );
	assert.ok( !method( "1075799575" ), "Invalid  NIS/PIS Number: < 11 digits" );
	assert.ok( !method( "111444777355" ), "Invalid NIS/PIS Number: > 11 digits" );
	assert.ok( !method( "10757995752" ), "Invalid NIS/PIS Number: check number failed" );
} );

QUnit.test( "file accept - image wildcard", function( assert ) {
	var input = acceptFileDummyInput( "test.png", "image/png" ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.accept, new $.validator( {}, $form[ 0 ] ), null, input, "image/*" );
	assert.ok( proxy(), "the selected file for upload has specified mime type" );
} );

QUnit.test( "file accept - specified mime type", function( assert ) {
	var input = acceptFileDummyInput( "test.kml", "application/vnd.google-earth.kml+xml" ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.accept, new $.validator( {}, $form[ 0 ] ), null, input, "application/vnd.google-earth.kml+xml" );
	assert.ok( proxy(), "the selected file for upload has specified mime type" );
} );

QUnit.test( "file accept - multiple mimetypes", function( assert ) {
	var input = acceptFileDummyInput( "test.png", "image/png" ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.accept, new $.validator( {}, $form[ 0 ] ), null, input, "image/png,video/jpeg" );
	assert.ok( proxy(), "the selected file for upload has specified mime type" );
} );

QUnit.test( "file accept - multiple mimetypes with wildcard", function( assert ) {
	var input = acceptFileDummyInput( "test.mp3", "audio/mpeg" ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.accept, new $.validator( {}, $form[ 0 ] ), null, input, "image/*,audio/*" );
	assert.ok( proxy(), "the selected file for upload has specified mime type" );
} );

QUnit.test( "file accept - invalid mime type", function( assert ) {
	var input = acceptFileDummyInput( "test.kml", "foobar/vnd.google-earth.kml+xml" ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.accept, new $.validator( {}, $form[ 0 ] ), null, input, "application/vnd.google-earth.kml+xml" );
	assert.equal( proxy(), false, "the selected file for upload has invalid mime type" );
} );

QUnit.test( "file size - below max", function( assert ) {
	var input = acceptFileDummyInput( "test.png", "image/png" ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.maxsize, new $.validator( {}, $form[ 0 ] ), null, input, "500001" );
	assert.ok( proxy(), "the selected file for upload is smaller than max" );
} );

QUnit.test( "file size - over max", function( assert ) {
	var input = acceptFileDummyInput( "test.png", "image/png" ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.maxsize, new $.validator( {}, $form[ 0 ] ), null, input, "500000" );
	assert.equal( proxy(), false, "the selected file for upload is greater than max" );
} );

QUnit.test( "file maxsize - valid size", function( assert ) {
	var selectedFiles = [ { name: "test.jpg", size: 500000 } ],
		input = fileDummyInput( selectedFiles ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.maxsize, new $.validator( {}, $form[ 0 ] ), null, input, 500000 );
	assert.ok( proxy(), "the size of the file does not exceed the maximum" );
} );

QUnit.test( "file maxsize - valid size for each file", function( assert ) {
	var selectedFiles = [ { name: "test1.jpg", size: 500000 }, { name: "test2.jpg", size: 500000 } ],
		input = fileDummyInput( selectedFiles ),
	$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.maxsize, new $.validator( {}, $form[ 0 ] ), null, input, 500000 );
	assert.ok( proxy(), "the size of the each file does not exceed the maximum" );
} );

QUnit.test( "file maxsize - too big", function( assert ) {
	var selectedFiles = [ { name: "test.jpg", size: 500001 } ],
		input = fileDummyInput( selectedFiles ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.maxsize, new $.validator( {}, $form[ 0 ] ), null, input, 500000 );
	assert.equal( proxy(), false, "the size of the file exceeds the maximum" );
} );

QUnit.test( "file maxsize - second file too big", function( assert ) {
	var selectedFiles = [ { name: "test1.jpg", size: 500000 }, { name: "test2.jpg", size: 500001 } ],
		input = fileDummyInput( selectedFiles ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.maxsize, new $.validator( {}, $form[ 0 ] ), null, input, 500000 );
	assert.equal( proxy(), false, "the size of the second file exceeds the maximum" );
} );

QUnit.test( "file maxsizetotal - valid size", function( assert ) {
	var selectedFiles = [ { name: "test1.jpg", size: 250000 }, { name: "test2.jpg", size: 250000 } ],
		input = fileDummyInput( selectedFiles ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.maxsizetotal, new $.validator( {}, $form[ 0 ] ), null, input, 500000 );
	assert.ok( proxy(), "the size of the files together does not exceed the maximum" );
} );

QUnit.test( "file maxsizetotal - too big", function( assert ) {
	var selectedFiles = [ { name: "test1.jpg", size: 250000 }, { name: "test2.jpg", size: 250001 } ],
		input = fileDummyInput( selectedFiles ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.maxsizetotal, new $.validator( {}, $form[ 0 ] ), null, input, 500000 );
	assert.equal( proxy(), false, "the size of the files together exceeds the maximum" );
} );

QUnit.test( "file maxfiles - valid number", function( assert ) {
	var selectedFiles = [ { name: "test1.jpg", size: 500000 }, { name: "test2.jpg", size: 500000 } ],
		input = fileDummyInput( selectedFiles ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.maxfiles, new $.validator( {}, $form[ 0 ] ), null, input, 2 );
	assert.ok( proxy(), "the number of files does not exceed the maximum" );
} );

QUnit.test( "file maxfiles - too many", function( assert ) {
	var selectedFiles = [ { name: "test1.jpg", size: 500000 }, { name: "test2.jpg", size: 500000 }, { name: "test3.jpg", size: 500000 } ],
		input = fileDummyInput( selectedFiles ),
		$form = $( "<form />" ),
		proxy = $.proxy( $.validator.methods.maxfiles, new $.validator( {}, $form[ 0 ] ), null, input, 2 );
	assert.equal( proxy(), false, "the number of files exceeds the maximum" );
} );

QUnit.test( "mrtd", function( assert ) {
	var method = methodTest( "mrtd" );
	assert.ok( method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122F1204159ZE184226B<<<<<10" ), "Valid passport" );
	assert.ok( method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122<1204159ZE184226B<<<<<10" ), "Valid passport: Unspecified sex" );
	assert.ok( method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122F1204159<<<<<<<<<<<<<<08" ), "Valid passport: No personal number and check digit '0'" );
	assert.ok( method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122F1204159<<<<<<<<<<<<<<<8" ), "Valid passport: No personal number and check digit '<'" );
	assert.ok( method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO74<<<<1F1204159ZE184226B<<<<<18" ), "Valid passport: Birth date not fully known" );
	assert.ok( method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122<1204159ZE184226B<<<<<10" ), "Valid passport: Unspecified gender" );
	assert.ok( !method( "X<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122F1204159ZE184226B<<<<<10" ), "Invalid passport: Does not start with 'P'" );
	assert.ok( !method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122F1204159ZE184226B<<<<10" ), "Invalid passport: Too short" );
	assert.ok( !method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122F1204159ZE184226B<<<<<<10" ), "Invalid passport: Too long" );
	assert.ok( !method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C35UTO7408122F1204159ZE184226B<<<<<10" ), "Invalid passport: Check digit for document number" );
	assert.ok( !method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408121F1204159ZE184226B<<<<<10" ), "Invalid passport: Check digit for birth date" );
	assert.ok( !method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122X1204159ZE184226B<<<<<10" ), "Invalid passport: Sex not 'M', 'F', or '<'" );
	assert.ok( !method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122F1204158ZE184226B<<<<<10" ), "Invalid passport: Check digit for expiration date" );
	assert.ok( !method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122F1204159ZE184226B<<<<<00" ), "Invalid passport: Check digit for personal number" );
	assert.ok( !method( "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L898902C36UTO7408122F1204159ZE184226B<<<<<19" ), "Invalid passport: Composite check digit" );

	assert.ok( method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L8988901C4XXX4009078F96121096ZE184226B<<<<<<" ), "Valid format-A visa" );
	assert.ok( method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L8988901C4XXX40<<<<8F96121096ZE184226B<<<<<<" ), "Valid format-A visa: Birth date not fully known" );
	assert.ok( method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L8988901C4XXX4009078<96121096ZE184226B<<<<<<" ), "Valid format-A visa: Unspecified sex" );
	assert.ok( !method( "X<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L8988901C4XXX4009078F96121096ZE184226B<<<<<<" ), "Invalid format-A visa: Does not start with 'V'" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L8988901C4XXX4009078F96121096ZE184226B<<<<<" ), "Invalid format-A visa: Too short" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L8988901C4XXX4009078F96121096ZE184226B<<<<<<<" ), "Invalid format-A visa: Too long" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L8988901C3XXX4009078F96121096ZE184226B<<<<<<" ), "Invalid format-A visa: Check digit for visa number" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L8988901C4XXX4009077F96121096ZE184226B<<<<<<" ), "Invalid format-A visa: Check digit for birth date" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L8988901C4XXX4009078X96121096ZE184226B<<<<<<" ), "Invalid format-A visa: Sex not 'M', 'F', or '<'" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<L8988901C4XXX4009078F96121086ZE184226B<<<<<<" ), "Invalid format-A visa: Check digit for expiration date" );

	assert.ok( method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<L8988901C4XXX4009078F96121096ZE18422" ), "Valid format-B visa" );
	assert.ok( method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<L8988901C4XXX40<<<<8F96121096ZE18422" ), "Valid format-B visa: Birth date not fully known" );
	assert.ok( method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<L8988901C4XXX4009078<96121096ZE18422" ), "Valid format-B visa: Unspecified sex" );
	assert.ok( !method( "X<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<L8988901C4XXX4009078F9612109<<<<<<<<" ), "Invalid format-B visa: Does not start with 'V'" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<L8988901C4XXX4009078F9612109<<<<<<<" ), "Invalid format-B visa: Too short" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<L8988901C4XXX4009078F9612109<<<<<<<<<" ), "Invalid format-B visa: Too long" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<L8988901C3XXX4009078F9612109<<<<<<<<" ), "Invalid format-B visa: Check digit for visa number" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<L8988901C4XXX4009077F9612109<<<<<<<<" ), "Invalid format-B visa: Check digit for birth date" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<L8988901C4XXX4009078X9612109<<<<<<<<" ), "Invalid format-B visa: Sex not 'M', 'F', or '<'" );
	assert.ok( !method( "V<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<L8988901C4XXX4009078F9612108<<<<<<<<" ), "Invalid format-B visa: Check digit for expiration date" );

	assert.ok( method( "A<UTOD231458907<<<<<<<<<<<<<<<7408122F1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Valid size 1 official travel document: 'A' type" );
	assert.ok( method( "C<UTOD231458907<<<<<<<<<<<<<<<7408122F1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Valid size 1 official travel document: 'C' type" );
	assert.ok( method( "I<UTOD231458907<<<<<<<<<<<<<<<7408122F1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Valid size 1 official travel document: 'I' type" );
	assert.ok( method( "I<UTOD231458907<<<<<<<<<<<<<<<74<<<<1F1204159UTO<<<<<<<<<<<4ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Valid size 1 official travel document: Birth date not fully known" );
	assert.ok( method( "I<UTOD231458907<<<<<<<<<<<<<<<7408122<1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Valid size 1 official travel document: Unspecified sex" );
	assert.ok( !method( "X<UTOD231458907<<<<<<<<<<<<<<<7408122F1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Invalid size 1 official travel document: Does not begin with 'A', 'C', or 'I'" );
	assert.ok( !method( "A<UTOD231458907<<<<<<<<<<<<<<<7408122F1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<" ), "Invalid size 1 official travel document: Too short" );
	assert.ok( !method( "A<UTOD231458907<<<<<<<<<<<<<<<7408122F1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<<" ), "Invalid size 1 official travel document: Too long" );
	assert.ok( !method( "IVUTOD231458907<<<<<<<<<<<<<<<7408122F1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Invalid size 1 official travel document: 'V' cannot be used in document type" );
	assert.ok( !method( "I<UTOD231458906<<<<<<<<<<<<<<<7408122F1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Invalid size 1 official travel document: Check digit for document number" );
	assert.ok( !method( "I<UTOD231458907<<<<<<<<<<<<<<<7408121F1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Invalid size 1 official travel document: Check digit for birth date" );
	assert.ok( !method( "I<UTOD231458907<<<<<<<<<<<<<<<7408122X1204159UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Invalid size 1 official travel document: Sex not 'M', 'F', or '<'" );
	assert.ok( !method( "I<UTOD231458907<<<<<<<<<<<<<<<7408122F1204158UTO<<<<<<<<<<<6ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Invalid size 1 official travel document: Check digit for expiration date" );
	assert.ok( !method( "I<UTOD231458907<<<<<<<<<<<<<<<7408122F1204159UTO<<<<<<<<<<<5ERIKSSON<<ANNA<MARIA<<<<<<<<<<" ), "Invalid size 1 official travel document: Composite check digit" );

	assert.ok( method( "A<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122F1204159<<<<<<<6" ), "Valid size 2 official travel document: 'A' type" );
	assert.ok( method( "C<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122F1204159<<<<<<<6" ), "Valid size 2 official travel document: 'C' type" );
	assert.ok( method( "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122F1204159<<<<<<<6" ), "Valid size 2 official travel document: 'I' type" );
	assert.ok( method( "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO74<<<<1F1204159<<<<<<<4" ), "Valid size 2 official travel document: Birth date not fully known" );
	assert.ok( method( "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122<1204159<<<<<<<6" ), "Valid size 2 official travel document: Unspecified sex" );
	assert.ok( !method( "X<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122F1204159<<<<<<<6" ), "Invalid size 2 official travel document: Does not begin with 'A', 'C', or 'I'" );
	assert.ok( !method( "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122F1204159<<<<<<6" ), "Invalid size 2 official travel document: Too short" );
	assert.ok( !method( "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122F1204159<<<<<<<<6" ), "Invalid size 2 official travel document: Too long" );
	assert.ok( !method( "IVUTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122F1204159<<<<<<<6" ), "Invalid size 2 official travel document: 'V' cannot be used in document type" );
	assert.ok( !method( "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458906UTO7408122F1204159<<<<<<<6" ), "Invalid size 2 official travel document: Check digit for document number" );
	assert.ok( !method( "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408121F1204159<<<<<<<6" ), "Invalid size 2 official travel document: Check digit for birth date" );
	assert.ok( !method( "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122X1204159<<<<<<<6" ), "Invalid size 2 official travel document: Sex not 'M', 'F', or '<'" );
	assert.ok( !method( "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122F1204158<<<<<<<6" ), "Invalid size 2 official travel document: Check digit for expiration date" );
	assert.ok( !method( "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<D231458907UTO7408122F1204159<<<<<<<5" ), "Invalid size 2 official travel document: Composite check digit" );
} );
