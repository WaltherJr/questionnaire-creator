"use strict";

// QUnit unit test for 'questionnaire validation' software part

var RUN_QUESTIONNAIRE_VALIDATION_TESTS = false;

if (RUN_QUESTIONNAIRE_VALIDATION_TESTS == true) {
	$(document).ready(function() {
		QUnit.module('Questionnaire validation tests');

		QUnit.test('Empty questionnaire', function(assert) {
			assert.expect(1);
			assert.strictEqual(questionnaire_validate_questionnaire(), true);
		});

		QUnit.test('Questionnaire with only heading and descriptions', function(assert) {
			var number_of_heading_and_descriptions_added = 10;

			assert.expect(number_of_heading_and_descriptions_added + 1);

			for (var i = 0; i < number_of_heading_and_descriptions_added; i++) {
				assert.ok(questionnaire_add_heading_and_description());
			}

			assert.strictEqual(questionnaire_validate_questionnaire(), true);
		});

		QUnit.test('Question type "short answer"', function(assert) {
			assert.expect(5);

			var short_answer_question = questionnaire_add_question(questionnaire.question_types.short_answer.name);

			assert.ok(short_answer_question);
			assert.strictEqual(questionnaire_validate_questionnaire(), false);

			assert.ok(questionnaire.question_types.short_answer.set_answer_text(short_answer_question, 'Hello World!'));
			assert.strictEqual(questionnaire.question_types.short_answer.get_answer_text(short_answer_question), 'Hello World!');

			assert.strictEqual(questionnaire_validate_questionnaire(), true);
		});

		QUnit.test('Question type "paragraph"', function(assert) {
			assert.expect(5);

			var paragraph_question = questionnaire_add_question(questionnaire.question_types.paragraph.name);

			assert.ok(paragraph_question);
			assert.strictEqual(questionnaire_validate_questionnaire(), false);

			assert.ok(questionnaire.question_types.paragraph.set_answer_text(paragraph_question, 'Hello World!'));
			assert.strictEqual(questionnaire.question_types.paragraph.get_answer_text(paragraph_question), 'Hello World!');

			assert.strictEqual(questionnaire_validate_questionnaire(), true);
		});

		QUnit.test('Question type "single choice: radio buttons"', function(assert) {
			assert.expect(2);

			var single_choice_radio_buttons_question = questionnaire_add_question(questionnaire.question_types.single_choice_radio_buttons.name);

			assert.ok(single_choice_radio_buttons_question);
			assert.strictEqual(questionnaire_validate_questionnaire(), false);
		});

		QUnit.test('Question type "single choice: list"', function(assert) {
			assert.expect(1);
			assert.ok(true);
		});

		QUnit.test('Question type "multiple choice: checkboxes"', function(assert) {
			assert.expect(1);
			assert.ok(true);
		});

		QUnit.test('Question type "multiple choice: list"', function(assert) {
			assert.expect(1);
			assert.ok(true);
		});

		QUnit.test('Question type "ranked choice"', function(assert) {
			assert.expect(1);
			assert.ok(true);
		});

		/*
		QUnit.test('Invalid questions', function(assert) {
			var number_of_question_types = Object.keys(questionnaire.question_types).length;

			assert.expect(number_of_question_types + 1);

			for (var question_type in questionnaire.question_types) {
				assert.ok(questionnaire_add_question(questionnaire.question_types[question_type]));
			}

			assert.strictEqual(questionnaire_validate_questionnaire(), false);
		});
		*/
	});
}
