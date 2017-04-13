"use strict";

// QUnit unit test for questionnaire creator 'preview' functionality

var RUN_QUESTIONNAIRE_PREVIEW_TESTS = true;

if (RUN_QUESTIONNAIRE_PREVIEW_TESTS == true) {
	$(document).ready(function() {
		QUnit.module('Preview', {
			beforeEach: function(assert) {
				// Random integer between 1 and 20
				var random_integer = Math.floor((Math.random() * 20) + 1);
				this.number_of_added_sections = 0;

				for (var i = 1; i <= random_integer; i++) {
					// Random section integer between 1 and 2
					var random_section = Math.floor((Math.random() * 2) + 1);

					// Random section integer should be 1 or 2
					assert.strictEqual(random_section >= 1 && random_section <= 2, true);

					if (random_section === 1) {
						assert.ok(questionnaire_add_question());
						assert.strictEqual(questionnaire_get_sections().length, ++this.number_of_added_sections);

					} else if (random_section === 2) {
						assert.ok(questionnaire_add_heading_and_description());
						assert.strictEqual(questionnaire_get_sections().length, ++this.number_of_added_sections);
					}
				}
			}
		});

		QUnit.test('Preview questionnaire heading and description', function(assert) {
			assert.expect(9*this.number_of_added_sections + 7);

			assert.strictEqual($(questionnaire.title.selector).attr('contenteditable'), 'true');
			assert.strictEqual($(questionnaire.description.selector).attr('contenteditable'), 'true');
			assert.strictEqual(questionnaire_get_footer().css('display'), 'none');

			questionnaire_get_sections().each(function(index, section) {
				assert.strictEqual($(section).children('.panel-heading').children('.panel-title').attr('contenteditable'), 'true');
				assert.strictEqual($(section).children('.panel-body').children('p[class*="-description"]').attr('contenteditable'), 'true');
				assert.strictEqual($(section).children('.panel-footer').css('display'), 'block');
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
		});
	});
}