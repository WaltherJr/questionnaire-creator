
function questionnaire_duplicate_section(section) {
	var section_height = $(section).outerHeight(true);
	var question_type = getCurrentQuestionType(section);
	var section_z_index = parseInt($(section).css('z-index'));
	var duplicated_section = $(section).clone(true, true);

	$(section).prevAll('.panel').css('z-index', '+=1');
	$(section).css('z-index', '+=1');

	$(duplicated_section).css({
		'top': -section_height + 'px',
		'margin-bottom': -$(section).outerHeight() + 'px'
	});

	$(section).nextAll('.panel').each(function(index, element) {
		var current_question_type = getCurrentQuestionType(element);

		if (current_question_type == 'single-choice' || current_question_type == 'multiple-choice') {
			modifyAnswerAlternativesList(current_question_type,
					$(element).find('ul.question-answer-alternatives'),
					($(element).index()+1));
		}
	});

	$(section).after(duplicated_section);
	modifyAnswerAlternativesList(question_type, $(duplicated_section).find('ul.question-answer-alternatives'), section_z_index+2);

	$(duplicated_section).addClass('animate-duplicate');
	$(duplicated_section).css({
		'top': '+=' + section_height + 'px',
		'margin-bottom': '+=' + $(section).outerHeight(true) + 'px'
	});

	setTimeout(function() {
		$(duplicated_section).removeClass('animate-duplicate');
	}, 700);

	return duplicated_section;
}
