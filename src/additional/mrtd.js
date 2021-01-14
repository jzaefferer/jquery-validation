/*
Validate the Machine Readable Zone (MRZ) of a Machine Readable Travel Document
MRTD) conforming with the specifications of ICAO Doc 9303.

This method can validate:
  * a Machine Readable Passport (MRP) and other TD3 sized MRTDs;
  * a Machine Readable Official Travel Document (MROTD); and
  * a Machine Readable Visa (MRV).

This method does not validate:
  * if a date (birthdate or expiry date) is a valid date.
  * if a ISO 3166-1 alpha-3 code (issuing state or nationality) is assigned.

References:
	https://www.icao.int/publications/pages/publication.aspx?docnum=9303
	https://en.wikipedia.org/wiki/Machine-readable_passport
*/
$.validator.addMethod( "mrtd", function( value, element ) {
	if ( this.optional( element ) ) {
		return true;
	}

	//Remove carriage return and newline characters from value.
	value = value.replace( /([\r\n])+/g, "" );

	//Quick test of valid characters and length.
	if ( !/^([A-Z0-9<]){72,90}$/g.test( value ) ) {
		return false;
	}

	var re,
		match,
		documentType;

	//Determine the type of travel document based on the length of the input
	//value and its first character.  Each document type has its own regex.
	switch ( value.length ) {
		case 72:  //Official travel document or visa (2 lines of 36 chars each)
			switch ( value.charAt( 0 ) ) {
				case "A":
				case "C":
				case "I": //Size 2 official travel document
					documentType = "TD2";
					/*
					  [ACI][A-UW-Z<]{1} #Type of document
					  [A-Z<]{3}		    #Issuing state
					  [A-Z<]{31}        #Name

					  ([0-9A-Z<]{9})    #Document number
					  ([0-9]{1})	    #Check digit for document number
					  [A-Z<]{3}		    #Nationality
					  ([0-9<]{6})	    #Date of birth (YYMMDD)
					  ([0-9]{1})	    #Check digit for date of birth
					  [MF<]			    #Sex
					  ([0-9]{6})		#Expiration date (YYMMDD)
					  ([0-9]{1})		#Check digit for expiration date
					  ([0-9A-Z<]{7})	#Optional
					  ([0-9]{1})		#Composite check digit
					*/
					re = /^[ACI][A-UW-Z<]{1}[A-Z<]{3}[A-Z<]{31}([0-9A-Z<]{9})([0-9]{1})[A-Z<]{3}([0-9<]{6})([0-9]{1})[MF<]([0-9]{6})([0-9]{1})[0-9A-Z<]{7}([0-9]{1})$/g;
					break;
				case "V": //Format-B visa
					documentType = "MRV-B";
					/*
					  V     		    #V, indicating a visa
					  [A-Z<]{1}         #Type of visa
					  [A-Z<]{3}		    #Issuing state
					  [A-Z<]{31}	    #Name

					  ([0-9A-Z<]{9})    #Passport or visa number
					  ([0-9]{1})	    #Check digit for passport or visa number
					  [A-Z<]{3}		    #Nationality
					  ([0-9<]{6})	    #Date of birth (YYMMDD)
					  ([0-9]{1})	    #Check digit for date of birth
					  [MF<]			    #Sex
					  ([0-9]{6})		#Expiration date (YYMMDD)
					  ([0-9]{1})		#Check digit for expiration date
					  ([0-9A-Z<]{8})	#Optional data elements
					*/
					re = /^V[A-Z<]{1}[A-Z<]{3}[A-Z<]{31}([0-9A-Z<]{9})([0-9]{1})[A-Z<]{3}([0-9<]{6})([0-9]{1})[MF<]([0-9]{6})([0-9]{1})([0-9A-Z<]{8})$/g;
					break;
				default:
					return false;
			}
			break;
		case 88: //Passport or visa (2 lines of 44 characters each).
			switch ( value.charAt( 0 ) ) {
				case "P": //Size 3 travel document (passport)
					documentType = "TD3";
					/*
					  P     		    #P, indicating a passport
					  [A-Z<]{1}         #Type of passport
					  [A-Z<]{3}		    #Issuing state
					  [A-Z<]{39}	    #Name

					  ([0-9A-Z<]{9})    #Passport number
					  ([0-9]{1})	    #Check digit for passport number
					  [A-Z<]{3}		    #Nationality
					  ([0-9<]{6})	    #Date of birth (YYMMDD)
					  ([0-9]{1})	    #Check digit for date of birth
					  [MF<]			    #Sex
					  ([0-9]{6})		#Expiration date (YYMMDD)
					  ([0-9]{1})		#Check digit for expiration date
					  ([0-9A-Z<]{14})	#Personal number
					  ([0-9<]{1})		#Check digit for personal number
					  ([0-9]{1})		#Composite check digit
					*/
					re = /^P[A-Z<]{1}[A-Z<]{3}[A-Z<]{39}([0-9A-Z<]{9})([0-9]{1})[A-Z<]{3}([0-9<]{6})([0-9]{1})[MF<]([0-9]{6})([0-9]{1})([0-9A-Z<]{14})([0-9<]{1})([0-9]{1})$/g;
					break;
				case "V": //Format-A visa
					documentType = "MRV-A";
					/*
					  V     		    #V, indicating a visa
					  [A-Z<]{1}         #Type of visa
					  [A-Z<]{3}		    #Issuing state
					  [A-Z<]{39}	    #Name

					  ([0-9A-Z<]{9})    #Passport or visa number
					  ([0-9]{1})	    #Check digit for passport or visa number
					  [A-Z<]{3}		    #Nationality
					  ([0-9<]{6})	    #Date of birth (YYMMDD)
					  ([0-9]{1})	    #Check digit for date of birth
					  [MF<]			    #Sex
					  ([0-9]{6})		#Expiration date (YYMMDD)
					  ([0-9]{1})		#Check digit for expiration date
					  ([0-9A-Z<]{16})	#Optional data elements
					*/
					re = /^V[A-Z<]{1}[A-Z<]{3}[A-Z<]{39}([0-9A-Z<]{9})([0-9]{1})[A-Z<]{3}([0-9<]{6})([0-9]{1})[MF<]([0-9]{6})([0-9]{1})([0-9A-Z<]{16})$/g;
					break;
				default:
					return false;
			}
			break;
		case 90: //Size 1 official travel document (3 lines of 30 chars each)
			documentType = "TD1";
			/*
			  [ACI][A-UW-Z<]{1} #Type of document
			  [A-Z<]{3}		    #Issuing state
			  ([0-9A-Z<]{9})    #Document number
			  ([0-9]{1})	    #Check digit for document number
			  ([0-9A-Z<]{15})	#Optional data elements

			  ([0-9<]{6})	    #Date of birth (YYMMDD)
			  ([0-9]{1})	    #Check digit for date of birth
			  [MF<]			    #Sex
			  ([0-9]{6})		#Expiration date (YYMMDD)
			  ([0-9]{1})		#Check digit for expiration date
			  [A-Z<]{3}		    #Nationality
			  ([0-9A-Z<]{11})	#Optional
			  ([0-9]{1})		#Composite check digit

			  [A-Z<]{30}        #Name
			*/
			re = /^[ACI][A-UW-Z<]{1}[A-Z<]{3}([0-9A-Z<]{9})([0-9]{1})([0-9A-Z<]{15})([0-9<]{6})([0-9]{1})[MF<]([0-9]{6})([0-9]{1})[A-Z<]{3}([0-9A-Z<]{11})([0-9]{1})[A-Z<]{30}$/g;
			break;
		default:
			return false;
	}

	//Use the regex to search the input value.
	match = re.exec( value );

	if ( match == null ) {
		return false;
	}

	//Test the individual check digits.
	var documentNumber = match[ 1 ],
		documentNumberCheckDigit = match[ 2 ],
		dateOfBirth,
		dateOfBirthCheckDigit,
		expiration,
		expirationCheckDigit,
		composite,
		compositeCheckDigit;

	switch ( documentType ) {
		case "TD1":
			var optional1, optional2;

			optional1 = match[ 3 ],
			dateOfBirth = match[ 4 ],
			dateOfBirthCheckDigit = match[ 5 ],
			expiration = match[ 6 ],
			expirationCheckDigit = match[ 7 ],
			optional2 = match[ 8 ],
			composite = documentNumber + documentNumberCheckDigit +
				optional1 +
				dateOfBirth + dateOfBirthCheckDigit +
				expiration + expirationCheckDigit +
				optional2,
			compositeCheckDigit = match[ 9 ];

			if ( check( documentNumber, documentNumberCheckDigit ) ) {
				if ( check( dateOfBirth, dateOfBirthCheckDigit ) ) {
					if ( check( expiration, expirationCheckDigit ) ) {
						if ( check( composite, compositeCheckDigit ) ) {
							return true;
						}
					}
				}
			}
			break;
		case "TD2":
			dateOfBirth = match[ 3 ],
			dateOfBirthCheckDigit = match[ 4 ],
			expiration = match[ 5 ],
			expirationCheckDigit = match[ 6 ],
			composite = documentNumber + documentNumberCheckDigit +
				dateOfBirth + dateOfBirthCheckDigit +
				expiration + expirationCheckDigit,
			compositeCheckDigit = match[ 7 ];

			if ( check( documentNumber, documentNumberCheckDigit ) ) {
				if ( check( dateOfBirth, dateOfBirthCheckDigit ) ) {
					if ( check( expiration, expirationCheckDigit ) ) {
						if ( check( composite, compositeCheckDigit ) ) {
							return true;
						}
					}
				}
			}
			break;
		case "TD3":
			var personalNumber, personalNumberCheckDigit;

			dateOfBirth = match[ 3 ],
			dateOfBirthCheckDigit = match[ 4 ],
			expiration = match[ 5 ],
			expirationCheckDigit = match[ 6 ],
			personalNumber = match[ 7 ],
			personalNumberCheckDigit = match[ 8 ],
			composite = documentNumber + documentNumberCheckDigit +
				dateOfBirth + dateOfBirthCheckDigit +
				expiration + expirationCheckDigit +
				personalNumber + personalNumberCheckDigit,
			compositeCheckDigit = match[ 9 ];

			if ( check( documentNumber, documentNumberCheckDigit ) ) {
				if ( check( dateOfBirth, dateOfBirthCheckDigit ) ) {
					if ( check( expiration, expirationCheckDigit ) ) {
						if ( check( personalNumber, personalNumberCheckDigit ) ||
								( personalNumber === "<<<<<<<<<<<<<<" && personalNumberCheckDigit === "<" ) ) {
							if ( check( composite, compositeCheckDigit ) ) {
								return true;
							}
						}
					}
				}
			}
			break;
		case "MRV-A":
		case "MRV-B":
			dateOfBirth = match[ 3 ],
			dateOfBirthCheckDigit = match[ 4 ],
			expiration = match[ 5 ],
			expirationCheckDigit = match[ 6 ];

			if ( check( documentNumber, documentNumberCheckDigit ) ) {
				if ( check( dateOfBirth, dateOfBirthCheckDigit ) ) {
					if ( check( expiration, expirationCheckDigit ) ) {
						return true;
					}
				}
			}
			break;
		default:
			return false;
	}

	return false;

	//Perform a check digit calculation to verify the data in the MRZ.
	//Returns true if the result of the check on the input matches the digit.
	function check( input, digit ) {
		var a = input.split( "" ),
			c = "",
			position = 0,
			remainder = 0,
			sum = 0,
			value = 0,
			weight = 0;

		for ( var i = 0; i < a.length; i++ ) {
			c = a[ i ];
			position++;

			//The weight of the first position is 7, of the second it is 3, and
			//of the third it is 1.
			if ( position === 4 ) {
				position = 1;
			}

			switch ( position ) {
				case 1:
					weight = 7;
					break;
				case 2:
					weight = 3;
					break;
				case 3:
					weight = 1;
					break;
			}

			//Each character of input has a value. For the digits 0 to 9 it is
			//the value of the digits, for the letters A to Z it is 10 to 35,
			//and for the filler "<" it is 0.
			if ( isNaN( parseInt( c, 10 ) ) ) {
				if ( c === "<" ) {
					value = 0;
				} else {
					value = c.charCodeAt( 0 ) - 55;
				}
			} else {
				value = c;
			}

			//Sum the result of multiplying the value by the weight.
			sum += ( value * weight );
		}

		//The remainder of the final sum divided by 10 is the check digit.
		remainder = ( sum % 10 );

		if ( digit === "<" ) {
			return 0;
		} else {
			return remainder === parseInt( digit, 10 );
		}
	}

}, "Please enter a valid machine-readable travel document." );
