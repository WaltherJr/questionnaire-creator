"use strict";

// QUnit unit test for 'questionnaire' software part

var RUN_TESTS = true;

function init_test_setting() {
	var div1 = document.createElement('div');
	var div2 = document.createElement('div');
	var seed = new Date().getTime().toString();

	$(div1).attr('id', 'qunit');
	$(div2).attr('id', 'qunit-fixture').append($('body').html());

	$('body').html('').append(div1).append(div2);

	QUnit.config.requireExpects = true;
	QUnit.config.noglobals = true;
	QUnit.config.reorder = false;
	QUnit.config.seed = seed;
}

if (RUN_TESTS == true) {
	$(document).ready(function() {
		init_test_setting();

		QUnit.module('Questionnaire operations');

		QUnit.test('Add question', function(assert) {
			assert.expect(5);

			assert.strictEqual(questionnaire_get_questions().length, 0);

			var question = questionnaire_add_question();
			var question_type_div = questionnaire_get_question_type_div(question);

			assert.ok(question);
			assert.ok(question_type_div);
			assert.strictEqual(questionnaire_get_questions().length, 1);
			assert.strictEqual($(question_type_div).html(), questionnaire_get_question_type_prototype(questionnaire.question_type.default_type).html());
		});

		QUnit.test('Add heading and description', function(assert) {
			assert.expect(4);

			assert.strictEqual(questionnaire_get_heading_and_descriptions().length, 0);

			var heading_and_description = questionnaire_add_heading_and_description();

			assert.ok(heading_and_description);
			assert.strictEqual(questionnaire_get_heading_and_descriptions().length, 1);
			assert.strictEqual($(heading_and_description).html(), questionnaire_get_heading_and_description_prototype().html());
		});

		QUnit.test('Add image', function(assert) {
			assert.expect(1);
			assert.equal(1,1);
		});

		QUnit.test('Add hyperlink', function(assert) {
			assert.expect(1);
			assert.equal(1,1);
		});

		QUnit.test('Add email-link', function(assert) {
			assert.expect(1);
			assert.equal(1,1);
		});

		QUnit.test('Preview questionnaire', function(assert) {
			assert.expect(8);

			var preview_mode_assertions = function(preview_mode_enabled) {
				var contenteditable_attr_preview_value = (preview_mode_enabled ? 'false' : 'true');

				assert.strictEqual($(questionnaire.title.selector).attr('contenteditable'), contenteditable_attr_preview_value);
				assert.strictEqual($(questionnaire.description.selector).attr('contenteditable'), contenteditable_attr_preview_value);
			};

			preview_mode_assertions(false);

			assert.strictEqual(questionnaire_preview_questionnaire(true), true);

			preview_mode_assertions(true);

			assert.strictEqual(questionnaire_preview_questionnaire(false), true);

			preview_mode_assertions(false);
		});

		QUnit.module('Clear questionnaire', {
			beforeEach: function(assert) {
				assert.strictEqual(questionnaire_get_questions().length, 0);
				assert.strictEqual(questionnaire_get_heading_and_descriptions().length, 0);
				assert.strictEqual(questionnaire_get_sections().length, 0);

				assert.ok(questionnaire_add_heading_and_description());
				assert.ok(questionnaire_add_question());

				assert.strictEqual(questionnaire_get_questions().length, 1);
				assert.strictEqual(questionnaire_get_heading_and_descriptions().length, 1);
				assert.strictEqual(questionnaire_get_sections().length, 2);
			},
			afterEach: function(assert) {
				var done = assert.async();

				setTimeout(function() {
					assert.strictEqual(questionnaire_get_questions().length, 0);
					assert.strictEqual(questionnaire_get_heading_and_descriptions().length, 0);
					assert.strictEqual(questionnaire_get_sections().length, 0);
					done();
				}, 1100);
			}
		});

		QUnit.test('Via "Clear questionnaire" toolbar button', function(assert) {
			assert.expect(14);

			assert.ok(questionnaire_clear());
			assert.strictEqual(questionnaire_get_title(), questionnaire.title.default_text);
			assert.strictEqual(questionnaire_get_description(), questionnaire.description.default_text);
		});

		QUnit.test('Via "Remove section" button', function(assert) {
			assert.expect(13);

			questionnaire_get_sections().each(function(index, section) {
				assert.ok(questionnaire_remove_section($(section)));
			});
		});

		QUnit.module('Question operations');

		QUnit.test('Move question up', function(assert) {
			assert.expect(1);
			assert.equal(1,1);
		});

		QUnit.test('Move question down', function(assert) {
			assert.expect(1);
			assert.equal(1,1);
		});

		QUnit.test('Remove question', function(assert) {
			assert.expect(5);

			assert.strictEqual(questionnaire_get_questions().length, 0);

			var question = questionnaire_add_question();

			assert.ok(question);
			assert.strictEqual(questionnaire_get_questions().length, 1);
			assert.strictEqual(questionnaire_remove_section(question), true);

			var done = assert.async();

			setTimeout(function() {
				assert.strictEqual(questionnaire_get_questions().length, 0);
				done();
			}, 1100);
		});

		QUnit.module('Question types');

		QUnit.test('Valid question types', function(assert) {
			assert.expect(Object.keys(questionnaire.question_types).length);

			assert.strictEqual(questionnaire_is_question_type_valid(questionnaire.question_types.short_answer), true);
			assert.strictEqual(questionnaire_is_question_type_valid(questionnaire.question_types.paragraph), true);
			assert.strictEqual(questionnaire_is_question_type_valid(questionnaire.question_types.single_choice_list), true);
			assert.strictEqual(questionnaire_is_question_type_valid(questionnaire.question_types.single_choice_radio_buttons), true);
			assert.strictEqual(questionnaire_is_question_type_valid(questionnaire.question_types.multiple_choice_list), true);
			assert.strictEqual(questionnaire_is_question_type_valid(questionnaire.question_types.multiple_choice_checkboxes), true);
			assert.strictEqual(questionnaire_is_question_type_valid(questionnaire.question_types.ranked_choice), true);
		});

		QUnit.test('Invalid question types', function(assert) {
			assert.expect(7);

			assert.strictEqual(questionnaire_is_question_type_valid(), false);
			assert.strictEqual(questionnaire_is_question_type_valid('incorrect-question-type'), false);
			assert.strictEqual(questionnaire_is_question_type_valid(''), false);
			assert.strictEqual(questionnaire_is_question_type_valid(null), false);
			assert.strictEqual(questionnaire_is_question_type_valid(32), false);
			assert.strictEqual(questionnaire_is_question_type_valid(32.433), false);
			assert.strictEqual(questionnaire_is_question_type_valid(function() {}), false);
		});

		QUnit.test('Change to same question type', function(assert) {
			assert.expect(2*Object.keys(questionnaire.question_types).length);

			for (var question_type in questionnaire.question_types) {
				var question = questionnaire_add_question(questionnaire.question_types[question_type]);

				assert.ok(question);

				// A change to the same question type should return 'false' and not change question markup
				assert.strictEqual(questionnaire_change_question_type(question, questionnaire.question_types[question_type]), false);
			}
		});

		/*
		QUnit.test('Change to other valid question type', function(assert) {
			for (var question_type in questionnaire.question_types) {
				var question = questionnaire_add_question(questionnaire.question_types[question_type]);
			}
		});
		*/

		QUnit.test('Change to incorrect question type', function(assert) {
			assert.expect(7);

			var question = questionnaire_add_question();

			assert.ok(question);
			assert.strictEqual(questionnaire_get_question_type(question), questionnaire.question_type.default_type);
			assert.strictEqual(questionnaire_change_question_type(question, 'incorrect-question-type'), false);
			assert.strictEqual(questionnaire_get_question_type(question), questionnaire.question_type.default_type);
			assert.strictEqual(questionnaire_change_question_type(question), false);
			assert.strictEqual(questionnaire_get_question_type(question),  questionnaire.question_type.default_type);
			assert.strictEqual(questionnaire_change_question_type(question, 342), false);
		});

		QUnit.module('Heading and description operations');

		QUnit.test('Remove heading and description', function(assert) {
			assert.expect(5);

			assert.strictEqual(questionnaire_get_heading_and_descriptions().length, 0);

			var heading_and_description = questionnaire_add_heading_and_description();

			assert.ok(heading_and_description);
			assert.strictEqual(questionnaire_get_heading_and_descriptions().length, 1);
			assert.strictEqual(questionnaire_remove_section(heading_and_description), true);

			var done = assert.async();

			setTimeout(function() {
				assert.strictEqual(questionnaire_get_heading_and_descriptions().length, 0);
				done();
			}, 1100);
		});

		QUnit.test('Only one section movement', function(assert) {
			assert.expect(5);

			var section = questionnaire_add_heading_and_description();
			var section_array = questionnaire_get_sections_array(questionnaire.default_section_sort_function);

			assert.ok(section);
			assert.ok(section_array);
			assert.strictEqual(questionnaire_move_section(section, -1), false);
			assert.strictEqual(questionnaire_move_section(section, 1), false);
			assert.deepEqual(section_array, questionnaire_get_sections_array(questionnaire.default_section_sort_function));
		});

		QUnit.module('Section duplication');

		QUnit.test('Duplicate heading and description without movement', function(assert) {
			assert.expect(4);

			var heading_and_description = questionnaire_add_heading_and_description();
			var heading_and_description_top = heading_and_description.position().top;
			var cloned_heading_and_description = questionnaire_duplicate_section(heading_and_description);

			assert.ok(cloned_heading_and_description);
			assert.strictEqual(questionnaire_get_heading_and_descriptions().length, 2);
			assert.strictEqual(heading_and_description.position().top, heading_and_description_top);

			var done = assert.async();

			setTimeout(function() {
				assert.strictEqual(cloned_heading_and_description.position().top, heading_and_description_top + heading_and_description.outerHeight(true));
				done();
			}, 1100);
		});

		QUnit.test('Duplicate question without movement', function(assert) {
			assert.expect(4);

			var question = questionnaire_add_question();
			var question_top = question.position().top;
			var cloned_question = questionnaire_duplicate_section(question);

			assert.ok(cloned_question);
			assert.strictEqual(questionnaire_get_questions().length, 2);
			assert.strictEqual(question.position().top, question_top);

			var done = assert.async();

			setTimeout(function() {
				assert.strictEqual(cloned_question.position().top, question_top + question.outerHeight(true));
				done();
			}, 1100);
		});

		QUnit.test('Duplicate section with movement', function(assert) {
			assert.expect(1);
			assert.ok(true);
		});

		QUnit.test('Duplicate undefined section', function(assert) {
			assert.expect(2);

			assert.strictEqual(questionnaire_duplicate_section(), false);
			assert.strictEqual(questionnaire_duplicate_section(undefined), false);
		});

		QUnit.test('Duplicate null section', function(assert) {
			assert.expect(1);

			assert.strictEqual(questionnaire_duplicate_section(null), false);
		});

		QUnit.module('Successful section movement', {
			beforeEach: function(assert) {
				assert.ok(questionnaire_add_heading_and_description());
				assert.ok(questionnaire_add_question());

				this.sections_array = questionnaire_get_sections_array(questionnaire.default_section_sort_function);

				assert.ok(this.sections_array);
				assert.strictEqual(questionnaire_get_section_z_index(this.sections_array[0]), 1);
				assert.strictEqual(questionnaire_get_section_z_index(this.sections_array[1]), 2);
			},
			afterEach: function(assert) {
				this.updated_sections_array = questionnaire_get_sections_array(questionnaire.default_section_sort_function);

				assert.ok(this.updated_sections_array);
				assert.deepEqual(this.updated_sections_array[0], this.sections_array[1]);
				assert.deepEqual(this.updated_sections_array[1], this.sections_array[0]);
				assert.strictEqual(questionnaire_get_section_z_index(this.sections_array[0]), 2);
				assert.strictEqual(questionnaire_get_section_z_index(this.sections_array[1]), 1);
				assert.strictEqual(questionnaire_get_section_z_index(this.updated_sections_array[0]), 1);
				assert.strictEqual(questionnaire_get_section_z_index(this.updated_sections_array[1]), 2);
			}
		});

		QUnit.test('Move first section down', function(assert) {
			assert.expect(12 + 1);
			assert.strictEqual(questionnaire_move_section($(this.sections_array[0]), 1), true);
		});

		QUnit.test('Move last section up', function(assert) {
			assert.expect(12 + 1);
			assert.strictEqual(questionnaire_move_section($(this.sections_array[this.sections_array.length-1]), -1), true);
		});

		QUnit.module('Unsuccessful section movement', {
			beforeEach: function(assert) {
				assert.ok(questionnaire_add_heading_and_description());
				assert.ok(questionnaire_add_question());

				this.sections_array = questionnaire_get_sections_array(questionnaire.default_section_sort_function);

				assert.ok(this.sections_array);
			},
			afterEach: function(assert) {
				this.updated_sections_array = questionnaire_get_sections_array(questionnaire.default_section_sort_function);

				assert.ok(this.updated_sections_array);
				assert.deepEqual(this.updated_sections_array[0], this.sections_array[0]);
				assert.deepEqual(this.updated_sections_array[1], this.sections_array[1]);
			}
		});

		QUnit.test('Move first section up', function(assert) {
			assert.expect(6 + 1);
			assert.strictEqual(questionnaire_move_section(this.sections_array[0], -1), false);
		});

		QUnit.test('Move last section down', function(assert) {
			assert.expect(6 + 1);
			assert.strictEqual(questionnaire_move_section(this.sections_array[this.sections_array.length-1]), false);
		});
	});
}