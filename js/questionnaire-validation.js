"use strict";

/* General preview routines for questionnaire creator */

function questionnaire_validate_questionnaire() {
	var mandatory_checkboxes = $("#questionnaire > .question > .panel-footer > .checkbox-inline > .lbl-mandatory-question > input[type='checkbox']:checked");
	var questionnaire_validated = true;

	if (mandatory_checkboxes.length > 0) {
		$(mandatory_checkboxes).each(function(index, element) {
			if (questionnaire_validate_question($(element).closest('div.question')) == false) {
				questionnaire_validated = false;
			}
		});

		if (questionnaire_validated == false) {
			$('html, body').animate({scrollTop: $(mandatory_checkboxes.first().closest('.question')).offset().top}, 700);
		} else {
			$('#modal-questionnaire-submitted').modal();
		}
	}
}

function questionnaire_remove_all_question_validation_errors() {
	var mandatory_checkboxes = $("#questionnaire > .question > .panel-footer > .checkbox-inline > .lbl-mandatory-question > input[type='checkbox']:checked");

	$(mandatory_checkboxes).each(function(index, element) {
		$(element).closest('div.question').children('.panel-heading').children('.panel-title').popover('destroy');
	});
}

function questionnaire_hide_question_validation_error(question_div) {
	var alert_div = question_div.children('.panel-body').children('.alert');
	$(alert_div).css('display', 'none');
}

function questionnaire_display_question_validation_error(question_div) {
	var alert_div = question_div.children('.panel-body').children('.alert');
	$(alert_div).css('display', 'block');
}

function questionnaire_validate_single_choice_radio_buttons_question(question_div) {
	var single_choice_list = $(question_div).find('.question-answer-alternatives');
	var checked_inputs = single_choice_list.children('li').children('input:checked');

	if (checked_inputs.length == 1) {
		questionnaire_hide_question_validation_error(question_div);
		return true;
	} else {
		questionnaire_display_question_validation_error(question_div);
		return false;
	}
}

function questionnaire_validate_choice_list_question(question_div) {
	var select_list = $(question_div).find(select_list_data.selector('LIST'));
	var selected_alternatives = select_list_get_selected_alternatives(select_list);

	if (selected_alternatives.length != 0) {
		questionnaire_hide_question_validation_error(question_div);
		return true;
	} else {
		questionnaire_display_question_validation_error(question_div);
		return false;
	}
}

function questionnaire_validate_single_choice_list_question(question_div) {
	return questionnaire_validate_choice_list_question(question_div);
}

function questionnaire_validate_multiple_choice_list_question(question_div) {
	return questionnaire_validate_choice_list_question(question_div);
}

function questionnaire_validate_multiple_choice_checkboxes_question(question_div) {
	var single_choice_list = $(question_div).find('.question-answer-alternatives');
	var checked_inputs = single_choice_list.children('li').children('input:checked');

	if (checked_inputs.length > 0) {
		questionnaire_hide_question_validation_error(question_div);
		return true;
	} else {
		questionnaire_display_question_validation_error(question_div);
		return false;
	}
}

function questionnaire_validate_short_answer_question(question_div) {
	var short_answer_div = $(question_div).find('input.question-short-answer-text');

	if (short_answer_div.val() != '') {
		questionnaire_hide_question_validation_error(question_div);
		return true;
	} else {
		questionnaire_display_question_validation_error(question_div);
		return false;
	}
}

function questionnaire_validate_paragraph_question(question_div) {
	var paragraph_div = $(question_div).find('div.question-type-paragraph').children('textarea');

	if (paragraph_div.val() != '') {
		questionnaire_hide_question_validation_error(question_div);
		return true;
	} else {
		questionnaire_display_question_validation_error(question_div);
		return false;
	}
}

function questionnaire_validate_ranked_choice_question(question_div) {
	return true;
}

function questionnaire_validate_question(question_div) {
	var question_type = questionnaire_get_question_type(question_div);

	if (question_type == 'short-answer') {
		return questionnaire_validate_short_answer_question(question_div);

	} else if (question_type == 'paragraph') {
		return questionnaire_validate_paragraph_question(question_div);

	} else if (question_type == 'single-choice-radio-buttons') {
		return questionnaire_validate_single_choice_radio_buttons_question(question_div);

	} else if (question_type == 'single-choice-list') {
		return questionnaire_validate_single_choice_list_question(question_div);

	} else if (question_type == 'multiple-choice-checkboxes') {
		return questionnaire_validate_multiple_choice_checkboxes_question(question_div);

	} else if (question_type == 'multiple-choice-list') {
		return questionnaire_validate_multiple_choice_list_question(question_div);
	}
}