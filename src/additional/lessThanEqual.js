$.validator.addMethod( "lessThanEqual", function( value, element, param ) {
    var target = $( param );

    if ( this.settings.onfocusout && target.not( ".validate-custom-blur" ).length ) {
        target.addClass( "validate-custom-blur" ).on( "blur.validate-custom-blur", function() {
            $( element ).valid();
        } );
    }

    return value <= target.val();
}, "Please enter a lesser value." );
