$.validator.addMethod( "greaterThanEqual", function( value, element, param ) {
    var target = $( param );

    if ( this.settings.onfocusout && target.not( ".validate-custom-blur" ).length ) {
        target.addClass( "validate-custom-blur" ).on( "blur.validate-custom-blur", function() {
            $( element ).valid();
        } );
    }

    return value >= target.val();
}, "Please enter a greater value." );
