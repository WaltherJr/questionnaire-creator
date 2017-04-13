"use strict";

// QUnit unit test for questionnaire creator 'preview' functionality

var RUN_QUESTIONNAIRE_PREVIEW_TESTS = true;

if (RUN_QUESTIONNAIRE_PREVIEW_TESTS == true) {
	$(document).ready(function() {
		function generateRandomIntegerBetween(min, max) {
  			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		QUnit.module('QUESTIONNAIRE PREVIEW', {
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

		QUnit.test('Preview questionnaire', function(assert) {
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