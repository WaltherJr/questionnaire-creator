"use strict";

var questionnaire_data = (function() {
	var classnames = {
		'RANKED_CHOICE_SCALE_TEXT_LIST': 'ranked-choice-scale-text-list',
		'RANKED_CHOICE_TYPE_LIST': 'ranked-choice-choice-type-list',
		'RANKED_CHOICE_TYPE_A': 'ranked-choice-type-a',
		'RANKED_CHOICE_TYPE_B': 'ranked-choice-type-b',
		'RANKED_CHOICE_TYPE_C': 'ranked-choice-type-c',
		'RANKED_CHOICE_ADD_ALTERNATIVE_BUTTON': 'ranked-choice-add-alternative-button'
	};

	var attributes = {
	};

	var constants = {
		'DEFAULT_RANKED_CHOICE_TYPE': 'RANKED_CHOICE_TYPE_A',
		'RANKED_CHOICE_TYPE_A_DESCRIPTION_STRING': 'Typ A',
		'RANKED_CHOICE_TYPE_B_DESCRIPTION_STRING': 'Typ B',
		'RANKED_CHOICE_TYPE_C_DESCRIPTION_STRING': 'Typ C',
		'RANKED_CHOICE_TYPE_A_SLIDER_BAR_STEPS': 15,
		'RANKED_CHOICE_TYPE_B_SLIDER_BAR_STEPS': 15,
		'RANKED_CHOICE_TYPE_C_SLIDER_BAR_STEPS': 11,
		'RANKED_CHOICE_TYPE_A_SLIDER_BAR_CALLBACK': 'ranked-choice-type-a-slider-bar-callback',
		'RANKED_CHOICE_TYPE_B_SLIDER_BAR_CALLBACK': 'ranked-choice-type-b-slider-bar-callback',
		'RANKED_CHOICE_TYPE_C_SLIDER_BAR_CALLBACK': 'ranked-choice-type-c-slider-bar-callback',
		'RANKED_CHOICE_TYPE_A_SCALE_TEXT': ['Dåligt', 'Varken eller', 'Bra'],
		'RANKED_CHOICE_TYPE_C_SCALE_TEXT': ['Alternativ A', 'Lika viktiga', 'Alternativ B']
	};

	return {
		classname: function(name) {
			return classnames[name];
		},

		attribute: function(name) {
			return attributes[name];
		},

		selector: function(name) {
			if (classnames[name] != null) {
				return '.' + classnames[name];
			} else if (attributes[name] != null) {
				return '.' + attributes[name];
			}
		},

		constant: function(name) {
			return constants[name];
		}
	};
})();

var questionnaire = {
	question_type: {
		attribute_name: 'data-current-question-type'
	},
	question_types: {
		short_answer: 'short-answer',
		paragraph: 'paragraph',
		single_choice_list: 'single-choice-list',
		single_choice_radio_buttons: 'single-choice-radio-buttons',
		multiple_choice_list: 'multiple-choice-list',
		multiple_choice_checkboxes: 'multiple-choice-checkboxes',
		ranked_choice: 'ranked-choice'
	},
	default_question_type: 'ranked-choice',
	default_section_sort_function: function(section_a, section_b) {
		return questionnaire_get_section_position(section_a) - questionnaire_get_section_position(section_b);
	},
	title: {
		default_text: 'Namnlöst formulär',
		selector: '.questionnaire-title'
	},
	description: {
		default_text: 'Beskrivning av formulär',
		selector: '.questionnaire-description'
	},
	section: {
		position: {
			attr_name: 'data-position'
		},
		selector: '.section'
	},
	question: {
		question_types_list: {
			selector: '.questionnaire-question-types-list'
		}
	},
	operations_toolbar: {
		selector: '.questionnaire-operations-toolbar'
	}
};

var ranked_choice_types = {
	type_a: {name: 'Typ A', classname: 'ranked-choice-type-a', slider_bar_steps: 15, scale_text: ['Dåligt', 'Varken eller', 'Bra']},
	type_b: {name: 'Typ B', classname: 'ranked-choice-type-b', slider_bar_steps: 15, scale_text: ['', '', '']},
	type_c: {name: 'Typ C', classname: 'ranked-choice-type-c', slider_bar_steps: 11, scale_text: ['Alternativ A', 'Lika viktiga', 'Alternativ B']}
};

function questionnaire_init_ranked_choice_types(ranked_choice) {
	var choice_type_a_callback = function(ranked_choice_slider_bar, ranked_choice_alternatives_list) {
		var ranges = {left: 8, right: 8};

		ranked_choice_alternatives_list.children('li').each(function(index, alternative) {
			var alternative_position = ranked_choice_get_alternative_position($(alternative));

			if (alternative_position < ranges.left) {
				ranges.left = alternative_position;
			}

			if (alternative_position > ranges.right) {
				ranges.right = alternative_position;
			}
		});

		$(ranked_choice_slider_bar).css({'padding-left':  Math.round((ranges.left-1)/14*100) + '%',
										 'padding-right': Math.round((15-ranges.right)/14*100) + '%'});
	};

	var choice_type_b_callback = function(ranked_choice_slider_bar, ranked_choice_alternatives_list) {
		var ranges = {left: 1, right: 1};

		ranked_choice_alternatives_list.children('li').each(function(index, alternative) {
			var alternative_position = ranked_choice_get_alternative_position($(alternative));

			if (alternative_position > ranges.right) {
				ranges.right = alternative_position;
			}
		});

		$(ranked_choice_slider_bar).css({'padding-left': '0%',
										 'padding-right': Math.round((15-ranges.right)/14*100) + '%'});
	};

	var choice_type_c_callback = function(ranked_choice_slider_bar, ranked_choice_alternatives_list) {
		var arrow_alternative_position = ranked_choice_get_alternative_position(ranked_choice_alternatives_list.children('li:first-child'));
		var padding_left = Math.min(5, arrow_alternative_position-1)*10;
		var padding_right = Math.min(5, 11-arrow_alternative_position)*10;

		$(ranked_choice_slider_bar).css({'padding-left':  padding_left + '%',
										 'padding-right': padding_right + '%'});
	}

	$(document).data(questionnaire_data.constant('RANKED_CHOICE_TYPE_A_SLIDER_BAR_CALLBACK'), choice_type_a_callback);
	$(document).data(questionnaire_data.constant('RANKED_CHOICE_TYPE_B_SLIDER_BAR_CALLBACK'), choice_type_b_callback);
	$(document).data(questionnaire_data.constant('RANKED_CHOICE_TYPE_C_SLIDER_BAR_CALLBACK'), choice_type_c_callback);

	var default_choice_type_callback = questionnaire_data.constant('DEFAULT_RANKED_CHOICE_TYPE') + '_SLIDER_BAR_CALLBACK';

	ranked_choice_set_slider_bar_update_function_callback(ranked_choice, $(document).data(questionnaire_data.constant(default_choice_type_callback)));
}

$(document).ready(function() {
	//Shiny.addCustomMessageHandler("questionnaire_saveHandler", questionnaire_saveHandler);
	//Shiny.addCustomMessageHandler("questionnaire_loadHandler", questionnaire_loadHandler);

	questionnaire_activate_main_toolbar_tooltips();

	$('.question, .heading-and-description').children('.panel-footer').prepend($('.section-footer-toolbar').css('display', 'inline-block'));

	$('.ranked-choice-type-select-list').append(
		'<option selected>' + questionnaire_data.constant('RANKED_CHOICE_TYPE_A_DESCRIPTION_STRING') + '</option>',
		'<option>' + questionnaire_data.constant('RANKED_CHOICE_TYPE_B_DESCRIPTION_STRING') + '</option>',
		'<option>' + questionnaire_data.constant('RANKED_CHOICE_TYPE_C_DESCRIPTION_STRING') + '</option>'
	);

	var ranked_choice = ranked_choice_create_new(ranked_choice_types.type_a.slider_bar_steps);
	ranked_choice.addClass(ranked_choice_types.type_a.classname)
	questionnaire_init_ranked_choice_types(ranked_choice);
	$('.ranked-choice-order-description').before(ranked_choice);

	ranked_choice_add_alternative(ranked_choice,
		Math.round(ranked_choice_types.type_a.slider_bar_steps / 2), {
		text: '&harr;',
		removable: false,
		editable: false,
		font: {
			size: 24,
			weight: 'bold'
		}
	}).css('display', 'none');

	$(questionnaire_data.selector('RANKED_CHOICE_ADD_ALTERNATIVE_BUTTON')).on('click', function() {
		ranked_choice_add_alternative($(this).closest('.question-type-ranked-choice').children(ranked_choice_data.selector('RANKED_CHOICE')));
	});

	$('.question-type-single-choice-list').append(select_list_create_new(true, false));
	$('.question-type-multiple-choice-list').append(select_list_create_new(true, true));

	$('.ranked-choice-type-select-list').change(function() {
		 questionnaire_change_ranked_choice_type($(this)
		 	.closest('.question-type-ranked-choice')
		 	.children(ranked_choice_data.selector('RANKED_CHOICE')), $(this).val());
	});

	$('#questionnaire-submit-questionnaire-button').on('click', function() {
		questionnaire_submit();
		$(this).blur();
	});

	$('.mnu-question-type a').click(function(event) {
		event.preventDefault();
	});

	$('.lbl-add-answer-alternative').on('click', function() {
		questionnaire_add_question_answer_alternative($(this).closest('.panel'));
	});

	questionnaire_install_main_toolbar_event_listeners();
	questionnaire_install_section_toolbar_event_listeners();

	$('.ranked-choice-alternatives-list').tooltip({'title': 'Ta bort alternativ', 'placement': 'right', 'container': 'body', 'selector': '.remove-ranked-choice'});

	$('.single-choice-remove-alternative-button').click(removeQuestionAnswerAlternative);

	$(questionnaire.question.question_types_list.selector).on('click', 'li', function() {
		questionnaire_change_question_type($(this).closest('.panel'), $(this).attr('data-question-type'));
	});

	$('.lbl-mandatory-question').on('click', function() {
		$(this).blur();
	});

	$('#modal-clear-questionnaire button[class*="btn-danger"]').click(questionnaire_clear);

	questionnaire_activate_section_toolbar_tooltips();

	$(document).click(function(event) {
		if ($(event.target).closest("div[class*='section']").length == 0) {
			$('.focused').removeClass('focused');
		}
	});
});

function questionnaire_install_section_toolbar_event_listeners() {
	$('#questionnaire').on('click', '.questionnaire-move-section-up-button', function() {
		$(this).tooltip('hide');
		$(this).blur();
		questionnaire_move_section_up($(this).closest('.panel'));
	});

	$('#questionnaire').on('click', '.questionnaire-move-section-down-button', function() {
		$(this).tooltip('hide');
		$(this).blur();
		questionnaire_move_section_down($(this).closest('.panel'));
	});

	$('#questionnaire').on('click', '.questionnaire-duplicate-section-button', function() {
		$(this).tooltip('hide');
		$(this).blur();
		questionnaire_duplicate_section($(this).closest('.panel'));
	});

	$('#questionnaire').on('click', '.questionnaire-remove-section-button', function() {
		$(this).tooltip('destroy');
		$(this).blur();
		questionnaire_remove_section($(this).closest('.panel'));
	});
}

function questionnaire_activate_main_toolbar_tooltips() {
	$(questionnaire.operations_toolbar.selector).children('button').tooltip({
		container: 'body',
		placement: 'right'
	});
}

function questionnaire_activate_section_toolbar_tooltips() {
	$('#questionnaire').tooltip({
		container: 'body',
		placement: 'top',
		selector: '.questionnaire-move-section-up-button, \
					.questionnaire-move-section-down-button, \
					.questionnaire-duplicate-section-button, \
					.questionnaire-remove-section-button, \
					.questionnaire-mandatory-question-label'
	});
}

function questionnaire_deactivate_section_toolbar_tooltips(sections) {
	sections.each(function(index, section) {
		$(section).find('.questionnaire-move-section-up-button').tooltip('destroy');
		$(section).find('.questionnaire-move-section-down-button').tooltip('destroy');
		$(section).find('.questionnaire-duplicate-section-button').tooltip('destroy');
		$(section).find('.questionnaire-remove-section-button').tooltip('destroy');
	});
}

function questionnaire_install_main_toolbar_event_listeners() {
	$('.questionnaire-add-question-button').on('click', function() {
		$(this).blur();
		questionnaire_add_question(questionnaire.default_question_type);
	});

	$('.questionnaire-add-heading-and-description-button').on('click', function() {
		$(this).blur();
		questionnaire_add_heading_and_description();
	});

	$('.questionnaire-add-image-button').on('click', function() {
		$(this).blur();

		var range = window.getSelection().getRangeAt(0);
		questionnaire_display_add_image_modal();

		$('#modal-add-image button[class*="btn-primary"]').on('click', function() {
			questionnaire_insert_image(range);
		});
	});

	$('.questionnaire-add-hyperlink-button').on('click', function() {
		$(this).blur();

		var range = window.getSelection().getRangeAt(0);
		questionnaire_display_add_hyperlink_modal();

		$('#modal-add-link button[class*="btn-primary"]').on('click', function() {
			questionnaire_insert_link(range);
		});
	});

	$('.questionnaire-add-email-link-button').on('click', function() {
		$(this).blur();

		var range = window.getSelection().getRangeAt(0);
		questionnaire_display_add_email_link_modal();

		$('#modal-add-link button[class*="btn-primary"]').on('click', function() {
			questionnaire_insert_link(range);
		});
	});

	$('.questionnaire-preview-questionnaire-button').on('click', function() {
		$(this).blur();
		questionnaire_preview();
	});

	$('.questionnaire-save-questionnaire-button').on('click', function() {
		$(this).blur();
	});

	$('.questionnaire-load-questionnaire-button').on('click', function() {
		$(this).blur();
		questionnaire_load();
	});

	$('.questionnaire-clear-questionnaire-button').on('click', function() {
		$(this).blur();
		confirmClearQuestionnaire();
	});
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

	$(new_image).on('click', function() {
		var selection = window.getSelection();

		if (selection.rangeCount > 0) {
			selection.removeAllRanges();
		}

		var image_range = document.createRange();

		image_range.selectNode($(this).get(0));
		selection.addRange(range);
	});
}

function questionnaire_display_add_hyperlink_modal() {
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

function questionnaire_display_add_email_link_modal() {
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

function questionnaire_display_add_image_modal() {
	$('#modal-add-image').modal();
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
	/*
	if (questionnaire_is_previewing() == false) {
		var to_be_focused_form = $(event.target).closest('div.section');
		var currently_focused_form = $('.focused');

		currently_focused_form.removeClass('focused');
		to_be_focused_form.addClass('focused');
	}
	*/
}

function questionnaire_get_question_type(question) {
	if (question == undefined) {
		false;
	} else {
		return $(question).attr(questionnaire.question_type.attribute_name);
	}
}

function questionnaire_get_question_type_div(question_type_or_div) {
	if (question_type_or_div == undefined) {
		return false;
	} else {
		if (typeof(question_type_or_div) === 'string') {
			return $(questionnaire.question_types.selector).children('.question-type-' + question_type_or_div);
		} else if (typeof(question_type_or_div) === 'object') {
			return $(question_type_or_div).find('div[class*="question-type"]');
		}
	}
}

function questionnaire_set_question_type(question, question_type) {
	if (question == undefined || question_type == undefined) {
		return false;
	} else {
		return $(question).attr(questionnaire.question_type.attribute_name, question_type);
	}
}

function questionnaire_update_question_type_menu(question, question_type) {
	if (question == undefined || question_type == undefined) {
		return false;
	} else {
		var question_types_list = $(question).find(questionnaire.question.question_types_list.selector);

		$(question_types_list).children('li.active').removeClass('active');
		$(question_types_list).children('li[data-question-type*="' + question_type + '"]').addClass('active');

		return true;
	}
}

function questionnaire_is_question_type_valid(question_type) {
	if (question_type == undefined) {
		return false;
	} else {
		for (var question_type_identifier in questionnaire.question_types) {
			if (question_type == questionnaire.question_types[question_type_identifier]) {
				return true;
			}
		}

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

function questionnaire_change_question_type(question, new_question_type) {
	//var question_number = $(question).index();
	var current_question_type = questionnaire_get_question_type(question);

	if (!questionnaire_is_question_type_valid(new_question_type) || current_question_type === new_question_type) {
		// No changes needed
		return false;
	} else {
		var new_question_type_div = $('#questionnaire-question-types > .question-type-' + new_question_type).clone(true, true);
		var old_question_type_div = $(question).children('.panel-body').children('div[class*="question-type"]');

		console.log(new_question_type_div);

		old_question_type_div.replaceWith(new_question_type_div);

		questionnaire_set_question_type(question, new_question_type);
		questionnaire_update_question_type_menu(question, new_question_type);

		return true;

		/*
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

		questionnaire_set_question_type(question_div, new_question_type);

		if (new_question_type == 'ranked-choice') {

			var choice_list = cloned_question_type_div.find('ul.ranked-choice-list');
			var ranked_choice = choice_list.children('li:not(:first-child)');

			ranked_choice.children('span[data-toggle="tooltip"]').tooltip();

			var slider_drag_handle = ranked_choice.children('.ranked-choice-slider-drag-handle');
			var ranked_choice_polygon = ranked_choice.children('.ranked-choice-polygon');

			slider_drag_handle.css('margin-bottom', '-' + (choice_list.outerHeight() - ranked_choice.outerHeight()) + 'px');
			ranked_choice_polygon.css('height', choice_list.outerHeight() + 'px');
		}
		*/
	}
}

function questionnaire_remove_section(section) {
	if (section == undefined) {
		return false;
	} else {
		var section_height = section.outerHeight(true);
		var section_z_index = questionnaire_get_section_z_index(section);

		section.css({'z-index': '0', 'margin-top': '-=' + section_height + 'px', 'opacity': '0'});

		section.siblings('.panel').each(function(sibling_index, sibling_section) {
			var sibling_section_z_index = questionnaire_get_section_z_index(sibling_section);

			if (sibling_section_z_index > section_z_index) {
				$(sibling_section).css('z-index', '-=1');

				if ($(section).index() > $(sibling_section).index()) {
					$(sibling_section).css('top', '-=' + section_height + 'px');
				}
			}
		});

		setTimeout(function() {
			$(section).remove();
		}, 1000);

		return true;
	}
}

function questionnaire_duplicate_section(section) {
	if (section == undefined) {
		return false;
	} else {
		var section_height = $(section).outerHeight(true);
		var section_z_index = questionnaire_get_section_z_index(section);
		var question_type = questionnaire_get_question_type(section);
		var section_position = questionnaire_get_section_position(section);

		var duplicated_section = $(section).clone(false);

		console.log(section.position().top);

		duplicated_section.css({
			'top': -($('#questionnaire').height() - $(section).position().top) + 'px',
			'z-index': '+=1'
		});

		questionnaire_get_footer().before(duplicated_section);

		$(duplicated_section).css('top', '+=' + section_height + 'px');

		$(duplicated_section).siblings('.panel').each(function(sibling_index, sibling_section) {
			if (questionnaire_get_section_z_index(sibling_section) > section_z_index) {
				$(sibling_section).css('z-index', '+=1');
				$(sibling_section).css('top', '+=' + section_height + 'px');
			}
		});

		/*
		$(section).prevAll('.panel').css('z-index', '+=1');
		//$(duplicated_section).css('z-index', '-=1');

		$(duplicated_section).css({
			//'top': -section_height + 'px',
			'margin-bottom': -$(section).outerHeight() + 'px'
		});

		for (var i = questionnaire_get_sections().length; i > section_position; i--) {
			var apa = questionnaire_get_section(i);

			questionnaire_set_section_position(apa, questionnaire_get_section_position(apa) + 1);

			if (apa.index() < section.index()) {
				apa.css('top', '+=' + section_height + 'px');
			}
		}

		questionnaire_set_section_position(duplicated_section, section_position + 1);

		section.after(duplicated_section);

		$(duplicated_section).css({
			//'top': '+=' + section_height + 'px',
			'margin-bottom': '+=' + $(section).outerHeight(true) + 'px'
		});
	*/

		return duplicated_section;
	}
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

function questionnaire_get_header() {
	return $('#questionnaire > header');
}

function questionnaire_get_footer() {
	return $('#questionnaire > footer');
}

function questionnaire_get_title() {
	return $(questionnaire.title.selector).text();
}

function questionnaire_set_title(title) {
	$(questionnaire.title.selector).text(title);
}

function questionnaire_get_description() {
	return $(questionnaire.description.selector).text();
}

function questionnaire_set_description(description) {
	$(questionnaire.description.selector).text(description);
}

function questionnaire_get_sections() {
	return $('#questionnaire > .panel');
}

function questionnaire_get_sections_array(sort_function) {
	var sections_array = [];

	questionnaire_get_sections().each(function(index, section) {
		sections_array.push(section);
	});

	if (sort_function != undefined && typeof(sort_function) === 'function') {
		sections_array.sort(sort_function);
	}

	return sections_array;
}

function questionnaire_get_section(section_number) {
	return $('#questionnaire > .panel[style*="z-index: ' + section_number + '"]');
}

function questionnaire_get_section_z_index(section) {
	return Number($(section).css('z-index'));
}

function questionnaire_get_section_position(section) {
	return Number($(section).css('z-index'));
}

function questionnaire_move_section(section, direction) {
	var section_position = questionnaire_get_section_position(section);
	var total_number_of_sections = questionnaire_get_sections().length;
	var sibling_section = null;

	if (direction === -1 && section_position > 1) {
		sibling_section = questionnaire_get_section(section_position - 1);
		$(section).css({'top': '-=' + sibling_section.outerHeight(true) + 'px', 'z-index': '-=1'});
		sibling_section.css({'top': '+=' + section.outerHeight(true) + 'px', 'z-index': '+=1'});

		return true;

	} else if (direction === 1 && section_position < total_number_of_sections) {
		sibling_section = questionnaire_get_section(section_position + 1);
		section.css({'top': '+=' + sibling_section.outerHeight(true) + 'px', 'z-index': '+=1'});
		sibling_section.css({'top': '-=' + section.outerHeight(true) + 'px', 'z-index': '-=1'});

		return true;

	} else {
		return false;
	}
}

function questionnaire_move_section_up(section) {
	return questionnaire_move_section(section, -1);
}

function questionnaire_move_section_down(section) {
	return questionnaire_move_section(section, 1);
}

function questionnaire_get_questions() {
	return $('#questionnaire > .question');
}

function questionnaire_get_heading_and_descriptions() {
	return $('#questionnaire > .heading-and-description');
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

function questionnaire_add_section(section_div, before_dom_insertion_callback) {
	var cloned_section_div = section_div.clone(true, true);

	if (before_dom_insertion_callback != undefined && typeof(before_dom_insertion_callback) === 'function') {
		before_dom_insertion_callback(cloned_section_div);
	}

	questionnaire_get_footer().before(cloned_section_div);

	$(cloned_section_div).css('top', '-=' + cloned_section_div.outerHeight() + 'px');
	$(cloned_section_div).css({'display': 'block'});
	$(cloned_section_div).css('top', '+=' + cloned_section_div.outerHeight() + 'px');

	questionnaire_update_section_z_indexes();

	return cloned_section_div;
}

function questionnaire_add_question(question_type) {
	if (question_type == undefined) {
		question_type = questionnaire.default_question_type;
	}

	if (!questionnaire_is_question_type_valid(question_type)) {
		return false;
	} else {
		return questionnaire_add_section($('.question[style*="display: none"]'), function(cloned_question_div) {
			questionnaire_change_question_type(cloned_question_div, question_type);
		});
	}
}

function questionnaire_add_heading_and_description() {
	return questionnaire_add_section($('.heading-and-description[style*="display: none"]'));
}

function questionnaire_update_section_z_indexes() {
	var sections = questionnaire_get_sections_array(questionnaire.default_section_sort_function);

	for (var i = 0; i < sections.length; i++) {
		$(sections[i]).css('z-index', i + 1);
	}
}

function questionnaire_preview() {
	$('#questionnaire').toggleClass('is-previewing');

	if ($('#questionnaire').hasClass('is-previewing')) {
		// Preview mode ON
		questionnaire_preview_questionnaire(true);
	} else {
		// Preview mode OFF
		questionnaire_preview_questionnaire(false);
		questionnaire_remove_all_question_validation_errors();
	}
}

function questionnaire_clear() {
	// Clear the questionnaire
	$('#questionnaire > .panel').remove();
	questionnaire_set_title(questionnaire.title.default_text);
	questionnaire_set_description(questionnaire.description.default_text);

	return true;
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
	var questionnaire_url = prompt("Specify the URL of the questionnaire to load:");

	$('#questionnaire').load(questionnaire_url);

	/*
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
	*/
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

function questionnaire_toggle_ranked_choice_alternatives_display_mode(ranked_choice, ranked_choice_type, new_choice_type_alternatives_positions) {
	ranked_choice_get_alternatives_list(ranked_choice).children('li').each(function(index, alternative) {
		ranked_choice_set_alternative_position(ranked_choice, $(alternative), new_choice_type_alternatives_positions);

		if (index === 0) {
			if (ranked_choice_type === questionnaire_data.constant('RANKED_CHOICE_TYPE_A_DESCRIPTION_STRING') ||
				ranked_choice_type === questionnaire_data.constant('RANKED_CHOICE_TYPE_B_DESCRIPTION_STRING')) {
				$(alternative).css('display', 'none');
			} else if (ranked_choice_type === questionnaire_data.constant('RANKED_CHOICE_TYPE_C_DESCRIPTION_STRING')) {
				$(alternative).css('display', 'inline-block');
			}
		} else {
			if (ranked_choice_type === questionnaire_data.constant('RANKED_CHOICE_TYPE_A_DESCRIPTION_STRING') ||
				ranked_choice_type === questionnaire_data.constant('RANKED_CHOICE_TYPE_B_DESCRIPTION_STRING')) {
				$(alternative).css('display', 'inline-block');
			} else if (ranked_choice_type === questionnaire_data.constant('RANKED_CHOICE_TYPE_C_DESCRIPTION_STRING')) {
				$(alternative).css('display', 'none');
			}
		}
	});
}

function questionnaire_change_ranked_choice_type(ranked_choice, new_choice_type) {
	var scale_list = ranked_choice.siblings(questionnaire_data.selector('RANKED_CHOICE_SCALE_TEXT_LIST'));
	var new_choice_type_scale_text = '';
	var new_choice_type_alternatives_positions = 0;
	var new_choice_type_slider_bar_steps = 0;
	var new_scale_text = null;

	if (new_choice_type == questionnaire_data.constant('RANKED_CHOICE_TYPE_A_DESCRIPTION_STRING')) {
		new_choice_type_scale_text = 'RANKED_CHOICE_TYPE_A_SCALE_TEXT';
		ranked_choice.removeClass(ranked_choice_types.type_b.classname);
		ranked_choice.removeClass(ranked_choice_types.type_c.classname);
		ranked_choice.addClass(ranked_choice_types.type_a.classname);
		ranked_choice_set_slider_bar_update_function_callback(ranked_choice, $(document).data(questionnaire_data.constant('RANKED_CHOICE_TYPE_A_SLIDER_BAR_CALLBACK')));
		new_choice_type_slider_bar_steps = questionnaire_data.constant('RANKED_CHOICE_TYPE_A_SLIDER_BAR_STEPS');
		new_choice_type_alternatives_positions = Math.round(new_choice_type_slider_bar_steps/2);
		$(questionnaire_data.selector('RANKED_CHOICE_ADD_ALTERNATIVE_BUTTON')).prop('disabled', false);
		scale_list.css('visibility', 'visible');
		new_scale_text = ranked_choice_types.type_a.scale_text;

	} else if (new_choice_type == questionnaire_data.constant('RANKED_CHOICE_TYPE_B_DESCRIPTION_STRING')) {
		new_choice_type_scale_text = 'RANKED_CHOICE_TYPE_B_SCALE_TEXT';
		ranked_choice.removeClass(ranked_choice_types.type_a.classname);
		ranked_choice.removeClass(ranked_choice_types.type_c.classname);
		ranked_choice.addClass(questionnaire_data.classname('RANKED_CHOICE_TYPE_B'));
		ranked_choice_set_slider_bar_update_function_callback(ranked_choice, $(document).data(questionnaire_data.constant('RANKED_CHOICE_TYPE_B_SLIDER_BAR_CALLBACK')));
		new_choice_type_slider_bar_steps = questionnaire_data.constant('RANKED_CHOICE_TYPE_B_SLIDER_BAR_STEPS');
		new_choice_type_alternatives_positions = 1;
		$(questionnaire_data.selector('RANKED_CHOICE_ADD_ALTERNATIVE_BUTTON')).prop('disabled', false);
		scale_list.css('visibility', 'hidden');
		new_scale_text = ranked_choice_types.type_b.scale_text;

	} else if (new_choice_type == questionnaire_data.constant('RANKED_CHOICE_TYPE_C_DESCRIPTION_STRING')) {
		new_choice_type_scale_text = 'RANKED_CHOICE_TYPE_C_SCALE_TEXT';
		ranked_choice.removeClass(ranked_choice_types.type_a.classname);
		ranked_choice.removeClass(ranked_choice_types.type_b.classname);
		ranked_choice.addClass(ranked_choice_types.type_c.classname);
		ranked_choice_set_slider_bar_update_function_callback(ranked_choice, $(document).data(questionnaire_data.constant('RANKED_CHOICE_TYPE_C_SLIDER_BAR_CALLBACK')));
		new_choice_type_slider_bar_steps = questionnaire_data.constant('RANKED_CHOICE_TYPE_C_SLIDER_BAR_STEPS');
		new_choice_type_alternatives_positions = Math.round(new_choice_type_slider_bar_steps/2);
		$(questionnaire_data.selector('RANKED_CHOICE_ADD_ALTERNATIVE_BUTTON')).prop('disabled', true);
		scale_list.css('visibility', 'visible');
		new_scale_text = ranked_choice_types.type_c.scale_text;
	}

	ranked_choice_get_slider_bar(ranked_choice).css({'padding-left': '', 'padding-right': ''});
	ranked_choice_set_slider_bar_steps(ranked_choice, new_choice_type_slider_bar_steps);
	questionnaire_toggle_ranked_choice_alternatives_display_mode(ranked_choice, new_choice_type, new_choice_type_alternatives_positions);

	// Update ranked choice scale text
	scale_list.children('li:nth-child(1)').children('span').text(new_scale_text[0]);
	scale_list.children('li:nth-child(2)').children('span').text(new_scale_text[1]);
	scale_list.children('li:nth-child(3)').children('span').text(new_scale_text[2]);
}