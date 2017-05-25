"use strict";

// QUnit unit test for questionnaire creator 'preview' functionality

var RUN_QUESTIONNAIRE_PREVIEW_TESTS = false;

if (RUN_QUESTIONNAIRE_PREVIEW_TESTS == true) {
	$(document).ready(function() {
		function generateRandomIntegerBetween(min, max) {
  			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		var question_types_before_test_functions = {
			short_answer: function(question_type_div, assert, preview_enabled) {
				assert.strictEqual($(question_type_div).find('.question-short-answer-text').val(), '');
			},
			paragraph: function(question_type_div, assert, preview_enabled) {
				assert.strictEqual($(question_type_div).find('.question-paragraph-text').val(), '');
			},
			single_choice_list: function(question_type_div, assert, preview_enabled) {
				assert.ok(true);
			},
			multiple_choice_list: function(question_type_div, assert, preview_enabled) {
				assert.ok(true);
			},
			single_choice_radio_buttons: function(question_type_div, assert) {
				var radio_buttons = $(question_type_div).find('input[type="radio"]');
				var radio_button_labels = radio_buttons.siblings('label');

				radio_button_labels.each(function(index, label) {
					assert.strictEqual($(label).attr('contenteditable'), 'true');
				});

				radio_buttons.each(function(index, radio_button) {
					assert.strictEqual($(radio_button).prop('disabled'), true);
					assert.strictEqual($(radio_button).is(':checked'), false);
				});
			},
			multiple_choice_checkboxes: function(question_type_div, assert) {
				var checkboxes = $(question_type_div).find('input[type="checkbox"]');
				var checkbox_labels = checkboxes.siblings('label');

				checkbox_labels.each(function(index, label) {
					assert.strictEqual($(label).attr('contenteditable'), 'true');
				});

				checkboxes.each(function(index, checkbox) {
					assert.strictEqual($(checkbox).prop('disabled'), true);
					assert.strictEqual($(checkbox).is(':checked'), false);
				})
			},
			ranked_choice: function(question_type_div, assert, preview_enabled) {
				assert.ok(true);
			}
		};

		var question_types_after_test_functions = {
			short_answer: function(question_type_div, assert) {
				assert.strictEqual($(question_type_div).find('.question-short-answer-text').val(), '');
			},
			paragraph: function(question_type_div, assert) {
				assert.strictEqual($(question_type_div).find('.question-paragraph-text').val(), '');
			},
			single_choice_list: function(question_type_div, assert) {
				assert.ok(true);
			},
			multiple_choice_list: function(question_type_div, assert) {
				assert.ok(true);
			},
			single_choice_radio_buttons: function(question_type_div, assert) {
				var radio_buttons = $(question_type_div).find('input[type="radio"]');
				var radio_button_labels = radio_buttons.siblings('label');

				radio_button_labels.each(function(index, label) {
					assert.strictEqual($(label).attr('contenteditable'), 'false');
				});

				radio_buttons.each(function(index, radio_button) {
					assert.strictEqual($(radio_button).prop('disabled'), false);
					assert.strictEqual($(radio_button).is(':checked'), false);
				});
			},
			multiple_choice_checkboxes: function(question_type_div, assert) {
				var checkboxes = $(question_type_div).find('input[type="checkbox"]');
				var checkbox_labels = checkboxes.siblings('label');

				checkbox_labels.each(function(index, label) {
					assert.strictEqual($(label).attr('contenteditable'), 'false');
				});

				checkboxes.each(function(index, checkbox) {
					assert.strictEqual($(checkbox).prop('disabled'), false);
					assert.strictEqual($(checkbox).is(':checked'), false);
				});
			},
			ranked_choice: function(question_type_div, assert) {
				assert.ok(true);
			}
		};

		QUnit.module('Questionnaire preview tests', {
			before: function(assert) {
				for (var question_type in questionnaire.question_types) {
					assert.ok(questionnaire_add_question(questionnaire.question_types[question_type].name));
				}
			},
			after: function(assert) {
				questionnaire_get_questions().each(function(index, question) {
					var question_type_key = questionnaire_get_question_type(question).replace(/-/g, '_');

					if (question_types_after_test_functions[question_type_key] !== undefined) {
						question_types_after_test_functions[question_type_key](questionnaire_get_question_type_div(question), assert);
					}
				});
			}
		});

		QUnit.test('Preview question types', function(assert) {
			var test_string = 'Hello World!';

			assert.expect(2 * questionnaire_get_number_of_question_types() + 1);

			// Short answer
			questionnaire_get_questions('short-answer').children('.panel-body').children('.question-type-short-answer').find('.question-short-answer-text').val(test_string);
			assert.strictEqual(questionnaire_get_questions('short-answer').children('.panel-body').children('.question-type-short-answer').find('.question-short-answer-text').val(), test_string);

			// Paragraph
			questionnaire_get_questions('paragraph').children('.panel-body').children('.question-type-paragraph').find('.question-paragraph-text').val(test_string);
			assert.strictEqual(questionnaire_get_questions('paragraph').children('.panel-body').children('.question-type-paragraph').find('.question-paragraph-text').val(), test_string);

			var select_radio_buttons_and_checkboxes = function(index, input_element) {
				$(input_element).prop('selected', true);
			};

			// Single choice: radio buttons
			var radio_buttons = questionnaire_get_questions('single-choice-radio-buttons').children('.panel-body').children('.question-type-single-choice-radio-buttons').find('input[type="radio"]');

			// Multiple choice: checkboxes
			var checkboxes = questionnaire_get_questions('multiple-choice-checkboxes').children('.panel-body').children('.question-type-multiple-choice-checkboxes').find('input[type="checkbox"]');

			radio_buttons.each(select_radio_buttons_and_checkboxes);
			checkboxes.each(select_radio_buttons_and_checkboxes);

			assert.ok(questionnaire_preview());
		});

		QUnit.module('apa');

		QUnit.test('Toolbar button disabled state', function(assert) {
			var number_of_questionnaire_operations_buttons = questionnaire_get_operations_toolbar().children('button').length;
			var number_of_preview_button_assertions_made = 0;
			var number_of_other_button_assertions_made = 0;

			assert.expect(2*number_of_questionnaire_operations_buttons + 7);

			questionnaire_get_operations_toolbar().children('button').each(function(index, button) {
				if ($(button).hasClass(questionnaire.operations_toolbar.preview_button.classname)) {
					assert.strictEqual($(button).hasClass('active'), false);
					assert.strictEqual($(button).attr('data-original-title'),
						questionnaire.operations_toolbar.preview_button.preview_mode_disabled_tooltip_text);
				}

				assert.strictEqual($(button).prop('disabled'), false);
			});

			assert.strictEqual(questionnaire_preview(), true);

			questionnaire_get_operations_toolbar().children('button').each(function(index, button) {
				if ($(button).hasClass(questionnaire.operations_toolbar.preview_button.classname)) {
					assert.strictEqual($(button).prop('disabled'), false);
					assert.strictEqual($(button).hasClass('active'), true);
					assert.strictEqual($(button).attr('data-original-title'),
						questionnaire.operations_toolbar.preview_button.preview_mode_enabled_tooltip_text);

					number_of_preview_button_assertions_made++;
				} else {
					assert.strictEqual($(button).prop('disabled'), true);
					number_of_other_button_assertions_made++;
				}
			});

			assert.strictEqual(number_of_preview_button_assertions_made, 1);
			assert.strictEqual(number_of_other_button_assertions_made, number_of_questionnaire_operations_buttons - 1);
		});

		QUnit.module('Preview questionnaire sections', {
			beforeEach: function(assert) {
				var max_number_of_added_sections = 20;
				var min_number_of_added_sections = max_number_of_added_sections / 2;

				var max_number_of_added_heading_and_descriptions = max_number_of_added_sections / 2;
				var min_number_of_added_heading_and_descriptions = max_number_of_added_heading_and_descriptions / 2;

				var max_number_of_added_questions = max_number_of_added_sections / 2;
				var min_number_of_added_questions = max_number_of_added_questions / 2;

				var random_number_of_heading_and_descriptions = generateRandomIntegerBetween(min_number_of_added_heading_and_descriptions, max_number_of_added_heading_and_descriptions);
				var random_number_of_questions = generateRandomIntegerBetween(min_number_of_added_questions, max_number_of_added_sections);

				/*
					min <= number_of_added_heading_and_descriptions <= max
					min <= number_of_added_questions <= max
				*/
				assert.strictEqual(random_number_of_heading_and_descriptions >= min_number_of_added_heading_and_descriptions &&
					random_number_of_heading_and_descriptions <= max_number_of_added_heading_and_descriptions, true);
				assert.strictEqual(random_number_of_heading_and_descriptions >= min_number_of_added_heading_and_descriptions &&
					random_number_of_heading_and_descriptions <= max_number_of_added_heading_and_descriptions, true);

				this.number_of_added_heading_and_descriptions = 0;
				this.number_of_added_questions = 0;
				this.number_of_added_sections = 0;

				for (var i = 1; i <= random_number_of_heading_and_descriptions; i++) {
					assert.ok(questionnaire_add_heading_and_description());
					this.number_of_added_heading_and_descriptions++;
				}

				for (var j = 1; j <= random_number_of_questions; j++) {
					assert.ok(questionnaire_add_question());
					this.number_of_added_questions++;
				}

				this.number_of_added_sections = this.number_of_added_heading_and_descriptions + this.number_of_added_questions;

				assert.strictEqual(questionnaire_get_heading_and_descriptions().length, this.number_of_added_heading_and_descriptions);
				assert.strictEqual(questionnaire_get_questions().length, this.number_of_added_questions);
				assert.strictEqual(questionnaire_get_sections().length, this.number_of_added_sections);

				this.number_of_assertions_made_before_test = 2 + (1*this.number_of_added_sections) + 3;
			}
		});

		QUnit.test('Preview sections', function(assert) {
			var number_of_preview_states = 2; // Preview mode: on/off
			var number_of_questionnaire_assertions_made = number_of_preview_states * 3; // Title, description, footer: Preview on/off
			var number_of_questionnaire_section_assertions_made = number_of_preview_states * (3*this.number_of_added_sections); // Section title, description, bottom menu: Preview on/off
			var number_of_questionnaire_question_assertions_made = number_of_preview_states * (1*this.number_of_added_questions); // Question type dropdown list: Preview on/off

			var total_number_of_assertions_made =
				this.number_of_assertions_made_before_test +
				number_of_questionnaire_assertions_made +
				number_of_questionnaire_section_assertions_made +
				number_of_questionnaire_question_assertions_made +
				1; // One extra assertion for 'questionnaire_preview()'

			assert.expect(total_number_of_assertions_made);

			assert.strictEqual($(questionnaire.title.selector).attr('contenteditable'), 'true');
			assert.strictEqual($(questionnaire.description.selector).attr('contenteditable'), 'true');
			assert.strictEqual(questionnaire_get_footer().css('display'), 'none');

			questionnaire_get_sections().each(function(index, section) {
				assert.strictEqual($(section).children('.panel-heading').children('.panel-title').attr('contenteditable'), 'true');
				assert.strictEqual($(section).children('.panel-body').children('p[class*="-description"]').attr('contenteditable'), 'true');
				assert.strictEqual($(section).children('.panel-footer').css('display'), 'block');
			});

			questionnaire_get_questions().each(function(index, question) {
				assert.strictEqual($(question).children('.panel-heading').children('.questionnaire-question-types-dropdown').css('display'), 'block');
			});

			// Preview questionnaire
			assert.strictEqual(questionnaire_preview(), true);

			assert.strictEqual($(questionnaire.title.selector).attr('contenteditable'), 'false');
			assert.strictEqual($(questionnaire.description.selector).attr('contenteditable'), 'false');
			assert.strictEqual(questionnaire_get_footer().css('display'), 'block');

			questionnaire_get_sections().each(function(index, section) {
				assert.strictEqual($(section).children('.panel-heading').children('.panel-title').attr('contenteditable'), 'false');
				assert.strictEqual($(section).children('.panel-body').children('p[class*="-description"]').attr('contenteditable'), 'false');
				assert.strictEqual($(section).children('.panel-footer').css('display'), 'none');
			});

			questionnaire_get_questions().each(function(index, question) {
				assert.strictEqual($(question).children('.panel-heading').children('.questionnaire-question-types-dropdown').css('display'), 'none');
			});
		});
	});
}