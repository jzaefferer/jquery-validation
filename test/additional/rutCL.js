QUnit.test("rutCL", function (assert) {
    var valid_list = ["12.345.678-5", "12345678-5"];
    var non_valid_list = ["12.345.678-9", "12345678-9", "123456789"]
    var method = methodTest("rutCL");
    for (var i = 0; i < valid_list.length; i++) {
        assert.ok(method(valid_list[i]), valid_list[i] + " is a valid RUT number");
    }
    for (i = 0; i < non_valid_list.length; i++) {
        assert.ok(method(non_valid_list[i]), non_valid_list[i] + " is not a valid RUT number");
    }
});