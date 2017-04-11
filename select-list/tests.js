"use strict";

// QUnit unit test for custom 'select list' widget software part

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

		QUnit.module('select_list', function(hooks) {
			hooks.beforeEach(function() {
				this.select_list = $(select_list_create_new(true, false));
				this.list_button = $(this.select_list).children(select_list_data.selector('BUTTON'));
				this.alternatives_list = $(this.select_list).children(select_list_data.selector('ALTERNATIVES_LIST'));
			});

			QUnit.test("list_click_open_list", function(assert) {
				var list_offset = $(this.select_list).offset();

				assert.notOk(select_list_is_alternatives_list_open(this.select_list));
				$(this.list_button).trigger('click');
				assert.ok(select_list_is_alternatives_list_open(this.select_list));

				assert.expect(2);
			});

			QUnit.test('list_open_blur_closed', function(assert) {
				assert.notOk(select_list_is_alternatives_list_open(this.select_list));
				$(this.list_button).trigger('click');
				assert.ok(select_list_is_alternatives_list_open(this.select_list));
				$(this.list_button).blur();
				assert.notOk(select_list_is_alternatives_list_open(this.select_list));

				assert.expect(3);
			});

			QUnit.test("add_alternative", function(assert) {
				assert.equal(select_list_get_alternatives(this.select_list).length, 0);
				select_list_get_alternatives_list(this.select_list).children('li:last-child')
						.children(select_list_data.selector('ADD_ALTERNATIVE_BUTTON')).trigger('click');
				assert.equal(select_list_get_alternatives(this.select_list).length, 1);

				assert.expect(2);
			});

			QUnit.test("remove_alternative", function(assert) {
				assert.equal(select_list_get_alternatives(this.select_list).length, 0);
				$(this.alternatives_list).children('li:last-child')
						.children(select_list_data.selector('ADD_ALTERNATIVE_BUTTON')).trigger('click');
				assert.equal(select_list_get_alternatives(this.select_list).length, 1);
				$(this.alternatives_list).children('li:first-child')
						.children(select_list_data.selector('REMOVE_ALTERNATIVE_BUTTON')).trigger('click');
				assert.equal(select_list_get_alternatives(this.select_list).length, 0);

				assert.expect(3);
			});

			QUnit.test("select_newly_created_alternative", function(assert) {
				select_list_get_alternatives_list(this.select_list)
					.children('li:last-child').children(select_list_data.selector('ADD_ALTERNATIVE_BUTTON'))
					.trigger('click');

				var added_element = select_list_get_alternatives(this.select_list).first(select_list_data.selector('ALTERNATIVE'));

				assert.notOk(select_list_is_alternative_selected(added_element));
				select_list_toggle_editable_mode(this.select_list);
				select_list_set_active_alternative(this.select_list, added_element);
				assert.ok(select_list_is_alternative_selected(added_element));

				assert.expect(2);
			});

			QUnit.test("select_list_toggle_editable_mode", function(assert) {
				assert.ok(select_list_is_list_editable(this.select_list));
				select_list_toggle_editable_mode(this.select_list);
				assert.notOk(select_list_is_list_editable(this.select_list));
				select_list_toggle_editable_mode(this.select_list);
				assert.ok(select_list_is_list_editable(this.select_list));

				assert.expect(3);
			});

			QUnit.module("alternatives", function(hooks) {
				hooks.beforeEach(function() {
					var upper_limit = 50;
					var number_of_alternatives = Math.floor(Math.random() * upper_limit) + 1;

					for (i = 1; i <= number_of_alternatives; i++) {
						select_list_add_alternative(this.select_list);
					}

					this.number_of_added_alternatives = number_of_alternatives;
				});

				QUnit.test("remove_all_alternatives_randomly", function(assert) {
					for (j = 1; j <= this.number_of_added_alternatives; j++) {
						var number_of_alternatives_left = select_list_get_alternatives(this.select_list).length;
						var random_alternative = Math.floor(Math.random() * number_of_alternatives_left) + 1;
						var removed_alternative_selector = select_list_data.selector('ALTERNATIVE')
															 + ':nth-child(' + random_alternative + ')';

						select_list_get_alternatives_list(this.select_list)
							.children(removed_alternative_selector)
							.children(select_list_data.selector('REMOVE_ALTERNATIVE_BUTTON')).trigger('click');

						assert.equal(select_list_get_alternatives(this.select_list).length,
										this.number_of_added_alternatives-j);
					}

					assert.equal(select_list_get_alternatives(this.select_list).length, 0);

					assert.expect(this.number_of_added_alternatives+1);
				});

				QUnit.test("select_all_alternatives", function(assert) {
					select_list_toggle_editable_mode(this.select_list);

					for (i = 1; i <= select_list_get_alternatives(this.select_list).length; i++) {
						var current_alternative = select_list_get_alternatives_list(this.select_list)
									.children(select_list_data.selector('ALTERNATIVE') + ':nth-child(' + i + ')');

						this.list_button.trigger('click');
						current_alternative.trigger('click');

						assert.ok(select_list_is_alternative_selected(current_alternative));
						assert.equal(select_list_get_alternatives_list(this.select_list)
							.children(select_list_data.selector('ALTERNATIVE_SELECTED')).length, 1);
					}

					assert.expect(this.number_of_added_alternatives*2);
				});
			});
		});
	});
}