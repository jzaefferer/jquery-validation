/*
 * The Número de Identificação Fiscal ( NIF ) is the way tax identification used in Portugal
 */
jQuery.validator.addMethod( "nifPT", function( value, element )
{
	 "use strict";

    if ( this.optional( element ) )
    {
        return true;
    }

    var nif = value;
    if ( nif.length === 9 )
    {
        var added = ( ( nif[ 7 ] * 2 ) +
				      ( nif[ 6 ] * 3 ) +
					  ( nif[ 5 ] * 4 ) +
					  ( nif[ 4 ] * 5 ) +
					  ( nif[ 3 ] * 6 ) +
					  ( nif[ 2 ] * 7 ) +
					  ( nif[ 1 ] * 8 ) +
					  ( nif[ 0 ] * 9 ) );

        var mod = added % 11;

        var control;

        if ( mod === 0 || mod === 1 )
		{
            control = 0;
		} else
		{
            control = 11 - mod;
		}

        if ( nif[ 8 ] === control )
		{
            return true;
		} else
		{
            return false;
		}
    } else
	{
        return false;
	}
}, "Please specify a valid NIF number." );
