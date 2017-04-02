var QUESTIONNAIRE_DEFAULT_QUESTION_TYPE = 'ranked-choice';
var QUESTIONNAIRE_DEFAULT_RANKED_CHOICE_STEPS = 15;

$(document).ready(function() {
	//Shiny.addCustomMessageHandler("questionnaire_saveHandler", questionnaire_saveHandler);
	//Shiny.addCustomMessageHandler("questionnaire_loadHandler", questionnaire_loadHandler);

	$('.ranked-choice-order-description').before(ranked_choice_create_new(QUESTIONNAIRE_DEFAULT_RANKED_CHOICE_STEPS));
	$('.question-type-single-choice-list').append(select_list_create_new(true, false));
	$('.question-type-multiple-choice-list').append(select_list_create_new(true, true));

	$('.ranked-choice-choice-type').change(function() {
		 changeRankedChoiceType(this);
	});

	$('[data-toggle="tooltip"]').tooltip({container: 'body'});

	$('.btn-add-question').click(function() {
		questionnaire_add_question(QUESTIONNAIRE_DEFAULT_QUESTION_TYPE);
		$(this).blur();
	});

	$('#btn-submit-questionnaire').click(function() {
		questionnaire_submit();
		$(this).blur();
	});

	$('.mnu-question-type a').click(function(event) {
		event.preventDefault();
	});

	$('.btn-add-hyperlink').click(function() {
		$(this).blur();

		var range = window.getSelection().getRangeAt(0);
		showAddHyperlinkModal();

		$('#modal-add-link button[class*="btn-primary"]').click(function() {
			questionnaire_insert_link(range);
		});
	});

	$('.lbl-add-answer-alternative').click(function() {
		questionnaire_add_question_answer_alternative($(this).closest('.panel'));
	});

	$('.btn-add-email-link').click(function() {
		$(this).blur();

		var range = window.getSelection().getRangeAt(0);
		showAddEmailLinkModal();

		$('#modal-add-link button[class*="btn-primary"]').click(function() {
			questionnaire_insert_link(range);
		});
	});

	$('.btn-add-image').click(function() {
		$(this).blur();

		var range = window.getSelection().getRangeAt(0);
		showAddImageModal();

		$('#modal-add-image button[class*="btn-primary"]').click(function() {
			questionnaire_insert_image(range);
		});
	});

	$('.ranked-choice-alternatives-list').tooltip({'title': 'Ta bort alternativ', 'placement': 'right', 'container': 'body', 'selector': '.remove-ranked-choice'});

	$('.btn-add-heading-and-description').click(function() {
		questionnaire_add_heading_and_description();
		$(this).blur();
	});

	$('.btn-add-ranked-choice').click(function() {
		ranked_choice_add_alternative($(this).closest('.question-type-ranked-choice').children('.ranked-choice'));
	});

	$('.btn-remove-answer-alternative').click(removeQuestionAnswerAlternative);

	$('ul.mnu-question-type').children('li').click(function() {
		questionnaire_change_question_type($(this).closest('.panel'), $(this).attr('data-question-type'));
	});

	$('.btn-remove-section').click(function() {
		$(this).tooltip('destroy');
		questionnaire_remove_section($(this).closest('.panel'));
		$(this).blur();
	});

	$('.btn-duplicate-section').click(function() {
		$(this).tooltip('hide');
		$(this).blur();
		questionnaire_duplicate_section($(this).closest('.panel'));
	});

	$('.btn-move-section-down').click(function() {
		questionnaire_move_section($(this).closest('.panel'), 'down');
		$(this).tooltip('hide');
		$(this).blur();
	});

	$('.btn-move-section-up').click(function() {
		questionnaire_move_section($(this).closest('.panel'), 'up');
		$(this).tooltip('hide');
		$(this).blur();
	});

	$('.lbl-mandatory-question').click(function() {
		$(this).blur();
	});

	$('.btn-save-questionnaire').click(function() {
		$(this).blur();
	});

	$('.btn-load-questionnaire').click(function() {
		$(this).blur();
	});

	$('.btn-clear-questionnaire').click(function() {
		$(this).blur();
		confirmClearQuestionnaire();
	});

	$('#modal-clear-questionnaire button[class*="btn-danger"]').click(questionnaire_clear);

	$('.btn-preview-questionnaire').click(function() {
		questionnaire_preview();
		$(this).blur();
	});

	$(document).click(function(event) {
		if ($(event.target).closest("div[class*='section']").length == 0) {
			$('.focused').removeClass('focused');
		}
	});
});

function questionnaire_is_previewing() {
	return true;
}

function questionnaire_insert_link(range) {
	var link_type = $('#modal-add-link').attr('data-link-type');
	var link_address = '';
	var new_link = document.createElement('a');

	if (link_type == 'hyperlink') {
		link_address = $('#modal-add-link').find('input[id="txt-link-address"]').val();
	} else if (link_type == 'email-link') {
		link_address = 'mailto:' + $('#modal-add-link').find('input[id="txt-link-address"]').val();
	}

	console.log(link_address);

	new_link.setAttribute('href', link_address);
	new_link.setAttribute('target', '_blank');

	range.surroundContents(new_link);
}

function questionnaire_insert_image(range) {
	var image_adress = $('#modal-add-image').find('input[id="txt-image-address"]').val();
	var new_image = document.createElement('img');

	new_image.setAttribute('src', image_adress);
	new_image.setAttribute('tabindex', '0');

	range.deleteContents();
	range.insertNode(new_image);

	$(new_image).click(function() {
		var selection = window.getSelection();

		if (selection.rangeCount > 0) {
			selection.removeAllRanges();
		}

		var image_range = document.createRange();

		image_range.selectNode($(this).get(0));
		selection.addRange(range);
	});
}

function showAddHyperlinkModal() {
	var selection = window.getSelection();

	console.log(selection.getRangeAt(0));

	if (selection != null) {
		$('#modal-add-link').attr('data-link-type', 'hyperlink');
		$('#modal-add-link').find('.modal-title').text('Lägg till hyperlänk');
		$('#modal-add-link').find('input[id="txt-link-text"]').attr('value', selection.toString());
		$('#modal-add-link').find('label[class*="lbl-link-address"]').text('Länkadress: ');
		$('#modal-add-link').find('input[id="txt-link-address"]').attr({'placeholder': 'http://www.example.com', 'value': ''});
		$('#modal-add-link').modal();
	} else {

	}
}

function showAddEmailLinkModal() {
	var selection = window.getSelection();

	if (selection != null && selection.toString() != '') {
		$('#modal-add-link').attr('data-link-type', 'email-link');
		$('#modal-add-link').find('.modal-title').text('Lägg till email-länk');
		$('#modal-add-link').find('input[id="txt-link-text"]').attr('value', selection.toString());
		$('#modal-add-link').find('label[class*="link-address"]').text('Email-adress: ');
		$('#modal-add-link').find('input[id="txt-link-address"]').attr({'placeholder': 'john.doe@example.com', 'value': ''});
		$('#modal-add-link').modal();
	} else {

	}
}

function showAddImageModal() {
	$('#modal-add-image').modal();
}

function hideAllSections() {
	$("#questionnaire > .panel").each(function(index, section) {
		questionnaire_hide_section(section);
	});

	$('#btn-questionnaire-hide-all-sections').css('display', 'none');
	$('#btn-questionnaire-show-all-sections').css('display', 'inline');
}

function questionnaire_hide_section(element) {
	var section_div = $(element).closest('div.section');
	var section_top_operations_list = section_div.children('ul.section-top-operations-list');
	var section_title = section_div.children('div').first();
	var new_section_div_height = section_title.outerHeight();

	section_div.css('overflow', 'hidden');
	section_div.children('div.section-title').nextAll().css('display', 'none');

	section_top_operations_list.children('li.btn-show-section').css('display', 'inline');
	section_top_operations_list.children('li.btn-hide-section').css('display', 'none');
}

function questionnaire_show_all_sections() {
	$("#frm-questionnaire > div.section").each(function(index, section) {
		questionnaire_show_section(section);
	});

	$('#btn-questionnaire-hide-all-sections').css('display', 'inline');
	$('#btn-questionnaire-show-all-sections').css('display', 'none');
}

function questionnaire_show_section(element) {
	var section_div = $(element).closest('div.section');
	var section_top_operations_list = section_div.children('ul.section-top-operations-list');

	section_div.css('overflow', 'visible');
	section_div.children('div.section-title').nextAll().css('display', 'initial');

	section_top_operations_list.children('li.btn-show-section').css('display', 'none');
	section_top_operations_list.children('li.btn-hide-section').css('display', 'inline');
}

function destroyAllQuestionValidationErrors() {
	var mandatory_checkboxes = $("#questionnaire > .question > .panel-footer > .checkbox-inline > .lbl-mandatory-question > input[type='checkbox']:checked");

	$(mandatory_checkboxes).each(function(index, element) {
		$(element).closest('div.question').children('.panel-heading').children('.panel-title').popover('destroy');
	});
}

function hideQuestionValidationError(question_div) {
	var alert_div = question_div.children('.panel-body').children('.alert');
	$(alert_div).css('display', 'none');
}

function dismissValidationError(event) {
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
		hideQuestionValidationError(question_div);
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
		hideQuestionValidationError(question_div);
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
		hideQuestionValidationError(question_div);
		return true;
	} else {
		questionnaire_display_question_validation_error(question_div);
		return false;
	}
}

function questionnaire_validate_short_answer_question(question_div) {
	var short_answer_div = $(question_div).find('input.question-short-answer-text');

	if (short_answer_div.val() != '') {
		hideQuestionValidationError(question_div);
		return true;
	} else {
		questionnaire_display_question_validation_error(question_div);
		return false;
	}
}

function questionnaire_validate_paragraph_question(question_div) {
	var paragraph_div = $(question_div).find('div.question-type-paragraph').children('textarea');

	if (paragraph_div.val() != '') {
		hideQuestionValidationError(question_div);
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

function questionnaire_validate_questionnaire() {
	$('head > title').text('NOT validated');

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

function questionnaire_submit()
{
	questionnaire_validate_questionnaire();

	var questionnaire_data = new Array();

	$(".question").each(function(index, question) {
		if ($(question).css('display') != 'none') {
			var question_type = questionnaire_get_question_type(question);
			var question_obj = {type: question_type};

			if (question_type == 'short-answer') {
				question_obj.data = $(question).find("input[class*='short-answer-text']").val();
			} else if (question_type == 'paragraph') {
				question_obj.data = $(question).find("div[class*='textarea']").text();
			} else if (question_type == 'checkboxes') {
				question_obj.data = new Array();

				$(question).children("div[class*='question-type-multiple-choice']").children("div[class*='alternative']").each(function(alternative_index, alternative_element) {
					var checked = $(alternative_element).children("input[type='checkbox']").prop('checked');
					question_obj.data.push(checked == true ? true : false);
				});
			} else if (question_type == 'multiple-choice') {
				question_obj.data = new Array();

				$(question).children("div[class*='question-type-multiple-choice']").children("div[class*='alternative']").each(function(alternative_index, alternative_element) {
					var checked = $(alternative_element).children("input[type='radio']").prop('checked');
					question_obj.data.push(checked == true ? true : false);
				});
			} else if (question_type == 'ranked-choice') {
				question_obj.data = new Array();

				$(question).children("div[class*='question-type-ranked-choice']").children("ul[class*='ranked-choice-list']").children('li:not(:first-child)').each(function(choice_index, choice_element) {
					var choice_position = $(choice_element).attr('data-position');
					question_obj.data.push(choice_position);
				});
			}

			questionnaire_data.push(question_obj);
		}
	});
}

function questionnaire_add_question_answer_alternative(question_div) {
	var question_type_div = $(question_div).children('.panel-body').children('div[class*="question-type"]');
	var current_question_type = questionnaire_get_question_type(question_div);
	var question_answer_alternatives_list = $(question_type_div).children('ul.question-answer-alternatives');
	var to_be_cloned_question_answer_alternative = question_answer_alternatives_list.children('li:first-child');
	var cloned_question_answer_alternative = to_be_cloned_question_answer_alternative.clone(true, true);
	var question_number = $(question_div).index();
	var alternative_number = $(question_answer_alternatives_list).children('li').length;

	if (current_question_type == 'single-choice-radio-buttons' || current_question_type == 'multiple-choice-checkboxes') {
		$(cloned_question_answer_alternative).children('input').attr({
			'name': 'q' + question_number + (current_question_type == 'multiple-choice-checkboxes' ? '_a' + alternative_number : ''),
			'id': 'q' + question_number + '_a' + alternative_number
		});
	}

	$(question_answer_alternatives_list).children('li:last-child').before(cloned_question_answer_alternative);

	var text_node = $(cloned_question_answer_alternative).children('.lbl-answer-alternative-text')[0];

	selectTextContent(text_node);

	document.activeElement.blur();
	$(question_answer_alternatives_list).children('li:first-child').children('label').focus();

	return cloned_question_answer_alternative;
}

function selectTextContent(cell) {
	var range, selection;

	if (document.body.createTextRange) {
		range = document.body.createTextRange();
		range.moveToElementText(cell);
		range.select();
	} else if (window.getSelection) {
		selection = window.getSelection();
		//selection.removeAllRanges();

		range = document.createRange();
		range.selectNodeContents(cell);
		selection.addRange(range);
	}
}

function removeQuestionAnswerAlternative() {
	var question_div  = $(this).closest('div.question');
	var question_type = questionnaire_get_question_type(question_div);
	var parent_list_item = $(this).parent('li');

	$(parent_list_item).nextAll('li').each(function(index, element) {
		$(this).css('z-index', '+=1');
		$(this).children('input').attr('id', 'q' + $(question_div).index() + '_a' + (index+1));

		if (question_type == 'multiple-choice') {
			$(this).children('input').attr('name', 'q' + $(question_div).index() + '_a' + (index+1));
		}
	});

	$(parent_list_item).addClass('anim-remove-question-alternative').css({'margin-top': '-=' + parent_list_item.outerHeight() + 'px', 'opacity': '0'});

	setTimeout(function() {
		$(parent_list_item).remove();
	}, 700);
}

function switchFocusedPanel(event) {
	if (questionnaire_is_previewing() == false) {
		var to_be_focused_form = $(event.target).closest('div.section');
		var currently_focused_form = $('.focused');

		currently_focused_form.removeClass('focused');
		to_be_focused_form.addClass('focused');
	}
}

function questionnaire_get_question_type(question_div) {
	if (question_div != null) {
		return $(question_div).attr('data-current-question-type');
	} else {
		return false;
	}
}

function questionnaire_set_question_type(question_div, question_type) {
	if (question_div != null) {
		return $(question_div).attr('data-current-question-type', question_type);
	} else {
		return false;
	}
}

function questionnaire_update_question_type_menu(question_div, new_question_type) {
	if (question_div == null) {
		return false;
	} else {
		// Update the change-question-type menu to reflect the change
		var question_type_menu = $(question_div).find('ul.mnu-question-type');

		$(question_type_menu).children('li.active').removeClass('active');
		$(question_type_menu).children('li[data-question-type*="' + new_question_type + '"]').addClass('active');

		return true;
	}
}

function questionnaire_is_question_type_valid(question_type) {
	if (question_type == null) {
		return false;
	} else if (question_type == 'short-answer' || question_type == 'paragraph'
				|| question_type == 'single-choice-radio-buttons' || question_type == 'single-choice-list'
				|| question_type == 'multiple-choice-checkboxes' || question_type == 'multiple-choice-list'
				|| question_type == 'ranked-choice') {
		return true;
	} else {
		return false;
	}
}

function changeSingleMultipleChoiceQuestionType(question_div, new_question_type, current_question_type, question_number) {

	if (current_question_type == 'single-choice-list' && new_question_type == 'multiple-choice-list') {
		// Single-choice-list to multiple-choice-list
		var single_select_list = $(question_div).find('div.select-single');

		single_select_list.removeClass('select-single').addClass('select-multi');
		single_select_list.children('div:first-child').children('.text').text('0 alternativ valda');

	} else if (current_question_type == 'multiple-choice-list' && new_question_type == 'single-choice-list') {
		// Multiple-choice-list to single-choice-list
		var multi_select_list = $(question_div).find('div.select-multi');

		multi_select_list.removeClass('select-multi').addClass('select-single');
		multi_select_list.children('div:first-child').children('.text').text('Var god välj');

	} else if (current_question_type == 'single-choice-radio-buttons' && new_question_type == 'multiple-choice-checkboxes') {
		// Single-choice-radio-buttons to multiple-choice-checkboxes
		$(question_div).find('ul.question-answer-alternatives').children('li').each(function(index, element) {
			$(this).children('input').attr({'type': 'checkbox', 'name': 'q' + question_number + '_a' + (index+1)});
		});

	} else if (current_question_type == 'multiple-choice-checkboxes' && new_question_type == 'single-choice-radio-buttons') {
		// Multiple-choice-checkboxes to single-choice-radio-buttons
		$(question_div).find('ul.question-answer-alternatives').children('li').each(function(index, element) {
			$(this).children('input').attr({'type': 'radio', 'name': 'q' + question_number});
		});
	}

	questionnaire_update_question_type_menu(question_div, new_question_type);
	questionnaire_set_question_type(question_div, new_question_type);
}

function questionnaire_change_question_typeBetweenSingleChoiceAndMultipleChoice(from_type, to_type, question_number, question_div) {
	if (from_type == 'single-choice-radio-buttons' && to_type == 'multiple-choice-checkboxes') {
		question_div.find('ul.question-answer-alternatives').children('li').each(function(index, radio_button) {
			$(radio_button).children('input').attr({'type': 'checkbox', 'name': 'q' + question_number + '_a' + (index+1)});
		});

		question_div.children('.panel-body').children('.question-type-single-choice-radio-buttons')
					.removeClass('question-type-single-choice-radio-buttons')
					.addClass('question-type-multiple-choice-checkboxes');

	} else if (from_type == 'multiple-choice-checkboxes' && to_type == 'single-choice-radio-buttons') {
		question_div.find('ul.question-answer-alternatives').children('li').each(function(index, checkbox) {
			$(checkbox).children('input').attr({'type': 'radio', 'name': 'q' + question_number});
		});

		question_div.children('.panel-body').children('.question-type-multiple-choice-checkboxes')
					.removeClass('question-type-multiple-choice-checkboxes')
					.addClass('question-type-single-choice-radio-buttons');

	} else if (from_type == 'single-choice-list' && to_type == 'multiple-choice-list') {
		question_div.children('.panel-body').children('.question-type-single-choice-list')
					.removeClass('question-type-single-choice-list')
					.addClass('question-type-multiple-choice-list')
					.find('.select-single')
					.removeClass('select-single')
					.addClass('select-multi')
					.children('div:first-child').children('.text').text('0 alternativ valda');

	} else if (from_type == 'multiple-choice-list' && to_type == 'single-choice-list') {
		question_div.children('.panel-body').children('.question-type-multiple-choice-list')
					.removeClass('question-type-multiple-choice-list')
					.addClass('question-type-single-choice-list')
					.find('.select-multi')
					.removeClass('select-multi')
					.addClass('select-single')
					.children('div:first-child').children('.text').text('Var god välj');
	}
}

function questionnaire_change_question_type(question_div, new_question_type) {
	var question_number = $(question_div).index();
	var current_question_type = questionnaire_get_question_type(question_div);

	if (!questionnaire_is_question_type_valid(new_question_type) || current_question_type == new_question_type) {
		// No changes needed
		return false;
	} else {
		var new_question_type_form_selector = 'body > .question-type-' + new_question_type;
		var cloned_question_type_div = $(new_question_type_form_selector).clone(true, true);
		var to_be_replaced_question_type_div = $(question_div).children('.panel-body').children('div[class*="question-type"]');

		$(cloned_question_type_div).css('display', 'block');

		if (current_question_type == 'single-choice-radio-buttons' && new_question_type == 'multiple-choice-checkboxes') {
			questionnaire_change_question_typeBetweenSingleChoiceAndMultipleChoice('single-choice-radio-buttons',
																'multiple-choice-checkboxes',
																question_number,
																question_div);

		} else if (current_question_type == 'multiple-choice-checkboxes' && new_question_type == 'single-choice-radio-buttons') {
			questionnaire_change_question_typeBetweenSingleChoiceAndMultipleChoice('multiple-choice-checkboxes',
																'single-choice-radio-buttons',
																question_number,
																question_div);

		} else if (current_question_type == 'single-choice-list' && new_question_type == 'multiple-choice-list') {
			questionnaire_change_question_typeBetweenSingleChoiceAndMultipleChoice('single-choice-list',
																'multiple-choice-list',
																question_number,
																question_div);

		} else if (current_question_type == 'multiple-choice-list' && new_question_type == 'single-choice-list') {
			questionnaire_change_question_typeBetweenSingleChoiceAndMultipleChoice('multiple-choice-list',
																'single-choice-list',
																question_number,
																question_div);

		} else {
			// Just Replace the old question-type-div with the new one
			to_be_replaced_question_type_div.replaceWith(cloned_question_type_div);

			if (new_question_type == 'single-choice-radio-buttons') {
				$(cloned_question_type_div).find('ul.question-answer-alternatives').children('li:first-child').children('input').attr({'name': 'q' + question_number, 'id': 'q' + question_number + '_a1'});
			} else if (new_question_type == 'multiple-choice-checkboxes') {
				$(cloned_question_type_div).find('ul.question-answer-alternatives').children('li:first-child').children('input').attr({'name': 'q' + question_number + '_a1', 'id': 'q' + question_number + '_a1'});
			}
		}

		questionnaire_update_question_type_menu(question_div, new_question_type);
		questionnaire_set_question_type(question_div, new_question_type);

		if (new_question_type == 'ranked-choice') {

			var choice_list = cloned_question_type_div.find('ul.ranked-choice-list');
			var ranked_choice = choice_list.children('li:not(:first-child)');

			ranked_choice.children('span[data-toggle="tooltip"]').tooltip();
			/*

			var slider_drag_handle = ranked_choice.children('.ranked-choice-slider-drag-handle');
			var ranked_choice_polygon = ranked_choice.children('.ranked-choice-polygon');

			slider_drag_handle.css('margin-bottom', '-' + (choice_list.outerHeight() - ranked_choice.outerHeight()) + 'px');
			ranked_choice_polygon.css('height', choice_list.outerHeight() + 'px');
			*/
		}

		return true;
	}
}

function questionnaire_remove_section(section) {
	if (section != null) {

		section.addClass('animate-remove').css({
			'z-index': '1',
			'top': '-=' + $(section).outerHeight(true) + 'px',
			'margin-bottom': '-' + $(section).outerHeight() + 'px'});

		setTimeout(function() {
			$(section).remove();
		}, 700);

		$(section).prevAll('.panel').css('z-index', '-=1');

		$(section).nextAll('.panel').each(function(section_index, section) {
			if (questionnaire_get_question_type(this) == 'single-choice') {
				$(this).children('.panel-body').find('ul.question-answer-alternatives').children('li').each(function(list_item_index, list_item) {
					$(this).children('input').attr({'name': 'q' + (parseInt($(section).css('z-index'))+1), 'id': 'q' + (parseInt($(section).css('z-index'))+1) + '_a' + (list_item_index+1)});
				});
			} else if (questionnaire_get_question_type(this) == 'multiple-choice') {
				$(this).children('.panel-body').find('ul.question-answer-alternatives').children('li').each(function(list_item_index, list_item) {
					$(this).children('input').attr({'name': 'q' + (parseInt($(section).css('z-index'))+1) + '_a' + (list_item_index+1), 'id': 'q' + (parseInt($(section).css('z-index'))+1) + '_a' + (list_item_index+1)});
				});
			}
		});

		return true;
	} else {
		return false;
	}
}

function questionnaire_duplicate_section(section) {
	var section_height = $(section).outerHeight(true);
	var question_type = questionnaire_get_question_type(section);
	var section_z_index = parseInt($(section).css('z-index'));
	var section_position = questionnaire_get_section_position(section);
	var duplicated_section = $(section).clone(true, true);

	$(section).prevAll('.panel').css('z-index', '+=1');
	$(duplicated_section).css('z-index', '-=1');

	$(duplicated_section).css({
		//'top': -section_height + 'px',
		//'margin-bottom': -$(section).outerHeight() + 'px'
	});

	for (i = questionnaire_get_number_of_sections(); i > section_position; i--) {
		var apa = questionnaire_get_section(i);

		questionnaire_set_section_position(apa, questionnaire_get_section_position(apa)+1);

		if (apa.index() < section.index()) {
			apa.css('top', '+=' + section_height + 'px');
		}
	}

	questionnaire_set_section_position(duplicated_section, section_position+1);

	/*
	$(section).nextAll('.panel').each(function(index, element) {
		console.log(index);
		//$(element).css('top', '+=' + $(section).outerHeight() + 'px');

		var current_question_type = questionnaire_get_question_type(element);

		if (current_question_type == 'single-choice' || current_question_type == 'multiple-choice') {
			modifyAnswerAlternativesList(current_question_type,
					$(element).find('ul.question-answer-alternatives'),
					($(element).index()+1));
		}
	});
	*/

	$(section).after(duplicated_section);
	modifyAnswerAlternativesList(question_type, $(duplicated_section).find('ul.question-answer-alternatives'), section_z_index+2);

	$(duplicated_section).addClass('animate-duplicate');

	$(duplicated_section).css({
		//'top': '+=' + section_height + 'px',
		//'margin-bottom': '+=' + $(section).outerHeight(true) + 'px'
	});

	setTimeout(function() {
		$(duplicated_section).removeClass('animate-duplicate');
	}, 700);

	return duplicated_section;
}

function modifyAnswerAlternativesList(current_question_type, question_answer_alternatives_list, new_question_number) {
	$(question_answer_alternatives_list).children('li').each(function() {
		var new_id = 'q' + new_question_number + '_a' + ($(this).index() + 1);

		$(this).children('input').attr('id', new_id);

		if (current_question_type == 'single-choice-radio-buttons') {
			$(this).children('input').attr('name', 'q' + new_question_number);
		} else if (current_question_type == 'multiple-choice-checkboxes') {
			$(this).children('input').attr('name', new_id);
		}
	});
}

function questionnaire_get_number_of_sections() {
	return $('#questionnaire > .panel').length;
}

function questionnaire_get_section(section_number) {
	return $('#questionnaire > .panel[data-position="' + section_number + '"]');
}

function questionnaire_get_section_position(section) {
	return parseInt(section.attr('data-position'));
}

function questionnaire_set_section_position(section, new_position) {
	section.attr('data-position', new_position);
}

function questionnaire_move_section(section, direction) {
	var section_position = questionnaire_get_section_position(section);
	var total_number_of_sections = questionnaire_get_number_of_sections();
	var sibling_section = null;

	if (direction == 'up' && section_position > 1) {
		sibling_section = questionnaire_get_section(section_position - 1);
		section.css({'top': '-=' + sibling_section.outerHeight(true) + 'px', 'z-index': '+=1'});
		sibling_section.css({'top': '+=' + section.outerHeight(true) + 'px', 'z-index': '-=1'});
		questionnaire_set_section_position(section, section_position-1);
		questionnaire_set_section_position(sibling_section, section_position);

	} else if (direction == 'down' && section_position < total_number_of_sections) {
		sibling_section = questionnaire_get_section(section_position + 1);
		section.css({'top': '+=' + sibling_section.outerHeight(true) + 'px', 'z-index': '-=1'});
		sibling_section.css({'top': '-=' + section.outerHeight(true) + 'px', 'z-index': '+=1'});
		questionnaire_set_section_position(section, section_position+1);
		questionnaire_set_section_position(sibling_section, section_position);
	}
}

function questionnaire_add_heading_and_description() {
	var heading_and_description_div = $("body > .heading-and-description");
	var cloned_heading_and_description_div = $(heading_and_description_div).clone(true, true);
	var panel_number = $('#questionnaire > .panel').length+1;
	var last_panel = $('#questionnaire > .panel').last();

	$(cloned_heading_and_description_div).css({'display': 'block', 'z-index': '1'})
			.attr('data-position', questionnaire_get_number_of_sections() + 1);

	$('#questionnaire > .panel').css('z-index', '+=1');
	$('#questionnaire > footer').before(cloned_heading_and_description_div);

	initSectionFooterTooltips(cloned_heading_and_description_div);

	switchFocusedPanel(cloned_heading_and_description_div);

	return cloned_heading_and_description_div;
}

function initSectionFooterTooltips(section_div) {
	// Section divs initially hidden => tooltip initialization doesn't work initially
	// Initialize tooltips after section is made visible instead

	var buttons = $(section_div).children('.panel-footer').children('.btn-group').children('button[type="button"]');
	var mandatory_question_checkbox = $(section_div).children('.panel-footer').children('.checkbox-inline').children('.lbl-mandatory-question');

	buttons.attr({'data-toggle': 'tooltip', 'data-placement': 'top', 'data-container': 'body'});
	buttons.tooltip();

	if (mandatory_question_checkbox.length != 0) {
		mandatory_question_checkbox.attr({'data-toggle': 'tooltip', 'data-placement': 'top', 'data-container': 'body'});
		mandatory_question_checkbox.tooltip();
	}
}

function questionnaire_add_question(question_type) {
	if (!questionnaire_is_question_type_valid(question_type)) {
		return false;
	} else {
		var question_div = $('body > .question');
		var cloned_question_div = $(question_div).clone(true, true);
		var panel_number = $('#questionnaire > .panel').length+1;

		$(cloned_question_div).css({'display': 'block', 'z-index': '1'})
			.attr('data-position', questionnaire_get_number_of_sections() + 1);

		questionnaire_change_question_type(cloned_question_div, question_type);
		initSectionFooterTooltips(cloned_question_div);

		$('#questionnaire > .panel').css('z-index', '+=1');
		$('#questionnaire > footer').before(cloned_question_div);

		return cloned_question_div;
	}
}

function questionnaire_preview() {
	$('#questionnaire').toggleClass('is-previewing');

	if ($('#questionnaire').hasClass('is-previewing')) {
		// Preview mode ON
		$('.btn-grp-questionnaire-operations > button[class*="btn-preview-questionnaire"]').addClass('active').attr('data-original-title', 'Sluta förhandsgranska formulär').tooltip('show');
		$('.btn-grp-questionnaire-operations > button[class*="btn-preview-questionnaire"] > span[class*="glyphicon-eye-open"]').removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
		$('.btn-grp-questionnaire-operations > button:not([class*="btn-preview-questionnaire"])').addClass('disabled').prop('disabled', true);
		$('#questionnaire > header > h1').attr('contenteditable', 'false');
		$('#questionnaire > header > p.lead').attr('contenteditable', 'false');
		$('#questionnaire > footer').css('display', 'block');
		$('#questionnaire > .panel > .panel-heading > .btn-group').hide();
		$('#questionnaire > .panel > .panel-heading > .panel-title').attr('contenteditable', 'false');
		$("#questionnaire > .panel > .panel-body > p[contenteditable='true']").attr('contenteditable', 'false');
		$('#questionnaire > .panel > .panel-body > div[class*="question-type"] > p.question-description').attr('contenteditable', 'false');
		$('#questionnaire > .panel > .panel-body .btn-add-answer-alternative').css('display', 'none');
		$('#questionnaire > .panel > .panel-body .btn-remove-answer-alternative').css('display', 'none');
		$('#questionnaire > .panel > .panel-body .lbl-answer-alternative-text').attr('contenteditable', 'false');
		$('#questionnaire > .panel > .panel-footer').css('display', 'none');
		$('#questionnaire .question[data-current-question-type="short-answer"] > .panel-body > .question-type-short-answer > input[type="text"]').val('');
		$('#questionnaire .question[data-current-question-type="paragraph"] > .panel-body > .question-type-paragraph > textarea').val('');
		$('#questionnaire .question[data-current-question-type="ranked-choice"] > .panel-body > .question-type-ranked-choice > .ranked-choice-scale-list > li > span').attr('contenteditable', 'false');
		$('#questionnaire .question[data-current-question-type="ranked-choice"] > .panel-body > .question-type-ranked-choice > .ranked-choice-list > li > span.ranked-choice-text').attr('contenteditable', 'false');
		$('#questionnaire .question[data-current-question-type="ranked-choice"] > .panel-body > .question-type-ranked-choice > .lbl-ranked-choice-type').css('display', 'none');
		$('#questionnaire .question[data-current-question-type="ranked-choice"] > .panel-body > .question-type-ranked-choice > .btn-add-ranked-choice').css('display', 'none');
		$('#questionnaire .question[data-current-question-type="ranked-choice"] > .panel-body > .question-type-ranked-choice > .ranked-choice-order-description').css('display', 'block');
		$('#questionnaire .question[data-current-question-type*="single-choice-radio-buttons"] .question-answer-alternatives > li:last-child').css('display', 'none');
		$('#questionnaire .question[data-current-question-type*="multiple-choice-checkboxes"] .question-answer-alternatives > li:last-child').css('display', 'none');

		$('#questionnaire .select-list').each(function(index, list) {
			select_list_toggle_editable_mode($(list));
		});

		$('#questionnaire > .question[data-current-question-type="single-choice-radio-buttons"]').each(function(question_index, question) {
			$(question).find('ul.question-answer-alternatives').children('li:not(:last-child)').each(function(answer_index, list_item) {
				var alternative_index = $(list_item).index() + 1;
				$(list_item).children('input').prop('disabled', false);
				$(list_item).children('label').attr('for', 'q' + $(question).index() + '_a' + alternative_index);
			});
		});

		$('#questionnaire > .question[data-current-question-type="multiple-choice-checkboxes"]').each(function(question_index, question) {
			$(question).find('ul.question-answer-alternatives').children('li:not(:last-child)').each(function(answer_index, list_item) {
				var alternative_index = $(list_item).index() + 1;
				$(list_item).children('input').prop('disabled', false);
				$(list_item).children('label').attr('for', 'q' + $(question).index() + '_a' + alternative_index);
			});
		});

		$('img').attr('contenteditable', 'false');

		document.getSelection().removeAllRanges();

	} else {
		// Preview mode OFF
		$('.btn-grp-questionnaire-operations > button[class*="btn-preview-questionnaire"]').removeClass('active').attr('data-original-title', 'Förhandsgrandska formulär').tooltip('show');
		$('.btn-grp-questionnaire-operations > button[class*="btn-preview-questionnaire"] > span[class*="glyphicon-eye-close"]').removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
		$('.btn-grp-questionnaire-operations > button:not([class*="btn-preview-questionnaire"])').removeClass('disabled').prop('disabled', false);
		$('#questionnaire > header > h1').attr('contenteditable', 'true');
		$('#questionnaire > header > p.lead').attr('contenteditable', 'true');
		$('#questionnaire > footer').css('display', 'none');
		$('#questionnaire > .panel > .panel-heading > .btn-group').show();
		$('#questionnaire > .panel > .panel-heading > .panel-title').attr('contenteditable', 'true');
		$("#questionnaire > .panel > .panel-body > p[contenteditable='false']").attr('contenteditable', 'true');
		$('#questionnaire > .panel > .panel-body > div[class*="question-type"] > p.question-description').attr('contenteditable', 'true');
		$('#questionnaire > .panel > .panel-body > .alert').css('display', 'none');
		$('#questionnaire > .panel > .panel-body .btn-add-answer-alternative').css('display', 'inline');
		$('#questionnaire > .panel > .panel-body .btn-remove-answer-alternative').css('display', 'inline');
		$('#questionnaire > .panel > .panel-body .lbl-answer-alternative-text').attr('contenteditable', 'true');
		$('#questionnaire > .panel > .panel-footer').css('display', 'block');
		$('#questionnaire .question[data-current-question-type="short-answer"] > .panel-body > .question-type-short-answer > input[type="text"]').val('');
		$('#questionnaire .question[data-current-question-type="paragraph"] > .panel-body > .question-type-paragraph > textarea').val('');
		$('#questionnaire .question[data-current-question-type="ranked-choice"] > .panel-body > .question-type-ranked-choice > .ranked-choice-scale-list > li > span').attr('contenteditable', 'true');
		$('#questionnaire .question[data-current-question-type="ranked-choice"] > .panel-body > .question-type-ranked-choice > .ranked-choice-list > li > span.ranked-choice-text').attr('contenteditable', 'true');
		$('#questionnaire .question[data-current-question-type="ranked-choice"] > .panel-body > .question-type-ranked-choice > .lbl-ranked-choice-type').css('display', 'inline');
		$('#questionnaire .question[data-current-question-type="ranked-choice"] > .panel-body > .question-type-ranked-choice > .btn-add-ranked-choice').css('display', 'inline');
		$('#questionnaire .question[data-current-question-type="ranked-choice"] > .panel-body > .question-type-ranked-choice > .ranked-choice-order-description').css('display', 'none');
		$('#questionnaire .question[data-current-question-type="single-choice-radio-buttons"] .question-answer-alternatives > li:last-child').css('display', 'block');
		$('#questionnaire .question[data-current-question-type="multiple-choice-checkboxes"] .question-answer-alternatives > li:last-child').css('display', 'block');

		$('#questionnaire .select-list').each(function(index, list) {
			select_list_toggle_editable_mode($(list));
		});

		$('#questionnaire > .question[data-current-question-type="single-choice-radio-buttons"]').each(function(question_index, question) {
			$(question).find('ul.question-answer-alternatives').children('li:not(:last-child)').each(function(answer_index, list_item) {
				$(list_item).children('input').prop('disabled', true);

				var selected_items = $(list_item).children('input:checked');

				if (selected_items.length != 0) {
					selected_items.prop('checked', false);
				}

				$(list_item).children('label').removeAttr('for');
			});
		});

		$('#questionnaire > .question[data-current-question-type="multiple-choice-checkboxes"]').each(function(question_index, question) {
			$(question).find('ul.question-answer-alternatives').children('li:not(:last-child)').each(function(answer_index, list_item) {
				$(list_item).children('input').prop('disabled', true);

				var selected_items = $(list_item).children('input:checked');

				if (selected_items.length != 0) {
					selected_items.prop('checked', false);
				}

				$(list_item).children('label').removeAttr('for');
			});
		});

		destroyAllQuestionValidationErrors();
	}
}

function questionnaire_clear() {
	// Clear the questionnaire
	$('#questionnaire > .panel').remove();
	$('#questionnaire > header > h1').text('Namnlöst formulär');
	$('#questionnaire > header > p').text('Beskrivning av formulär');
}

function confirmClearQuestionnaire() {
	$('#modal-clear-questionnaire').modal();
}

function questionnaire_save() {
	var session_save_counter = $('#questionnaire').attr('data-session-save-counter');

	if (session_save_counter == null) {
		session_save_counter = 1;
	} else {
		session_load_counter++;
	}

	$("#questionnaire input[type='text']").each(function(index, element) {
		$(element).attr('value', $(element).val());
	});

	var questionnaire_raw_html = $('#questionnaire').html();
	var obj = {userId: 3, data: questionnaire_raw_html};

	Shiny.onInputChange("save_questionnaire", obj);
	$('#questionnnaire').attr('data-session-save-counter', session_save_counter);
}

function questionnaire_saveHandler(response) {
	alert("Formulär sparat!");
}

function questionnaire_load() {
	var session_load_counter = $('#frm-questionnaire').attr('data-session-load-counter');

	if (session_load_counter == null) {
		session_load_counter = 1;
	} else {
		session_load_counter++;
	}

	var questionnaire_raw_html = $('#questionnaire').html();
	var obj = {userId: 3, data: questionnaire_raw_html};

	Shiny.onInputChange("load_questionnaire", obj);
	$('#questionnaire').attr('data-session-load-counter', session_load_counter);
}

function questionnaire_loadHandler(response) {
	$('#questionnaire').html(response);
	alert("Formulär laddat!");
}

function setRankedChoiceDefaultScaleText(ranked_choice_type, ranked_choice_scale_list) {
	if (ranked_choice_type == 'A') {
		ranked_choice_scale_list.children('li:nth-child(1)').children('span').text('Dåligt');
		ranked_choice_scale_list.children('li:nth-child(2)').children('span').text('Varken eller');
		ranked_choice_scale_list.children('li:nth-child(3)').children('span').text('Bra');

	} else if (ranked_choice_type == 'B') {
		ranked_choice_scale_list.children('li:nth-child(1)').children('span').text('Alternativ A');
		ranked_choice_scale_list.children('li:nth-child(2)').children('span').text('Lika viktiga');
		ranked_choice_scale_list.children('li:nth-child(3)').children('span').text('Alternativ B');

	} else if (ranked_choice_type == 'C') {
		ranked_choice_scale_list.children('li:nth-child(1)').children('span').text('');
		ranked_choice_scale_list.children('li:nth-child(2)').children('span').text('');
		ranked_choice_scale_list.children('li:nth-child(3)').children('span').text('');
	}
}

function changeRankedChoiceType(element) {
	var ranked_choice_alternatives_list = $(element).closest('div.question-type-ranked-choice').children(RANKED_CHOICE_ALTERNATIVES_LIST);
	var ranked_choice_scale_list = ranked_choice_alternatives_list.siblings('ul.ranked-choice-scale-list');
	var ranked_choice_slider_bar = ranked_choice_alternatives_list.siblings(RANKED_CHOICE_SLIDER_BAR);
	var ranked_choice_order_description = ranked_choice_alternatives_list.siblings(RANKED_CHOICE_ORDER_DESCRIPTION);
	var ranked_choice_add_alternative_button = ranked_choice_alternatives_list.siblings('button.btn-add-alternative');
	var ranked_choice_new_choice_type = $(element).val();
	var horizontal_arrow_item = ranked_choice_alternatives_list.children('li:first-child');
	var horizontal_arrow_item_slider_drag_handle = horizontal_arrow_item.find(RANKED_CHOICE_SLIDER_DRAG_HANDLE);
	var horizontal_arrow_item_polygon = horizontal_arrow_item.find('svg.ranked-choice-polygon');
	var horizontal_arrow_item_text = $(horizontal_arrow_item).find('span.ranked-choice-text');

	setRankedChoiceDefaultScaleText(ranked_choice_new_choice_type, ranked_choice_scale_list);
	setRankedChoiceDefaultOrderDescription(ranked_choice_new_choice_type, ranked_choice_order_description, ranked_choice_alternatives_list);

	$(ranked_choice_slider_bar).css({'padding-left': '', 'padding-right': ''});

	if (ranked_choice_new_choice_type == 'A') {
		ranked_choice_slider_bar.attr({ATTR_RANKED_CHOICE_SLIDER_STEPS: '15', ATTR_RANKED_CHOICE_CHOICE_TYPE: 'A'});

		ranked_choice_alternatives_list.children('li:not(:first-child)').css({'display': 'block', 'left': '0'}).attr(ATTR_RANKED_CHOICE_ALTERNATIVE_POSITION, 0);

		ranked_choice_add_alternative_button.prop('disabled', false);
		$(horizontal_arrow_item).css('display', 'none');

		$(ranked_choice_slider_bar).removeClass('ranked-choice-type-b ranked-choice-type-c').addClass('ranked-choice-type-a');

	} else if (ranked_choice_new_choice_type == 'B') {
		ranked_choice_slider_bar.attr({ATTR_RANKED_CHOICE_SLIDER_STEPS: '11', ATTR_RANKED_CHOICE_CHOICE_TYPE: 'B'});
		ranked_choice_alternatives_list.children('li:not(:first-child)').css('display', 'none');

		ranked_choice_add_alternative_button.prop('disabled', true);
		horizontal_arrow_item.css({'display': 'block', 'left': '0'}).attr(ATTR_RANKED_CHOICE_ALTERNATIVE_POSITION, 0);

		$(ranked_choice_slider_bar).removeClass('ranked-choice-type-a ranked-choice-type-c').addClass('ranked-choice-type-b');

	} else if (ranked_choice_new_choice_type == 'C') {
		ranked_choice_slider_bar.attr({ATTR_RANKED_CHOICE_SLIDER_STEPS: '15', ATTR_RANKED_CHOICE_CHOICE_TYPE: 'C'});
		ranked_choice_alternatives_list.children('li:not(:first-child)').css({'display': 'block', 'left': '-50%'}).attr(ATTR_RANKED_CHOICE_ALTERNATIVE_POSITION, -7);

		ranked_choice_add_alternative_button.prop('disabled', false);

		ranked_choice_alternatives_list.children('li').css('display', 'block');
		horizontal_arrow_item.css('display', 'none');

		$(ranked_choice_slider_bar).removeClass('ranked-choice-type-a ranked-choice-type-b').addClass('ranked-choice-type-c');
	}
}