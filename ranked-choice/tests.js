"use strict";

// QUnit unit test for custom 'ranked choice' widget software part

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

		QUnit.module('ranked_choice', function(hooks) {
			hooks.beforeEach(function() {
				this.ranked_choice = $('.ranked-choice').first();
				this.alternatives_list = this.ranked_choice.find('.ranked-choice-alternatives-list');
			});

			QUnit.test('add_alternative', function(assert) {
				assert.equal(this.alternatives_list.children('li').length, 0);
				assert.ok(ranked_choice_add_alternative(this.ranked_choice));
				assert.equal(this.alternatives_list.children('li').length, 1);

				assert.expect(3);
			});

			QUnit.test('remove_valid_alternative', function(assert) {
				assert.equal(this.alternatives_list.children('li').length, 0);
				var new_alternative = ranked_choice_add_alternative(this.ranked_choice);
				assert.equal(this.alternatives_list.children('li').length, 1);
				assert.ok(ranked_choice_remove_alternative(new_alternative));
				assert.equal(this.alternatives_list.children('li').length, 0);

				assert.expect(4);
			});

			QUnit.test('remove_invalid_alternative', function(assert) {
				assert.equal(this.alternatives_list.children('li').length, 0);
				var new_alternative = ranked_choice_add_alternative(this.ranked_choice);
				assert.ok(ranked_choice_remove_alternative(new_alternative));
				assert.equal(this.alternatives_list.children('li').length, 0);
				assert.notOk(ranked_choice_remove_alternative(new_alternative));

				assert.expect(4);
			});

			QUnit.test('remove_null_alternative', function(assert) {
				assert.equal(this.alternatives_list.children('li').length, 0);
				assert.notOk(ranked_choice_remove_alternative(null));
				assert.equal(this.alternatives_list.children('li').length, 0);

				assert.expect(3);
			});

			QUnit.test('move_alternative_right', function(assert) {
				var new_alternative = ranked_choice_add_alternative(this.ranked_choice, 8);
				assert.ok(ranked_choice_move_alternative(new_alternative, 1));

				assert.expect(1);
			});

			QUnit.test('move_alternative_left', function(assert) {
				var new_alternative = ranked_choice_add_alternative(this.ranked_choice, 8);
				assert.ok(ranked_choice_move_alternative(new_alternative, -1));

				assert.expect(1);
			});

			QUnit.test('move_alternative_far_left', function(assert) {
				var new_alternative = ranked_choice_add_alternative(this.ranked_choice, 15);

				for (i = 15; i > 1; i--) {
					assert.ok(ranked_choice_move_alternative(new_alternative, -1));
				}

				assert.expect(14);
			});

			QUnit.test('move_alternative_far_right', function(assert) {
				var new_alternative = ranked_choice_add_alternative(this.ranked_choice, 1);

				for (i = 1; i < 15; i++) {
					assert.ok(ranked_choice_move_alternative(new_alternative, 1));
				}

				assert.expect(14);
			});

			QUnit.test('move_leftmost_alternative_left', function(assert) {
				var new_alternative = ranked_choice_add_alternative(this.ranked_choice, 1);
				assert.notOk(ranked_choice_move_alternative(new_alternative, -1));
				assert.expect(1);
			});

			QUnit.test('move_rightmost_alternative_right', function(assert) {
				var new_alternative = ranked_choice_add_alternative(this.ranked_choice, 15);
				assert.notOk(ranked_choice_move_alternative(new_alternative, 1));
				assert.expect(1);
			});

			QUnit.test('slider_bar_gradient_update', function(assert) {
				assert.equal(1,1);
			});

			QUnit.test('add_alternative_correct_positionings_and_heights', function(assert) {
				var number_of_alternatives = 10;

				for (i = 1; i <= number_of_alternatives; i++) {
					assert.ok(ranked_choice_add_alternative(this.ranked_choice));

					var first_alternative = this.alternatives_list.children('li').first();
					var first_alternative_slider_drag_square_offset_top = $(first_alternative.children('.ranked-choice-alternative-slider-drag-handle')).offset().top;

					for (j = 2; j <= this.alternatives_list.children('li').length; j++) {
						var current_alternative = this.alternatives_list.children('li:nth-child(' + j + ')');
						var previous_alternative = this.alternatives_list.children('li:nth-child(' + (j-1) + ')');

						var current_alternative_slider_drag_square_top = this.alternatives_list.children('li:nth-child(' + j + ')').children('.ranked-choice-alternative-slider-drag-handle').offset().top;

						// The slider drag handles should all be stacked on each other
						assert.equal(first_alternative_slider_drag_square_offset_top, current_alternative_slider_drag_square_top);

						// The list items and polygons should have a fixed distance from each other
						assert.equal(current_alternative.offset().top - previous_alternative.offset().top, RANKED_CHOICE_CONSTANTS.ALTERNATIVE_LIST_ITEM_HEIGHT);
						assert.equal(current_alternative.children(RANKED_CHOICE_SELECTORS.ALTERNATIVE_POLYGON).offset().top - previous_alternative.children(RANKED_CHOICE_SELECTORS.ALTERNATIVE_POLYGON).offset().top, RANKED_CHOICE_CONSTANTS.ALTERNATIVE_LIST_ITEM_HEIGHT);

						// The alternatives polygons should have correct height set
						assert.equal(current_alternative.children(RANKED_CHOICE_SELECTORS.ALTERNATIVE_POLYGON).height(), this.alternatives_list.outerHeight(true) - RANKED_CHOICE_CONSTANTS.ALTERNATIVE_LIST_ITEM_HEIGHT*j - RANKED_CHOICE_CONSTANTS.ALTERNATIVE_SLIDER_DRAG_HANDLE_HEIGHT);
					}
				}

				var total_number_of_assertions_made = number_of_alternatives;

				for (k = 1; k < number_of_alternatives; k++) {
					total_number_of_assertions_made += (4*k);
				}

				assert.expect(total_number_of_assertions_made);
			});

			QUnit.module('alternatives', function(hooks) {
				hooks.beforeEach(function() {
					var max_number_alternatives = 30;
					var number_of_alternatives = Math.floor(Math.random() * max_number_alternatives) + 1;

					for (i = 1; i <= number_of_alternatives; i++) {
						ranked_choice_add_alternative(this.ranked_choice);
					}

					this.number_of_added_alternatives = number_of_alternatives;
				});

				QUnit.test('remove_all_alternatives_randomly', function(assert) {
					assert.equal(this.alternatives_list.children('li').length, this.number_of_added_alternatives);

					for (j = 1; j <= this.number_of_added_alternatives; j++) {
						var number_of_list_items_left = this.alternatives_list.children('li').length;
						var random_item = Math.floor(Math.random() * number_of_list_items_left) + 1;

						assert.ok(ranked_choice_remove_alternative(this.alternatives_list.children('li:nth-child(' + random_item + ')')));
						assert.equal(this.alternatives_list.children('li').length, this.number_of_added_alternatives - j);
					}

					assert.equal(this.alternatives_list.children('li').length, 0);

					assert.expect(2*this.number_of_added_alternatives + 2);
				});
			});
		});
	});
}