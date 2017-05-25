"use strict";

/* General preview routines for questionnaire creator */

var questionnaire_preview_data = {
	classnames: {
		preview_mode_enabled_icon: 'glyphicon-eye-close',
		preview_mode_disabled_icon: 'glyphicon-eye-open',
		preview_questionnaire_button: 'questionnaire-preview-questionnaire-button'
	}
};

function questionnaire_preview_questionnaire(preview_mode_enabled) {
	if (preview_mode_enabled === true) {
		// Remove possible selection made from adding new radio button or checkbox
		window.getSelection().removeAllRanges();

		$(questionnaire.title.selector).attr('contenteditable', 'false');
		$(questionnaire.description.selector).attr('contenteditable', 'false');
		$('#questionnaire > .question > .panel-body > .question-description').attr('contenteditable', 'false');
		$('#questionnaire > footer').css('display', 'block');
		$('#questionnaire-context-toolbar').css('display', 'none');

		$('.questionnaire-operations-toolbar > button[class*="' + questionnaire_preview_data.classnames.preview_questionnaire_button + '"]')
			.addClass('active').attr('data-original-title', questionnaire.operations_toolbar.preview_button.preview_mode_enabled_tooltip_text).tooltip('show');

		$('.questionnaire-operations-toolbar > button[class*="' + questionnaire_preview_data.classnames.preview_questionnaire_button + '"] > span[class*="' + questionnaire_preview_data.classnames.preview_mode_disabled_icon + '"]').removeClass(questionnaire_preview_data.classnames.preview_mode_disabled_icon).addClass(questionnaire_preview_data.classnames.preview_mode_enabled_icon);
		$('.questionnaire-operations-toolbar > button:not([class*="' + questionnaire_preview_data.classnames.preview_questionnaire_button + '"])').addClass('disabled').prop('disabled', true);

		$('#questionnaire > .panel > .panel-heading > .questionnaire-question-types-dropdown').css('display', 'none');
		$('#questionnaire > .panel > .panel-heading > .panel-title').attr('contenteditable', 'false');
		$('#questionnaire > .panel > .panel-footer').css('display', 'none');

		questionnaire_set_links_click_behaviour(true);

	} else {
		$(questionnaire.title.selector).attr('contenteditable', 'true');
		$(questionnaire.description.selector).attr('contenteditable', 'true');
		$('#questionnaire > .question > .panel-body > .question-description').attr('contenteditable', 'true');
		$('#questionnaire > footer').css('display', 'none');
		$('#questionnaire-context-toolbar').css('display', 'block');

		$('.questionnaire-operations-toolbar > button[class*="' + questionnaire_preview_data.classnames.preview_questionnaire_button + '"]')
			.removeClass('active').attr('data-original-title', questionnaire.operations_toolbar.preview_button.preview_mode_disabled_tooltip_text).tooltip('show');

		$('.questionnaire-operations-toolbar > button[class*="' + questionnaire_preview_data.classnames.preview_questionnaire_button + '"] > span[class*="' + questionnaire_preview_data.classnames.preview_mode_enabled_icon + '"]').removeClass(questionnaire_preview_data.classnames.preview_mode_enabled_icon).addClass(questionnaire_preview_data.classnames.preview_mode_disabled_icon);
		$('.questionnaire-operations-toolbar > button:not([class*="' + questionnaire_preview_data.classnames.preview_questionnaire_button + '"])').removeClass('disabled').prop('disabled', false);

		$('#questionnaire > .panel > .panel-heading > .questionnaire-question-types-dropdown').css('display', 'inline');
		$('#questionnaire > .panel > .panel-heading > .panel-title').attr('contenteditable', 'true');
		$('#questionnaire > .panel > .panel-footer').css('display', 'block');

		questionnaire_set_links_click_behaviour(false);
	}

	questionnaire_preview_sections(preview_mode_enabled);
	return true;
}

function questionnaire_produce_single_multiple_choice_alternative_name(question_number, alternative_number) {
	if (question_number == undefined) {
		return '';
	} else {
		var prefix = 'question_';
		var suffix = '_alt_';

		if (alternative_number == undefined) {
			return prefix + question_number;
		} else {
			return prefix + question_number + suffix + alternative_number;
		}
	}
}

function questionnaire_preview_sections(preview_mode_enabled) {
	questionnaire_preview_heading_and_description(preview_mode_enabled);

	questionnaire_preview_question(preview_mode_enabled, 'short-answer', questionnaire_preview_short_answer);
	questionnaire_preview_question(preview_mode_enabled, 'paragraph', questionnaire_preview_paragraph);
	questionnaire_preview_question(preview_mode_enabled, 'single-choice-radio-buttons', questionnaire_preview_single_choice_radio_buttons);
	questionnaire_preview_question(preview_mode_enabled, 'single-choice-list', questionnaire_preview_single_choice_list);
	questionnaire_preview_question(preview_mode_enabled, 'multiple-choice-checkboxes', questionnaire_preview_multiple_choice_checkboxes);
	questionnaire_preview_question(preview_mode_enabled, 'multiple-choice-list', questionnaire_preview_multiple_choice_list);
	questionnaire_preview_question(preview_mode_enabled, 'ranked-choice', questionnaire_preview_ranked_choice);
}

function questionnaire_preview_heading_and_description(preview_mode_enabled) {
	$('#questionnaire > .heading-and-description > .panel-body > .heading-and-description-description').attr('contenteditable', preview_mode_enabled === true ? 'false': 'true');
}

function questionnaire_preview_question(preview_mode_enabled, question_type, question_type_preview_function) {
	$('#questionnaire > .question[data-current-question-type="' + question_type + '"] > .panel-body > div[class*="question-type"]')
	.each(function(question_index, question_type_div) {
		question_type_preview_function(preview_mode_enabled, question_index, question_type_div);
	});
}

/* Individual question type specific preview routines */
function questionnaire_preview_short_answer(preview_mode_enabled, question_index, question_type_div) {
	$(question_type_div).children('input[type="text"]').val('');
}

function questionnaire_preview_paragraph(preview_mode_enabled, question_index, question_type_div) {
	$(question_type_div).children('textarea').val('');
}

// Preview routine for single-choice-radion-buttons and multiple-choice-checkboxes
function questionnaire_preview_single_and_multiple_choice(preview_mode_enabled, question_index, question_type_div) {

	function iterate_over_alternatives(remove_alternative_button_display_mode,
									alternative_label_content_editable,
									choice_input_disabled,
									choice_input_selected,
									add_new_choice_display_mode,
									question_type)
	{
		$(question_type_div).children('.question-answer-alternatives').children('li').each(function(index, choice) {
			$(choice).children('span[class*="choice-remove-alternative-button"]').css('display', remove_alternative_button_display_mode);

			if (question_type === questionnaire.question_types.single_choice_radio_buttons.name) {
				$(choice).children('input[type="radio"]').attr({
					'id': questionnaire_produce_single_multiple_choice_alternative_name(question_index + 1, index + 1),
					'name': questionnaire_produce_single_multiple_choice_alternative_name(question_index + 1)
				});
			}

			$(choice).children('label').attr({
				'contenteditable': alternative_label_content_editable,
				'for': preview_mode_enabled === true ? $(choice).children('input').attr('id') : ''
			});

			$(choice).children('input[type="radio"], input[type="checkbox"]').prop({
				'disabled': choice_input_disabled,
				'checked': choice_input_selected
			});

			if ($(choice).next('li').length === 0) {
				// Last item - hide it
				$(choice).css('display', add_new_choice_display_mode);
			}
		});
	}

	if (preview_mode_enabled === true) {
		iterate_over_alternatives('none', 'false', false, false, 'none', questionnaire_get_question_type(question_type_div));
	} else {
		iterate_over_alternatives('inline', 'true', true, false, 'block', questionnaire_get_question_type(question_type_div));
	}

	/*
	if (preview_mode_enabled === true) {
		$(question_type_div).children('.question-answer-alternatives').children('li')
			.children('span[class*="choice-remove-alternative-button"]').css('display', 'none');
		$(question_type_div).children('.question-answer-alternatives').children('li:last-child').css('display', 'none');
	} else {
		$(question_type_div).children('.question-answer-alternatives').children('li')
			.children('span[class*="choice-remove-alternative-button"]').css('display', 'inline');
		$(question_type_div).children('.question-answer-alternatives').children('li:last-child').css('display', 'block');
	}
	*/
}

function questionnaire_preview_single_choice_radio_buttons(preview_mode_enabled, question_index, question_type_div) {
	questionnaire_preview_single_and_multiple_choice(preview_mode_enabled, question_index, question_type_div);
}

function questionnaire_preview_single_choice_list(preview_mode_enabled, question_index, question_type_div) {
	select_list_toggle_editable_mode($(question_type_div).children('.select-list'));
}

function questionnaire_preview_multiple_choice_checkboxes(preview_mode_enabled, question_index, question_type_div) {
	questionnaire_preview_single_and_multiple_choice(preview_mode_enabled, question_index, question_type_div);
}

function questionnaire_preview_multiple_choice_list(preview_mode_enabled, question_index, question_type_div) {
	select_list_toggle_editable_mode($(question_type_div).children('.select-list'));
}

function questionnaire_preview_ranked_choice(preview_mode_enabled, question_index, question_type_div) {
	if (preview_mode_enabled === true) {
		$(question_type_div).children('.ranked-choice-scale-text-list').children('li').children('span').attr('contenteditable', 'false');
		$(question_type_div).children('.ranked-choice-add-alternative-button').css('display', 'none');
		$(question_type_div).children('.ranked-choice-alternatives-list').children('li').children('.ranked-choice-alternative-remove-button').css('display', 'none');
		$(question_type_div).children('.ranked-choice-order-description').css('display', 'block');
		$(question_type_div).children('.ranked-choice-type-select-list-label').css('display', 'none');
	} else {
		$(question_type_div).children('.ranked-choice-scale-text-list').children('li').children('span').attr('contenteditable', 'true');
		$(question_type_div).children('.ranked-choice-add-alternative-button').css('display', 'inline');
		$(question_type_div).children('.ranked-choice-alternatives-list').children('li').children('.ranked-choice-alternative-remove-button').css('display', 'inline');
		$(question_type_div).children('.ranked-choice-order-description').css('display', 'none');
		$(question_type_div).children('.ranked-choice-type-select-list-label').css('display', 'inline');
	}
}