"use strict";

function questionnaire_validate() {
	var mandatory_questions = questionnaire_get_mandatory_questions();
	var invalid_questions = [];

	mandatory_questions.each(function(index, mandatory_question) {
		if (questionnaire_validate_question(mandatory_question) === false) {
			// Question answer is invalid
			$(mandatory_question).addClass(questionnaire.question.invalid_question.classname);
			$(mandatory_question).find('.question-type-validation-field').popover('show');

			invalid_questions.push(mandatory_question);
		} else {
			// Question answer is valid
			$(mandatory_question).removeClass(questionnaire.question.invalid_question.classname);
			$(mandatory_question).find('.question-type-validation-field').popover('hide');
		}
	});

	return $(invalid_questions);
}

function questionnaire_remove_mandatory_questions_invalid_class() {
	questionnaire_get_mandatory_questions().each(function(index, mandatory_question) {
		$(mandatory_question).removeClass(questionnaire.question.invalid_question.classname);
		$(mandatory_question).find('.question-type-validation-field').popover('hide');
	});
}

function questionnaire_hide_question_validation_error(question_div) {
	var alert_div = question_div.children('.panel-body').children('.alert');
	$(alert_div).css('display', 'none');
}

function questionnaire_display_question_validation_error(question_div) {
	var alert_div = $(question_div).children('.panel-body').children('.alert');
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
		return true;
	} else {
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
	var transformed_question_type_string = question_type.replace(/-/g, '_');

	var validation_result = questionnaire.question_types[transformed_question_type_string].validation(question_div);

	return validation_result;
}

function questionnaire_clear_question_validation_error(question_div) {
	var question_type = questionnaire_get_question_type(question_div);
	var transformed_question_type_string = question_type.replace(/-/g, '_');

	questionnaire.question_types[transformed_question_type_string].clear_validation_error(question_div);
}