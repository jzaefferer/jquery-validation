QUnit.test( "semver2", function( assert ) {
	var method = methodTest( "semver2" );
	assert.ok( method( "0.0.4" ), "Valid semantic version" );
	assert.ok( method( "1.2.3" ), "Valid semantic version" );
	assert.ok( method( "10.20.30" ), "Valid semantic version" );
	assert.ok( method( "1.1.2-prerelease+meta" ), "Valid semantic version" );
	assert.ok( method( "1.1.2+meta" ), "Valid semantic version" );
	assert.ok( method( "1.1.2+meta-valid" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-alpha" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-beta" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-alpha.beta" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-alpha.beta.1" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-alpha.1" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-alpha0.valid" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-alpha.0valid" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-rc.1+build.1" ), "Valid semantic version" );
	assert.ok( method( "2.0.0-rc.1+build.123" ), "Valid semantic version" );
	assert.ok( method( "1.2.3-beta" ), "Valid semantic version" );
	assert.ok( method( "10.2.3-DEV-SNAPSHOT" ), "Valid semantic version" );
	assert.ok( method( "1.2.3-SNAPSHOT-123" ), "Valid semantic version" );
	assert.ok( method( "1.0.0" ), "Valid semantic version" );
	assert.ok( method( "2.0.0" ), "Valid semantic version" );
	assert.ok( method( "1.1.7" ), "Valid semantic version" );
	assert.ok( method( "2.0.0+build.1848" ), "Valid semantic version" );
	assert.ok( method( "2.0.1-alpha.1227" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-alpha+beta" ), "Valid semantic version" );
	assert.ok( method( "1.2.3----RC-SNAPSHOT.12.9.1--.12+788" ), "Valid semantic version" );
	assert.ok( method( "1.2.3----R-S.12.9.1--.12+meta" ), "Valid semantic version" );
	assert.ok( method( "1.2.3----RC-SNAPSHOT.12.9.1--.12" ), "Valid semantic version" );
	assert.ok( method( "1.0.0+0.build.1-rc.10000aaa-kk-0.1" ), "Valid semantic version" );
	assert.ok( method( "99999999999999999999999.999999999999999999.99999999999999999" ), "Valid semantic version" );
	assert.ok( method( "1.0.0-0A.is.legal" ), "Valid semantic version" );

	assert.ok( !method( "1" ), "Invalid semantic version" );
	assert.ok( !method( "1.2" ), "Invalid semantic version" );
	assert.ok( !method( "1.2.3-0123" ), "Invalid semantic version" );
	assert.ok( !method( "1.2.3-0123.0123" ), "Invalid semantic version" );
	assert.ok( !method( "1.1.2+.123" ), "Invalid semantic version" );
	assert.ok( !method( "+invalid" ), "Invalid semantic version" );
	assert.ok( !method( "-invalid" ), "Invalid semantic version" );
	assert.ok( !method( "-invalid+invalid" ), "Invalid semantic version" );
	assert.ok( !method( "-invalid.01" ), "Invalid semantic version" );
	assert.ok( !method( "alpha" ), "Invalid semantic version" );
	assert.ok( !method( "alpha.beta" ), "Invalid semantic version" );
	assert.ok( !method( "alpha.beta.1" ), "Invalid semantic version" );
	assert.ok( !method( "alpha.1" ), "Invalid semantic version" );
	assert.ok( !method( "alpha+beta" ), "Invalid semantic version" );
	assert.ok( !method( "alpha_beta" ), "Invalid semantic version" );
	assert.ok( !method( "alpha." ), "Invalid semantic version" );
	assert.ok( !method( "alpha.." ), "Invalid semantic version" );
	assert.ok( !method( "beta" ), "Invalid semantic version" );
	assert.ok( !method( "1.0.0-alpha_beta" ), "Invalid semantic version" );
	assert.ok( !method( "-alpha." ), "Invalid semantic version" );
	assert.ok( !method( "1.0.0-alpha.." ), "Invalid semantic version" );
	assert.ok( !method( "1.0.0-alpha..1" ), "Invalid semantic version" );
	assert.ok( !method( "1.0.0-alpha...1" ), "Invalid semantic version" );
	assert.ok( !method( "1.0.0-alpha....1" ), "Invalid semantic version" );
	assert.ok( !method( "1.0.0-alpha.....1" ), "Invalid semantic version" );
	assert.ok( !method( "1.0.0-alpha......1" ), "Invalid semantic version" );
	assert.ok( !method( "1.0.0-alpha.......1" ), "Invalid semantic version" );
	assert.ok( !method( "01.1.1" ), "Invalid semantic version" );
	assert.ok( !method( "1.01.1" ), "Invalid semantic version" );
	assert.ok( !method( "1.1.01" ), "Invalid semantic version" );
	assert.ok( !method( "1.2" ), "Invalid semantic version" );
	assert.ok( !method( "1.2.3.DEV" ), "Invalid semantic version" );
	assert.ok( !method( "1.2-SNAPSHOT" ), "Invalid semantic version" );
	assert.ok( !method( "1.2.31.2.3----RC-SNAPSHOT.12.09.1--..12+788" ), "Invalid semantic version" );
	assert.ok( !method( "1.2-RC-SNAPSHOT" ), "Invalid semantic version" );
	assert.ok( !method( "-1.0.3-gamma+b7718" ), "Invalid semantic version" );
	assert.ok( !method( "+justmeta" ), "Invalid semantic version" );
	assert.ok( !method( "9.8.7+meta+meta" ), "Invalid semantic version" );
	assert.ok( !method( "9.8.7-whatever+meta+meta" ), "Invalid semantic version" );
	assert.ok( !method( "99999999999999999999999.999999999999999999.99999999999999999----RC-SNAPSHOT.12.09.1--------------------------------..12" ), "Invalid semantic version" );
} );
