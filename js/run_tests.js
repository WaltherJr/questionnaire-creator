var RUN_TESTS = true;

function init_test_setting() {
	var div1 = document.createElement('div');
	var div2 = document.createElement('div');

	$(div1).attr('id', 'qunit');
	$(div2).attr('id', 'qunit-fixture').append($('body').html());

	$('body').html('').append(div1).append(div2);
}

if (RUN_TESTS == true) {
	$(document).ready(function() {
		init_test_setting();

		QUnit.module('questionnaire', function(hooks) {
			hooks.beforeEach(function() {
			});

			QUnit.test("move_section", function(assert) {
				assert.equal(1,1);
				assert.expect(1);
			});
		});
	});
}