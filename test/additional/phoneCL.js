QUnit.test("phoneCL", function (assert) {
    var valid_list = ["+56988776655", "+56228765432", "+56582553344", "0988776655", "0228765432", "0582553344", "988776655", "228765432", "582553344"];
    var non_valid_list = ["(+56)988776655", "+56 2 28765432", "(+56) 58-255-3344", "09.8877.6655", "02 2876 5432", "058.255.3344", "9-88776655", "22 8765 432", "(58)2553344"]
    var method = methodTest("phoneCL");
    for (var i = 0; i < valid_list.length; i++) {
        assert.ok(method(valid_list[i]), valid_list[i] + " is a valid phone number");
    }
    for (i = 0; i < non_valid_list.length; i++) {
        assert.ok(method(non_valid_list[i]), non_valid_list[i] + " is not a valid phone number");
    }
});