
function moveSection(section, direction) {
	var section_height = $(section).outerHeight();
	var section_count = $('#questionnaire > .panel').length;
	var current_question_type = getCurrentQuestionType(section);
	var section_index = $(section).css('z-index');
	var sibling_section = null;
	var sibling_question_type = null;
	var sibling_section_index = section_index;

	if (direction == 'up' && section_index < section_count) {
		sibling_section_index--;
		console.log(sibling_section_index);

		sibling_section = $("#questionnaire > .panel:nth-of-type(" + sibling_section_index + ')');

		sibling_question_type = getCurrentQuestionType(sibling_section);

		if (current_question_type == 'single-choice-radio-buttons' || current_question_type == 'multiple-choice-checkboxes') {
			modifyAnswerAlternativesList(current_question_type,
					$(section).find('ul.question-answer-alternatives'),
					section_index-1);
		}

		if (sibling_question_type == 'single-choice-radio-buttons' || sibling_question_type == 'multiple-choice-checkboxes') {
			modifyAnswerAlternativesList(sibling_question_type,
					$(sibling_section).find('ul.question-answer-alternatives'),
					section_index);
		}

			$(sibling_section).css({
				'z-index': '-=1'
			});
			$(section).css({
				'z-index': '+=1'
			});

			$(sibling_section).css('top', '+=' + $(section).outerHeight(true) + 'px');
			$(section).css('top', '-=' + $(sibling_section).outerHeight(true) + 'px');

		return true;

	} else if (direction == 'down' && section_index >= 1) {
		sibling_section = $("#questionnaire > .panel:nth-of-type(" + sibling_section_index + ')');

		sibling_question_type = getCurrentQuestionType(sibling_section);

			$(sibling_section).css({
				'z-index': '+=1'
			});

			$(section).css({
				'z-index': '-=1'
			});


			$(sibling_section).css('top', '-=' + $(section).outerHeight(true) + 'px');
			$(section).css('top', '+=' + $(sibling_section).outerHeight(true) + 'px');

		if (current_question_type == 'single-choice-radio-buttons' || current_question_type == 'multiple-choice-checkboxes') {
			modifyAnswerAlternativesList(current_question_type,
					$(section).find('ul.question-answer-alternatives'),
					section_index+1);
		}

		if (sibling_question_type == 'single-choice-radio-buttons' || sibling_question_type == 'multiple-choice-checkboxes') {
			modifyAnswerAlternativesList(sibling_question_type,
					$(sibling_section).find('ul.question-answer-alternatives'),
					section_index);
		}

		return true;

	} else {
		return false;
	}
}
