function generateRandomSections(number) {
	var random_sections = new Array(number);

	for (i = 0; i < random_sections.length; i++) {
		if (Math.round(Math.random()) == 0) {
			random_sections[i] = addHeadingAndDescription();
		} else {
			var rand = Math.floor(Math.random() * 5) + 1;

			if (rand == 1) {
				random_sections[i] = addQuestion('short-answer');
			} else if (rand == 2) {
				random_sections[i] = addQuestion('paragraph');
			} else if (rand == 3) {
				random_sections[i] = addQuestion('single-choice');
			} else if (rand == 4) {
				random_sections[i] = addQuestion('multiple-choice');
			} else if (rand == 5) {
				random_sections[i] = addQuestion('ranked-choice');
			}
		}
	}

	return random_sections;
}

QUnit.module('section');

QUnit.test('addHeadingAndDescription', function(assert) {
	var initial_number_of_sections = $('#questionnaire > .panel').length;

	var new_heading_and_description_div = addHeadingAndDescription();
	var last_section = $('#questionnaire > .panel').last();

	assert.equal($('#questionnaire > .panel').length, initial_number_of_sections+1);
	assert.deepEqual($(last_section), $(new_heading_and_description_div));
});

QUnit.test('addQuestion', function(assert) {
	var initial_number_of_sections = $('#questionnaire > .panel').length;

	var new_question_div = addQuestion('short-answer');
	var last_section = $('#questionnaire > .panel').last();

	assert.equal($('#questionnaire > .panel').length, initial_number_of_sections+1);
	assert.deepEqual($(last_section), $(new_question_div));
});

QUnit.test('addQuestionWithInvalidQuestionType', function(assert) {
	var new_question_div = addQuestion('random');

	assert.equal(new_question_div, false);
	new_question_div = addQuestion(null);
	assert.equal(new_question_div, false);
	new_question_div = addQuestion('');
	assert.equal(new_question_div, false);
	new_question_div = addQuestion(123);
	assert.equal(new_question_div, false);
});

QUnit.test('removeFirstSection', function(assert) {
	var done = assert.async();
	var added_sections = generateRandomSections(7);
	var initial_number_of_sections = $('#questionnaire > .panel').length;

	removeSection(added_sections[0]);

	setTimeout(function() {
		var updated_sections = $('#questionnaire > .panel');

		assert.equal($('#questionnaire > .panel').length, initial_number_of_sections-1);

		for (i = 0; i < updated_sections.length; i++) {
			assert.deepEqual($(updated_sections[i]), $(added_sections[i+1]));
		}

		done();
	}, 1000);
});

QUnit.test('removeLastSection', function(assert) {
	var done = assert.async();
	var added_sections = generateRandomSections(7);
	var initial_number_of_sections = $('#questionnaire > .panel').length;

	removeSection(added_sections[added_sections.length-1]);

	setTimeout(function() {
		var updated_sections = $('#questionnaire > .panel');

		assert.equal($('#questionnaire > .panel').length, initial_number_of_sections-1);

		for (i = 0; i < updated_sections.length; i++) {
			assert.deepEqual($(updated_sections[i]), $(added_sections[i]));
		}

		done();
	}, 1000);
});

QUnit.test('duplicateSection', function(assert) {
	var added_sections = generateRandomSections(7);
	var initial_number_of_sections = $('#questionnaire > .panel').length;
	var duplicated_section_index = Math.floor(added_sections.length / 2);
	var duplicated_section = duplicateSection(added_sections[duplicated_section_index]);

	assert.equal($('#questionnaire > .panel').length, initial_number_of_sections+1);

	var updated_sections = $('#questionnaire > .panel');

	for (i = 0; i < updated_sections.length-1; i++) {
		if (i <= duplicated_section_index) {
			assert.deepEqual($(updated_sections[i]), $(added_sections[i]));
		} else if (i > duplicated_section_index) {
			//assert.deepEqual($(updated_sections[i-1]), $(added_sections[i]));
		}
	}
});

QUnit.module('question_type');

QUnit.test('validQuestionType', function(assert) {
	assert.equal(isValidQuestionType('short-answer'), true);
	assert.equal(isValidQuestionType('paragraph'), true);
	assert.equal(isValidQuestionType('single-choice'), true);
	assert.equal(isValidQuestionType('multiple-choice'), true);
	assert.equal(isValidQuestionType('ranked-choice'), true);
});

QUnit.test('invalidQuestionType', function(assert) {
	assert.equal(isValidQuestionType(''), false);
	assert.equal(isValidQuestionType('random'), false);
	assert.equal(isValidQuestionType(null), false);
	assert.equal(isValidQuestionType(123), false);
});

QUnit.test('changeQuestionTypeToSameQuestionType', function(assert) {
	var new_question_div = addQuestion('paragraph');

	assert.equal(getCurrentQuestionType(new_question_div), 'paragraph');
	assert.equal(changeQuestionType(new_question_div, 'paragraph'), false);
});

QUnit.test('changeQuestionTypeToDifferentQuestionType', function(assert) {
	var new_question_div = addQuestion('single-choice');

	assert.equal(getCurrentQuestionType(new_question_div), 'single-choice');
	assert.equal(changeQuestionType(new_question_div, 'multiple-choice'), true);
});

QUnit.test('changeQuestionTypeToInvalidQuestionType', function(assert) {
	var new_question_div = addQuestion('short-answer');

	assert.equal(getCurrentQuestionType(new_question_div), 'short-answer');
	assert.equal(changeQuestionType(new_question_div, ''), false);
	assert.equal(changeQuestionType(new_question_div, null), false);
	assert.equal(changeQuestionType(new_question_div, 'random'), false);
	assert.equal(changeQuestionType(new_question_div, 123), false);
	assert.equal(getCurrentQuestionType(new_question_div), 'short-answer');
});

QUnit.module('questionnaire');

QUnit.test('previewQuestionnaire', function(assert) {
	var added_sections = generateRandomSections(7);

	assert.equal($('#questionnaire > .panel').length, 7);

	assert.notOk($('#questionnaire').hasClass('is-previewing'));
	assert.equal($('#questionnaire > header > h1').attr('contenteditable'), 'true');
	assert.equal($('#questionnaire > header > p.lead').attr('contenteditable'), 'true');

	$('#questionnaire > .panel > .panel-heading > .panel-title').each(function(index, element) {
		assert.equal($(element).attr('contenteditable'), 'true');
	});

	$('#questionnaire > .panel > .panel-body p.question-description').each(function(index, element) {
		assert.equal($(element).attr('contenteditable'), 'true');
	});

	$('#questionnaire > .panel > .panel-footer').each(function(index, element) {
		assert.equal($(element).css('display'), 'block');
	});

	// Preview the questionnaire
	previewQuestionnaire();

	assert.ok($('#questionnaire').hasClass('is-previewing'));
	assert.equal($('#questionnaire > header > h1').attr('contenteditable'), 'false');
	assert.equal($('#questionnaire > header > p.lead').attr('contenteditable'), 'false');

	$('#questionnaire > .panel > .panel-heading > .panel-title').each(function(index, element) {
		assert.equal($(element).attr('contenteditable'), 'false');
	});

	$('#questionnaire > .panel > .panel-body p.question-description').each(function(index, element) {
		assert.equal($(element).attr('contenteditable'), 'false');
	});

	$('#questionnaire > .panel > .panel-footer').each(function(index, element) {
		assert.equal($(element).css('display'), 'none');
	});
});

QUnit.test('clearQuestionnaire', function(assert) {
	var added_sections = generateRandomSections(7);

	assert.equal($('#questionnaire > .panel').length, 7);

	clearQuestionnaire();

	assert.equal($('#questionnaire > .panel').length, 0);
	assert.equal($('#questionnaire > header > h1').text(), 'Namnlöst formulär');
	assert.equal($('#questionnaire > header > p').text(), 'Beskrivning av formulär');
});

QUnit.module('movement');

QUnit.test('moveSectionUp', function(assert) {
	var added_sections = generateRandomSections(7);
	var section_tops = new Array(7);
	var section_z_indexes = new Array(7);
	var moved_section_index = Math.floor(added_sections.length / 2);
	var moved_section_z_index = parseInt($(added_sections[moved_section_index]).css('z-index'));
	var moved_section_top = parseInt($(added_sections[moved_section_index]).css('top'));

	for (i = 0; i < added_sections.length; i++) {
		section_tops[i] = parseInt(added_sections[i].css('top'));
		section_z_indexes[i] = parseInt(added_sections[i].css('z-index'));
	}

	assert.ok(moveSection(added_sections[moved_section_index], 'up'));

	$('#questionnaire > .panel').each(function(index, panel) {
		if (index < moved_section_index-1) {
			assert.equal(parseInt($(panel).css('z-index')), section_z_indexes[index]);
		} else if (index == moved_section_index-1) {
			assert.equal(parseInt($(panel).css('z-index')), section_z_indexes[index+1]);
		} else if (index == moved_section_index) {
			assert.equal(parseInt($(panel).css('z-index')), section_z_indexes[index-1]);
		} else if (index > moved_section_index) {
			assert.equal(parseInt($(panel).css('z-index')), section_z_indexes[index]);
		}
	});
});

QUnit.test('moveSectionDown', function(assert) {
	var added_sections = generateRandomSections(7);
	var section_tops = new Array(7);
	var section_z_indexes = new Array(7);
	var moved_section_index = Math.floor(added_sections.length / 2);
	var moved_section_z_index = parseInt($(added_sections[moved_section_index]).css('z-index'));
	var moved_section_top = parseInt($(added_sections[moved_section_index]).css('top'));

	for (i = 0; i < added_sections.length; i++) {
		section_tops[i] = parseInt(added_sections[i].css('top'));
		section_z_indexes[i] = parseInt(added_sections[i].css('z-index'));
	}

	assert.ok(moveSection(added_sections[moved_section_index], 'down'));

	$('#questionnaire > .panel').each(function(index, panel) {
		if (index < moved_section_index-1) {
			assert.equal(parseInt($(panel).css('z-index')), section_z_indexes[index]);
			assert.equal(parseInt($(panel).css('top')), section_tops[index]);
		} else if (index == moved_section_index) {
			assert.equal(parseInt($(panel).css('z-index')), section_z_indexes[index+1]);
			assert.equal(parseInt($(panel).css('top')), section_tops[index] * moved_section_top);
		} else if (index == moved_section_index+1) {
			assert.equal(parseInt($(panel).css('z-index')), section_z_indexes[index-1]);
			assert.equal(parseInt($(panel).css('top')), section_tops[index-1] + moved_section_top);
		} else if (index > moved_section_index) {
			assert.equal(parseInt($(panel).css('z-index')), section_z_indexes[index]);
			assert.equal(parseInt($(panel).css('top')), section_tops[index]);
		}
	});
});

QUnit.test('moveFirstSectionUp', function(assert) {
	var added_sections = generateRandomSections(7);
	var section_tops = new Array(7);
	var section_z_indexes = new Array(7);

	for (i = 0; i < added_sections.length; i++) {
		section_tops[i] = parseInt(added_sections[i].css('top'));
		section_z_indexes[i] = parseInt(added_sections[i].css('z-index'));
	}

	assert.notOk(moveSection(added_sections[0], 'up'));

	$('#questionnaire > .panel').each(function(index, panel) {
		assert.equal($(panel).css('z-index'), section_z_indexes[index]);
	});
});

QUnit.test('moveLastSectionDown', function(assert) {
	var added_sections = generateRandomSections(7);
	var section_tops = new Array(7);
	var section_z_indexes = new Array(7);

	for (i = 0; i < added_sections.length; i++) {
		section_tops[i] = parseInt(added_sections[i].css('top'));
		section_z_indexes[i] = parseInt(added_sections[i].css('z-index'));
	}

	assert.notOk(moveSection(added_sections[added_sections.length-1], 'down'));

	$('#questionnaire > .panel').each(function(index, panel) {
		assert.equal($(panel).css('z-index'), section_z_indexes[index]);
	});
});

QUnit.test('moveOnlyOneSectionUp', function(assert) {
	var only_section = addQuestion('single-choice');
	var only_section_index = $(only_section).index();
	var only_section_z_index = parseInt($(only_section).css('z-index'));

	assert.notOk(moveSection(only_section, 'up'));
	assert.equal(only_section_index, $(only_section).index());
	assert.equal(only_section_z_index, parseInt($(only_section).css('z-index')));
});

QUnit.test('moveOnlyOneSectionDown', function(assert) {
	var only_section = addQuestion('single-choice');
	var only_section_index = $(only_section).index();
	var only_section_z_index = parseInt($(only_section).css('z-index'));

	assert.notOk(moveSection(only_section, 'down'));
	assert.equal(only_section_index, $(only_section).index());
	assert.equal(only_section_z_index, parseInt($(only_section).css('z-index')));
});

QUnit.test('moveSingleChoiceQuestionUp', function(assert) {
	var heading_and_description_div = addHeadingAndDescription();
	var single_choice_question_div = addQuestion('single-choice');

	assert.ok(moveSection(single_choice_question_div, 'up'));
});