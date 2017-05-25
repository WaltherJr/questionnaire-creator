"use strict";

var questionnaire = {
	selector: '#questionnaire',
	storage_key: 'questionnaires',

	modal_dialogs: {
		add_image: {
			selector: '#questionnaire-add-image-modal-dialog',
			url_default_text: 'http://www.example.com/image.jpg',

			get_image_url: function() {
				return $('#questionnaire-add-image-modal-dialog').find('#txt-image-address').val();
			},
			set_image_url: function(url) {
				return $('#questionnaire-add-image-modal-dialog').find('#txt-image-address').val(url);
			}
		},

		add_hyperlink: {
			selector: '#questionnaire-add-hyperlink-modal-dialog',
			url_default_text: 'http://www.example.com',

			get_link_url: function() {
				return $('#questionnaire-add-hyperlink-modal-dialog').find('#txt-link-address').val();
			},
			set_link_url: function(url) {
				return $('#questionnaire-add-hyperlink-modal-dialog').find('#txt-link-address').val(url);
			}
		},

		add_email_link: {
			selector: '#questionnaire-add-email-link-modal-dialog',
			recipient_default_text: 'john.doe@example.com',

			get_link_text: function() {
				return $('#questionnaire-add-email-link-modal-dialog').find('#txt-link-text').val();
			},
			set_link_text: function(text) {
				return $('#questionnaire-add-email-link-modal-dialog').find('#txt-link-text').val(text);
			},
			get_link_address: function() {
				return $('#questionnaire-add-email-link-modal-dialog').find('#txt-link-address').val();
			},
			set_link_address: function(address) {
				return $('#questionnaire-add-email-link-modal-dialog').find('#txt-link-address').val(address);
			}
		},

		save_questionnaire: {
			selector: '#questionnaire-save-modal-dialog',

			get_questionnaire_name: function() {
				return $('#questionnaire-save-modal-dialog').find('#txt-questionnaire-name').val();
			},
			set_questionnaire_name: function(name) {
				return $('#questionnaire-save-modal-dialog').find('#txt-questionnaire-name').val(name);
			}
		},

		load_questionnaire: {
			selector: '#questionnaire-load-modal-dialog',

			set_questionnaire_list: function(list) {
				var html_string = '';

				for (var i = 0; i < list.length; i++) {
					html_string += ('<option>' + list[i] + '</option>');
				}

				$('#questionnaire-load-modal-dialog').find('#questionnaire-load-modal-dialog-questionnaires-list').html(html_string);
			},
			get_selected_questionnaire: function() {
				return $('#questionnaire-load-modal-dialog').find('#questionnaire-load-modal-dialog-questionnaires-list').val();
			}
		},

		clear_questionnaire: {
			selector: '#questionnaire-clear-questionnaire-modal-dialog'
		}
	},

	question_type: {
		prototypes_selector: '#questionnaire-question-types',
		attribute_name: 'data-current-question-type',
		default_type: 'short-answer'
	},

	question_types: {
		short_answer: {
			name: 'short-answer',
			default_placeholder_text: 'Kort svarstext',

			get_answer_text: function(question_div) {
				return $(question_div).find('.question-short-answer-text').val();
			},
			set_answer_text: function(question_div, answer_text) {
				return $(question_div).find('.question-short-answer-text').val(answer_text);
			},
			validation: function(question_div) {
				return $(question_div).find('.question-short-answer-text').val() !== '';
			}
		},
		paragraph: {
			name: 'paragraph',
			default_placeholder_text: 'Lång svarstext',

			get_answer_text: function(question_div) {
				return $(question_div).find('.question-paragraph-text').val();
			},
			set_answer_text: function(question_div, answer_text) {
				return $(question_div).find('.question-paragraph-text').val(answer_text);
			},
			validation: function(question_div) {
				return $(question_div).find('.question-paragraph-text').val() !== '';
			}
		},
		single_choice_list: {
			name: 'single-choice-list',

			validation: function(question_div) {
				var alternatives_list = questionnaire_get_question_answer_alternatives_list(question_div);

				alternatives_list.children('li').each(function(index, alternative) {
					if ($(alternative).children('input').prop('checked') === true) {
						return true;
					}
				});

				return false;
			}
		},
		single_choice_radio_buttons: {
			name: 'single-choice-radio-buttons',
			add_alternative_label: {
				selector: '.single-choice-add-alternative'
			},

			validation: function(question_div) {
				var alternatives_list = questionnaire_get_question_answer_alternatives_list(question_div);

				alternatives_list.children('li').each(function(index, alternative) {
					if ($(alternative).children('input').prop('checked') === true) {
						return true;
					}
				});

				return false;
			}
		},
		multiple_choice_list: {
			name: 'multiple-choice-list',

			validation: function() {

			}
		},
		multiple_choice_checkboxes: {
			name: 'multiple-choice-checkboxes',
			add_alternative_label: {
				selector: '.multiple-choice-add-alternative'
			},

			validation: function() {

			}
		},
		ranked_choice: {
			name: 'ranked-choice',

			validation: function() {

			}
		}
	},

	default_section_sort_function: function(section_a, section_b) {
		return questionnaire_get_section_position(section_a) - questionnaire_get_section_position(section_b);
	},

	title: {
		selector: '.questionnaire-title',
		default_text: 'Namnlöst formulär',
	},

	description: {
		selector: '.questionnaire-description',
		default_text: 'Beskrivning av formulär',
	},

	section: {
		selector: '.section',
		position: {
			attr_name: 'data-position'
		}
	},

	question: {
		selector: '.question',
		prototype_selector: '.question[style*="display: none"]',
		question_types_list: {
			selector: '.questionnaire-question-types-list'
		}
	},

	heading_and_description: {
		selector: '.heading-and-description',
		prototype_selector: '.heading-and-description[style*="display: none"]'
	},

	operations_toolbar: {
		selector: '.questionnaire-operations-toolbar',
		preview_button: {
			classname: 'questionnaire-preview-questionnaire-button',
			preview_mode_enabled_tooltip_text: 'Sluta förhandsgranska formulär',
			preview_mode_disabled_tooltip_text: 'Förhandsgranska formulär'
		}
	}
};

var ranked_choice_types = {
	type_a: {
		name: 'Typ A',
		classname: 'ranked-choice-type-a',
		slider_bar_steps: 15,
		alternatives_initial_position: 8,
		scale_text: ['Dåligt', 'Varken eller', 'Bra'],
		update_function_callback: function(ranked_choice_slider_bar, ranked_choice_alternatives_list) {
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

			$(ranked_choice_slider_bar).css({
				'padding-left':  Math.round((ranges.left-1)/14*100) + '%',
				'padding-right': Math.round((15-ranges.right)/14*100) + '%'
			});
		}
	},
	type_b: {
		name: 'Typ B',
		classname: 'ranked-choice-type-b',
		slider_bar_steps: 15,
		alternatives_initial_position: 1,
		scale_text: ['', '', ''],
		update_function_callback: function(ranked_choice_slider_bar, ranked_choice_alternatives_list) {
            var ranges = {left: 1, right: 1};

            ranked_choice_alternatives_list.children('li').each(function(index, alternative) {
                var alternative_position = ranked_choice_get_alternative_position($(alternative));

                if (alternative_position > ranges.right) {
                    ranges.right = alternative_position;
                }
            });

            $(ranked_choice_slider_bar).css({'padding-left': '0%',
                'padding-right': Math.round((15-ranges.right)/14*100) + '%'});
        }
	},
	type_c: {
		name: 'Typ C',
		classname: 'ranked-choice-type-c',
		slider_bar_steps: 11,
		alternatives_initial_position: 6,
		scale_text: ['Alternativ A', 'Lika viktiga', 'Alternativ B'],
		update_function_callback: function(ranked_choice_slider_bar, ranked_choice_alternatives_list) {
            var arrow_alternative_position = ranked_choice_get_alternative_position(ranked_choice_alternatives_list.children('li:first-child'));
            var padding_left = Math.min(5, arrow_alternative_position-1)*10;
            var padding_right = Math.min(5, 11-arrow_alternative_position)*10;

            $(ranked_choice_slider_bar).css({'padding-left':  padding_left + '%',
                'padding-right': padding_right + '%'});
        }
    }
}

function questionnaire_produce_error_message(message) {
	return 'ERROR - ' + message;
}

function questionnaire_get_ranked_choice_type_from_ranked_choice_ctrl(ranked_choice) {
	if ($(ranked_choice).hasClass('ranked-choice-type-a')) {
		return ranked_choice_types['type_a'];
	} else if ($(ranked_choice).hasClass('ranked-choice-type-b')) {
		return ranked_choice_types['type_b'];
	} else if ($(ranked_choice).hasClass('ranked-choice-type-c')) {
		return ranked_choice_types['type_c'];
	} else {
		throw questionnaire_produce_error_message('Unknown ranked choice type');
	}
}

function questionnaire_init_popover_guides() {
	var popover_settings = {
		trigger: 'hover',
		placement: 'top',
	};

	popover_settings.title = 'Placeholder-text';
	popover_settings.content = 'Placeholder-text är den text som finns inledningsvis i textrutan, men som försvinner när textrutan fylls med text.';

	$('#text-input-pane-placeholder-text').popover(popover_settings);

	popover_settings.title = 'Bild-adress';
	popover_settings.content = 'Bild-adressen är den länktext som fås genom att högerklicka på en bild och sedan välja "Kopiera bildadress" från menyn som poppar upp.';
	$('#image-pane-image-url').popover(popover_settings);

	popover_settings.title = 'Rankat val-typ';
	popover_settings.html = true;
	popover_settings.content = '\
	<dl class="ranked-choice-type-definition-list">\
  		<dt>Typ A</dt>\
  		<dd>Inbördes ranking av flera alternativ, där rankingskalan går från negativ (röd) till positiv (grön).</dd>\
  		<dt>Typ B</dt>\
  		<dd>Inbördes ranking av flera alternativ, där rankingskalan är neutral.</dd>\
  		<dt>Typ C</dt>\
  		<dd>Inbördes ranking av endast två alternativ, där rankingskalan går från negativ (röd) till positiv (grön).</dd>\
	</dl>';
	popover_settings.selector = '.ranked-choice-type-select-list';
	$('body').popover(popover_settings);
}

function questionnaire_init_ranked_choice_types(ranked_choice) {
	for (var ranked_choice_type in ranked_choice_types) {
		$('.ranked-choice-type-select-list').append('<option>' + ranked_choice_types[ranked_choice_type].name + '</option>');
	}

	// Set default callback to type A
	ranked_choice_set_slider_bar_update_function_callback(ranked_choice, ranked_choice_types.type_c.function_callback);
}

function questionnaire_init_modal_dialogs() {
	$(questionnaire.modal_dialogs.add_image.selector).find('#txt-image-address').attr('placeholder', questionnaire.modal_dialogs.add_image.url_default_text);

	$(questionnaire.modal_dialogs.save_questionnaire.selector).on('shown.bs.modal', function() {
    	$(questionnaire.modal_dialogs.save_questionnaire.selector).find('#txt-questionnaire-name').select();
	});

	$(questionnaire.modal_dialogs.load_questionnaire.selector).on('shown.bs.modal', function() {
		// Prevent shrinking of questionnaires list when deleting questionnaires
		var questionnaires_list_width = $(questionnaire.modal_dialogs.load_questionnaire.selector).find('#questionnaire-load-modal-dialog-questionnaires-list').outerWidth();
		$(questionnaire.modal_dialogs.load_questionnaire.selector).find('#questionnaire-load-modal-dialog-questionnaires-list').css('min-width', questionnaires_list_width + 'px');
	});
}

function questionnaire_show_context_toolbar_pane(pane) {
	questionnaire_hide_context_toolbar_panes();
	$(pane).css('display', 'block');
	$('#questionnaire-context-toolbar').css('min-height', '20%');
}

function questionnaire_hide_context_toolbar_panes() {
	$('#questionnaire-context-toolbar').children('div').css('display', 'none');
	$('#questionnaire-context-toolbar').css('min-height', '0%');
}

function questionnaire_set_links_click_behaviour(normal_behaviour) {
	if (normal_behaviour === true) {
		$(document).off('click', 'a');
	} else {
		$(document).on('click', 'a', function(event) {
			event.preventDefault();
		});
	}
}

$(document).ready(function() {
	questionnaire_activate_main_toolbar_tooltips();
	questionnaire_init_modal_dialogs();
	questionnaire_set_links_click_behaviour(false);
	questionnaire_init_popover_guides();

	$('#questionnaire-context-toolbar').children('div').css('display', 'none');

	$('#text-input-pane-placeholder-text').on('input', function() {
		if (questionnaire.last_focused_text_field != undefined) {
			$(questionnaire.last_focused_text_field).attr('placeholder', $(this).val());
		}
	});

	$('#image-pane-image-url').on('change', function() {
		var associated_image = $(this).data('image');

		if (associated_image != undefined) {
			if (associated_image.attr('src') !== $(this).val()) {
				// Change image URL
				associated_image.attr('src', $(this).val());
			}
		}
	});

	$('#link-pane-link-url').on('change', function() {
		var associated_link = $(this).data('link');

		if (associated_link != undefined) {
			if (associated_link.attr('href') !== $(this).val()) {
				// Change link URL
				associated_link.attr('href', $(this).val());
			}
		}
	});

	$('#link-pane-link-text').on('input', function() {
		var associated_link = $(this).data('link');

		if (associated_link != undefined) {
			associated_link.text($(this).val());
		}
	});

	$('#text-input-pane-placeholder-text-reset-button').on('click', function() {
		if (questionnaire.last_focused_text_field.prop('tagName').toLowerCase() === 'textarea') {
			$('#text-input-pane-placeholder-text').val(questionnaire.question_types.paragraph.default_placeholder_text);
			questionnaire.last_focused_text_field.attr('placeholder', questionnaire.question_types.paragraph.default_placeholder_text);
		} else if (questionnaire.last_focused_text_field.attr('type') === 'text') {
			$('#text-input-pane-placeholder-text').val(questionnaire.question_types.short_answer.default_placeholder_text);
			questionnaire.last_focused_text_field.attr('placeholder', questionnaire.question_types.short_answer.default_placeholder_text);
		}
	});

	$(document).on('focus', 'textarea, input, img, a', function(event) {
		var event_target = $(event.target);
		var tag_name = $(event.target).prop('tagName').toLowerCase();

		console.log(tag_name);

		if (tag_name === 'textarea') {
			questionnaire_show_context_toolbar_pane('#questionnaire-context-toolbar-text-input-pane');
			$('#questionnaire-context-toolbar-text-input-pane').find('#text-input-pane-placeholder-text').val(event_target.attr('placeholder'));
			questionnaire.last_focused_text_field = event_target;
		} else if (tag_name === 'input' && event_target.attr('type') === 'text' && event_target.parent('div[class*="question-type-"]').length === 1) {
			questionnaire_show_context_toolbar_pane('#questionnaire-context-toolbar-text-input-pane');
			$('#questionnaire-context-toolbar-text-input-pane').find('#text-input-pane-placeholder-text').val(event_target.attr('placeholder'));
			questionnaire.last_focused_text_field = event_target;
		} else if (tag_name === 'img') {
			questionnaire_show_context_toolbar_pane('#questionnaire-context-toolbar-image-pane');
			$('#questionnaire-context-toolbar-image-pane').find('#image-pane-image-url').data('image', event_target);
			$('#questionnaire-context-toolbar-image-pane').find('#image-pane-image-url').val(event_target.attr('src'));
		} else if (tag_name === 'a') {
			console.log("aaaaa");
			questionnaire_show_context_toolbar_pane('#questionnaire-context-toolbar-link-pane');
			$('#questionnaire-context-toolbar-link-pane').find('#link-pane-link-url, #link-pane-link-text').data('link', event_target);
			$('#questionnaire-context-toolbar-link-pane').find('#link-pane-link-url').val(event_target.attr('href'));
			$('#questionnaire-context-toolbar-link-pane').find('#link-pane-link-text').val(event_target.text());
		}
	});

	$(document).on('click', '#image-pane-image-position-button-group > button', function() {
		$(this).siblings('button').removeClass('btn-primary');
		$(this).addClass('btn-primary');

		var child = $(this).children('span');
		var referenced_image = $('#questionnaire-context-toolbar-image-pane').find('#image-pane-image-url').data('image');

		if (child.hasClass('glyphicon-align-left') && referenced_image != undefined) {
			referenced_image.css('left', '0%');
		} else if (child.hasClass('glyphicon-align-center') && referenced_image != undefined) {
			referenced_image.css('left', 'calc(50% - ' + Math.floor(referenced_image.outerWidth()/2) + 'px)');
		} else if (child.hasClass('glyphicon-align-right') && referenced_image != undefined) {
			referenced_image.css('left', 'calc(100% - ' + referenced_image.outerWidth() + 'px)');
		}
	});

	$(document).on('blur', 'input, textarea, img, a', function(event) {
		if ($(event.relatedTarget).closest('#questionnaire-context-toolbar').length === 0) {
			questionnaire_hide_context_toolbar_panes();
		}
	});

	$('.question, .heading-and-description').children('.panel-footer').prepend($('.section-footer-toolbar').css('display', 'inline-block'));

	var ranked_choice = ranked_choice_create_new(ranked_choice_types.type_a.slider_bar_steps, ranked_choice_types.type_a.update_function_callback);
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

	$(document).on('click', '.ranked-choice-alternative-remove-button', function(event) {
		ranked_choice_remove_alternative($(this).closest('li'));
	});

	$(document).on('click', '.ranked-choice-add-alternative-button', function() {
		var ranked_choice = $(this).closest('.question-type-ranked-choice').children('.ranked-choice');
		var ranked_choice_type = questionnaire_get_ranked_choice_type_from_ranked_choice_ctrl(ranked_choice);

		ranked_choice_add_alternative(ranked_choice, ranked_choice_type.alternatives_initial_position, 'Alternativ');
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

	$('.questionnaire-load-modal-dialog-remove-questionnaire-button').on('click', function() {
		var selected_questionnaire = questionnaire.modal_dialogs.load_questionnaire.get_selected_questionnaire();
		var saved_questionnaires = questionnaire_get_saved_questionnaires();
		var options_list = $('#questionnaire-load-modal-dialog-questionnaires-list');
		var options = options_list.children('option');

		console.log(options);

		for (var i = 0; i < saved_questionnaires.length; i++) {
			if (saved_questionnaires[i].name === selected_questionnaire) {
				console.log("hej!");
				// Remove the saved questionnaire
				saved_questionnaires.splice(i, 1);

				console.log(options.length);

				for (var j = 0; j < options.length; j++) {
					if ($(options[j]).text() === selected_questionnaire) {
						$(options[j]).remove();
					}
				}
			}
		}

		localStorage.setItem('questionnaires', JSON.stringify(saved_questionnaires));
	});

	$('.mnu-question-type a').click(function(event) {
		event.preventDefault();
	});

	$(questionnaire.question_types.single_choice_radio_buttons.add_alternative_label.selector).on('click', function() {
		questionnaire_add_question_answer_alternative($(this).closest('.panel'), questionnaire.question_types.single_choice_radio_buttons);
	});

	$(questionnaire.question_types.multiple_choice_checkboxes.add_alternative_label.selector).on('click', function() {
		questionnaire_add_question_answer_alternative($(this).closest('.panel'), questionnaire.question_types.multiple_choice_checkboxes);
	});

	questionnaire_install_main_toolbar_event_listeners();
	questionnaire_install_section_toolbar_event_listeners();
	questionnaire_install_modal_dialogs_event_listeners();

	$('.ranked-choice-alternatives-list').tooltip({'title': 'Ta bort alternativ', 'placement': 'right', 'container': 'body', 'selector': '.remove-ranked-choice'});

	$(document).on('click', questionnaire.question.question_types_list.selector + ' > li', function() {
		questionnaire_change_question_type($(this).closest('.panel'), $(this).attr('data-question-type'));
	});

	$(document).on('click', '.questionnaire-mandatory-question-label', function() {
		$(this).tooltip('destroy');
		$(this).blur();
	});

	$(document).on('click', '.single-choice-remove-alternative-button, .multiple-choice-remove-alternative-button', function() {
		$(this).parent().remove();
	});

	$('#questionnaire-clear-questionnaire-modal-dialog button[class*="btn-danger"]').on('click', questionnaire_clear);

	questionnaire_activate_section_toolbar_tooltips();

	$(document).click(function(event) {
		if ($(event.target).closest("div[class*='section']").length == 0) {
			$('.focused').removeClass('focused');
		}
	});
});

function questionnaire_install_section_toolbar_event_listeners() {
	$(questionnaire.selector).on('click', '.questionnaire-move-section-up-button', function() {
		$(this).tooltip('hide');
		$(this).blur();
		questionnaire_move_section_up($(this).closest('.panel'));
	});

	$(questionnaire.selector).on('click', '.questionnaire-move-section-down-button', function() {
		$(this).tooltip('hide');
		$(this).blur();
		questionnaire_move_section_down($(this).closest('.panel'));
	});

	$(questionnaire.selector).on('click', '.questionnaire-duplicate-section-button', function() {
		$(this).tooltip('hide');
		$(this).blur();
		questionnaire_duplicate_section($(this).closest('.panel'));
	});

	$(questionnaire.selector).on('click', '.questionnaire-remove-section-button', function() {
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
	$(questionnaire.selector).tooltip({
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

function questionnaire_get_saved_range() {
	return questionnaire.saved_range;
}

function questionnaire_set_saved_range(range) {
	questionnaire.saved_range = range;
}

function questionnaire_install_modal_dialogs_event_listeners() {
	$(questionnaire.modal_dialogs.add_image.selector).on('click', 'button[class*="btn-primary"]', function() {
		questionnaire_insert_image(questionnaire_get_saved_range());
	});

	$(questionnaire.modal_dialogs.add_hyperlink.selector).on('click', 'button[class*="btn-primary"]', function() {
		questionnaire_insert_hyperlink(questionnaire_get_saved_range());
	});

	$(questionnaire.modal_dialogs.add_email_link.selector).on('click', 'button[class*="btn-primary"]', function() {
		//questionnaire_insert_email_link(questionnaire_get_saved_range());
	});

	$(questionnaire.modal_dialogs.save_questionnaire.selector).on('click', 'button[class*="btn-primary"]', function() {
		var new_questionnaire = {
			name: questionnaire.modal_dialogs.save_questionnaire.get_questionnaire_name(),
			html: $(questionnaire.selector).html()
		};

		questionnaire_save(new_questionnaire);
	});

	$(questionnaire.modal_dialogs.load_questionnaire.selector).on('click', 'button[class*="btn-primary"]', function() {
		var selected_questionnaire_name = questionnaire.modal_dialogs.load_questionnaire.get_selected_questionnaire();
		questionnaire_load(selected_questionnaire_name);
	});

	$(questionnaire.modal_dialogs.load_questionnaire.selector).on('click', 'button[class*="btn-danger"]', function() {
		questionnaire_clear();
	});
}

function questionnaire_is_selection_inside_questionnaire(range) {
	return $(range.commonAncestorContainer).closest(questionnaire.selector).length === 1;
}

function questionnaire_run_function_if_selection_inside_questionnaire(func) {
	var selection = rangy.getSelection();

	if (selection.rangeCount > 0) {
		var range = selection.getRangeAt(0);

		if (questionnaire_is_selection_inside_questionnaire(range) === true) {
			questionnaire_set_saved_range(range);
			func();
		}
	}
}

function questionnaire_install_main_toolbar_event_listeners() {
	$('.questionnaire-add-question-button').on('click', function() {
		$(this).blur();
		questionnaire_add_question(questionnaire.question_type.default_type);
	});

	$('.questionnaire-add-heading-and-description-button').on('click', function() {
		$(this).blur();
		questionnaire_add_heading_and_description();
	});

	$('.questionnaire-add-image-button').on('click', function() {
		$(this).blur();

		questionnaire_run_function_if_selection_inside_questionnaire(function() {
			questionnaire_display_add_image_modal();
		})
	});

	$('.questionnaire-add-hyperlink-button').on('click', function() {
		$(this).blur();

		var selection = rangy.getSelection();

		if (selection.rangeCount > 0) {
			var range = selection.getRangeAt(0);

			questionnaire_set_saved_range(range);
			questionnaire_display_add_hyperlink_modal();
		}
	});

	$('.questionnaire-add-email-link-button').on('click', function() {
		$(this).blur();

		var selection = rangy.getSelection();

		console.log(selection);

		if (selection.rangeCount > 0) {
			var range = selection.getRangeAt(0);

			questionnaire_set_saved_range(range);
			questionnaire_display_add_email_link_modal(selection);
		}
	});

	$('.questionnaire-undo-button').on('click', function() {
		$(this).blur();
		document.execCommand('undo');
	});

	$('.questionnaire-redo-button').on('click', function() {
		$(this).blur();
		document.execCommand('redo');
	});

	$('.questionnaire-preview-questionnaire-button').on('click', function() {
		$(this).blur();
		questionnaire_preview();
	});

	$('.questionnaire-save-questionnaire-button').on('click', function() {
		$(this).blur();
		questionnaire_display_save_questionnaire_modal();
	});

	$('.questionnaire-load-questionnaire-button').on('click', function() {
		$(this).blur();
		questionnaire_display_load_questionnaire_modal();
	});

	$('.questionnaire-clear-questionnaire-button').on('click', function() {
		$(this).blur();
		questionnaire_display_clear_questionnaire_modal();
	});
}

function questionnaire_add_email_link() {
	var new_email_link = $(document.createElement('a')).attr({
		'href': 'mailto:' + 'erik@dsv.su.se',
		'target': '_blank'
	});

	return new_email_link;
}

function questionnaire_create_link_from_selection(selection, range, url, target) {
	if (target == undefined) {
		target = '_blank';
	}

	var new_link = document.createElement('a');

	$(new_link).attr({
		'href': url,
		'target': target
	});

	range.surroundContents(new_link);

	return new_link;
}

function questionnaire_create_hyperlink_from_selection(selection, range, url, target) {
	return questionnaire_create_link_from_selection(selection, range, url, target);
}

function questionnaire_create_email_link_from_selection(selection, range, recipient, target) {
	return questionnaire_create_link_from_selection(selection, range, 'mailto:' + recipient, target);
}

function questionnaire_insert_image(range) {
	var image_url = questionnaire.modal_dialogs.add_image.get_image_url();
	var new_image = document.createElement('img');

	console.log("hej!");

	$(new_image).attr('src', image_url);
	$(new_image).attr('tabindex', '0');

	range.deleteContents();
	range.insertNode(new_image);

	/*
	$(new_image).on('click', function() {
		var selection = window.getSelection();

		if (selection.rangeCount > 0) {
			selection.removeAllRanges();
		}

		var image_range = document.createRange();

		image_range.selectNode($(this).get(0));
		selection.addRange(range);
	});
	*/
}

function questionnaire_insert_hyperlink(range) {
	var new_hyperlink = document.createElement('a');
	var link_url = questionnaire.modal_dialogs.add_hyperlink.get_link_url();

	$(new_hyperlink).attr({'href': link_url, 'target': '_blank'});
	/*
	var link_type = $(questionnaire.modal_dialogs.add_hyperlink.selector).attr('data-link-type');
	var link_address = '';
	var new_hyperlink = document.createElement('a');

	if (link_type == 'hyperlink') {
		link_address = $(questionnaire.modal_dialogs.add_hyperlink.selector).find('input[id="txt-link-address"]').val();
	} else if (link_type == 'email-link') {
		link_address = 'mailto:' + $(questionnaire.modal_dialogs.add_hyperlink.selector).find('input[id="txt-link-address"]').val();
	}

	new_link.setAttribute('href', link_address);
	new_link.setAttribute('target', '_blank');

	range.surroundContents(new_link);
	*/
}

function questionnaire_display_add_image_modal() {
	$(questionnaire.modal_dialogs.add_image.selector).modal();
}

function questionnaire_display_add_hyperlink_modal() {
	$(questionnaire.modal_dialogs.add_hyperlink.selector).attr('data-link-type', 'hyperlink');
	$(questionnaire.modal_dialogs.add_hyperlink.selector).find('.modal-title').text('Lägg till hyperlänk');
	$(questionnaire.modal_dialogs.add_hyperlink.selector).find('input[id="txt-link-text"]').attr('value', '');
	$(questionnaire.modal_dialogs.add_hyperlink.selector).find('label[class*="lbl-link-address"]').text('Länkadress: ');
	$(questionnaire.modal_dialogs.add_hyperlink.selector).find('input[id="txt-link-address"]').attr({'placeholder': 'http://www.example.com', 'value': ''});
	$(questionnaire.modal_dialogs.add_hyperlink.selector).modal();
}

function questionnaire_display_add_email_link_modal(selection) {
	if (selection != undefined) {
		var range = selection.getRangeAt(0);

		questionnaire.modal_dialogs.add_email_link.set_link_text('');
		questionnaire.modal_dialogs.add_email_link.set_link_address('');

		console.log(range);

		if (range.commonAncestorContainer != undefined) {
			if (range.commonAncestorContainer.nodeName === 'A') {
				alert('anchor tag!');
			} else if (range.commonAncestorContainer.parentNode != undefined && range.commonAncestorContainer.parentNode.nodeName === 'A') {
				alert("setting link text");
				questionnaire.modal_dialogs.add_email_link.set_link_text(range.commonAncestorContainer.nodeValue);
				questionnaire.modal_dialogs.add_email_link.set_link_address(range.commonAncestorContainer.parentNode.href);

				$(questionnaire.modal_dialogs.add_email_link.selector).find('button[class*="btn-primary"]').click(function() {
					var link_address = 	'mailto:' + questionnaire.modal_dialogs.add_email_link.get_link_address();
					range.commonAncestorContainer.parentNode.href = link_address;
				});
			} else {
				$(questionnaire.modal_dialogs.add_email_link.selector).find('button[class*="btn-primary"]').on('click', function() {
					var anchor = document.createElement('a');

					anchor.setAttribute('href', 'http://' + questionnaire.modal_dialogs.add_email_link.get_link_address());
					anchor.setAttribute('target', '_blank');
					anchor.setAttribute('tabindex', '0');
					anchor.setAttribute('contenteditable', 'false');

					range.surroundContents(anchor);
				});
			}
		}
	}

	$(questionnaire.modal_dialogs.add_email_link.selector).modal();
}

function questionnaire_display_save_questionnaire_modal() {
	questionnaire.modal_dialogs.save_questionnaire.set_questionnaire_name(questionnaire_get_title());
	$(questionnaire.modal_dialogs.save_questionnaire.selector).modal();
}

function questionnaire_display_load_questionnaire_modal() {
	if (typeof(Storage) !== "undefined") {
		var questionnaire_data = JSON.parse(localStorage.getItem('questionnaires'));
		var questionnaire_names = [];

		if (questionnaire_data == undefined || questionnaire_data.length === 0) {
			alert("No saved questionnaires!");
		} else {
			for (var i = 0; i < questionnaire_data.length; i++) {
				questionnaire_names.push(questionnaire_data[i].name);
			}

			questionnaire.modal_dialogs.load_questionnaire.set_questionnaire_list(questionnaire_names);
			$(questionnaire.modal_dialogs.load_questionnaire.selector).modal();
		}
	}
}

function questionnaire_display_clear_questionnaire_modal() {
	$(questionnaire.modal_dialogs.clear_questionnaire.selector).modal();
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

function questionnaire_get_question_answer_alternatives_list(question_type_div) {
	return $(question_type_div).find('.question-answer-alternatives').children('li:not(:last-child)');
}

function questionnaire_add_question_answer_alternative_to_alternatives_list(question_type_div, answer_alternative) {
	var question_answer_alternatives_list = $(question_type_div).find('.question-answer-alternatives');
	return $(question_answer_alternatives_list).children('li:last-child').before(answer_alternative);
}

function questionnaire_add_question_answer_alternative(question_div, question_type) {
	var question_type_div = questionnaire_get_question_type_div(question_div);
	var current_question_type = questionnaire_get_question_type(question_div);
	var question_answer_alternatives_list = questionnaire_get_question_answer_alternatives_list(question_type_div);
	var answer_number = question_answer_alternatives_list.length + 1;

	var new_question_answer_alternative_list_item = document.createElement('li');
	var new_question_answer_alternative_input = document.createElement('input');
	var new_question_answer_alternative_label = document.createElement('label');
	var new_question_answer_alternative_text = document.createTextNode('Alternativ');
	var new_question_answer_remove_alternative_button = document.createElement('span');

	$(new_question_answer_alternative_label).attr({'contenteditable': 'true', 'spellcheck': 'false'});

	$(new_question_answer_alternative_input).prop('disabled', true);
	$(new_question_answer_remove_alternative_button).html('&times;');

	if (question_type === questionnaire.question_types.single_choice_radio_buttons) {
		$(new_question_answer_alternative_input).attr({'type': 'radio'});
		$(new_question_answer_remove_alternative_button).attr('class', 'single-choice-remove-alternative-button');
	} else if (question_type === questionnaire.question_types.multiple_choice_checkboxes) {
		$(new_question_answer_alternative_input).attr({'type': 'checkbox'});
		$(new_question_answer_remove_alternative_button).attr('class', 'multiple-choice-remove-alternative-button');
	}

	$(new_question_answer_alternative_label).append(new_question_answer_alternative_text);

	$(new_question_answer_alternative_list_item).append(
		new_question_answer_alternative_input,
		new_question_answer_alternative_label,
		new_question_answer_remove_alternative_button
	);

	questionnaire_add_question_answer_alternative_to_alternatives_list(question_type_div, new_question_answer_alternative_list_item);

	$(new_question_answer_remove_alternative_button).tooltip({
		container: 'body',
		placement: 'right',
		title: 'Ta bort alternativ'
	});

	questionnaire_select_element_contents(new_question_answer_alternative_label);

	return new_question_answer_alternative_list_item;
}

// http://stackoverflow.com/questions/20009575/firefox-doesnt-select-contenteditable-text-properly
function questionnaire_select_element_contents(node) {
	var range = rangy.createRange();
	range.selectNodeContents(node);
	var sel = rangy.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

function questionnaire_get_number_of_question_types() {
	return Object.keys(questionnaire.question_types).length;
}

function questionnaire_get_question_type(question) {
	if (question == undefined) {
		false;
	} else {
		return ($(question).closest(questionnaire.question.selector)).attr(questionnaire.question_type.attribute_name);
	}
}

function questionnaire_get_question_prototype() {
	return $(questionnaire.question.prototype_selector);
}

function questionnaire_get_heading_and_description_prototype() {
	return $(questionnaire.heading_and_description.prototype_selector);
}

function questionnaire_get_question_type_prototype(question_type) {
	if (question_type == undefined) {
		return false;
	} else {
		return $(questionnaire.question_type.prototypes_selector).children('.question-type-' + question_type);
	}
}

function questionnaire_get_operations_toolbar() {
	return $(questionnaire.operations_toolbar.selector);
}

function questionnaire_get_question_type_div(question) {
	if (question == undefined) {
		return false;
	} else {
		return $(question).children('.panel-body').children('div[class*="question-type-"]');
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
			if (question_type == questionnaire.question_types[question_type_identifier].name) {
				return true;
			}
		}

		return false;
	}
}

function questionnaire_change_question_type(question, new_question_type) {
	//var question_number = $(question).index();

	var current_question_type = questionnaire_get_question_type(question);

	if (!questionnaire_is_question_type_valid(new_question_type)) {
		// Cannot change to an invalid question type
		return false;
	} else if (current_question_type === new_question_type) {
		// Change to the same question type => no change really needed
		return false;
	} else {
		var new_question_type_div = $('#questionnaire-question-types > .question-type-' + new_question_type).clone(true, true);
		var old_question_type_div = $(question).children('.panel-body').children('div[class*="question-type-"]');

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

		section.addClass('animate-margin-top');
		section.css({'z-index': '0', 'margin-top': '-=' + section_height + 'px'});

		section.siblings('.panel').each(function(sibling_index, sibling_section) {
			var sibling_section_z_index = questionnaire_get_section_z_index(sibling_section);

			if (sibling_section_z_index > section_z_index) {
				$(sibling_section).css('z-index', '-=1');

				/*
				if ($(section).index() > $(sibling_section).index()) {
					$(sibling_section).css('top', '-=' + section_height + 'px');
				}
				*/
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
		var duplicated_section = $(section).clone(false);

		duplicated_section.css('z-index', '+=1');

		$(duplicated_section).removeClass('animate-top');
		$(duplicated_section).css('top', '-=' + $(section).outerHeight(true) + 'px');

		// Insert the duplicated section just after the original one in the DOM
		section.after(duplicated_section);

		$(duplicated_section).addClass('animate-top');
		$(duplicated_section).css('top', '+=' + $(section).outerHeight(true) + 'px');

		// Increase z-index by 1 for all sections positioned after the duplicated section
		$(duplicated_section).nextAll('.panel').css('z-index', '+=1');

		return duplicated_section;
	}
}

function questionnaire_get_header() {
	return $(questionnaire.selector).children('header');
}

function questionnaire_get_footer() {
	return $(questionnaire.selector).children('footer');
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
	return $(questionnaire.selector).children('.panel');
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
	return $(questionnaire.selector).children('.panel[style*="z-index: ' + section_number + '"]');
}

function questionnaire_get_question_number(question) {
	if (question == undefined) {
		return null;
	} else {
		var question_z_index = questionnaire_get_section_z_index(question);
		var question_counter = 0;
		var sections_array = questionnaire_get_sections_array();

		for (var i = 0; i < sections_array.length; i++) {
			if (questionnaire_get_section_z_index(sections_array[i]) === question_z_index) {
				// Stop counting and return counter value
				if ($(sections_array[i]).hasClass('question')) {
					return ++question_counter;
				} else {
					return question_counter;
				}
			} else {
				if ($(sections_array[i]).hasClass('question')) {
					// Increase the counter by one and continue
					question_counter++;
				}
			}
		}
	}
}

function questionnaire_get_section_z_index(section) {
	return Number($(section).css('z-index'));
}

function questionnaire_get_section_position(section) {
	return Number($(section).index());
}

function questionnaire_are_questions_of_type_single_choice_radio_buttons_and_multiple_choice_checkboxes(question_a, question_b) {
	var is_valid_question_type = function(question_type) {
		if (question_type === questionnaire.question_types.single_choice_radio_buttons.name || question_type === questionnaire.question_types.multiple_choice_checkboxes.name) {
			return true;
		} else {
			return false;
		}
	};

	return is_valid_question_type(questionnaire_get_question_type(question_a)) === true && is_valid_question_type(questionnaire_get_question_type(question_b)) === true;
}

function update_single_multiple_choice_input_ids(section, direction) {
	if (questionnaire_get_question_type(section) === questionnaire.question_types.single_choice_radio_buttons.name) {
		questionnaire_get_question_answer_alternatives_list(section).each(function(index, alternative) {
			$(alternative).children('input[type="radio"]').attr({
				'id': questionnaire_produce_single_multiple_choice_alternative_name(questionnaire_get_question_number(section) + direction, index + 1),
				'name': questionnaire_produce_single_multiple_choice_alternative_name(questionnaire_get_question_number(section) + direction)
			});
		});
	} else if (questionnaire_get_question_type(section) === questionnaire.question_types.multiple_choice_checkboxes.name) {
		questionnaire_get_question_answer_alternatives_list(section).each(function(index, alternative) {
			$(alternative).children('input[type="checkbox"]').attr({
				'id': questionnaire_produce_single_multiple_choice_alternative_name(questionnaire_get_question_number(section) + direction, index + 1),
			});
		});
	}
}

function questionnaire_move_section(section, direction) {
	var section_position = questionnaire_get_section_position(section);
	var total_number_of_sections = questionnaire_get_sections().length;
	var sibling_section = null;

	if (direction === -1 && section_position > 1) {
		sibling_section = questionnaire_get_section(section_position - 1);

		$(sibling_section).before(section);

		section.removeClass('animate-top');
		sibling_section.removeClass('animate-top');

		section.css({'top': '+=' + sibling_section.outerHeight(true) + 'px', 'z-index': '-=1'});
		sibling_section.css({'top': '-=' + section.outerHeight(true) + 'px', 'z-index': '+=1'});

		section.addClass('animate-top');
		sibling_section.addClass('animate-top');

		section.css('top', '-=' + sibling_section.outerHeight(true) + 'px');
		sibling_section.css('top', '+=' + section.outerHeight(true) + 'px');

		/*
		if (questionnaire_are_questions_of_type_single_choice_radio_buttons_and_multiple_choice_checkboxes(section, sibling_section)) {
			update_single_multiple_choice_input_ids(section, -1);
			update_single_multiple_choice_input_ids(sibling_section, 1);
		}
		*/

		return true;

	} else if (direction === 1 && section_position < total_number_of_sections) {
		sibling_section = questionnaire_get_section(section_position + 1);

		$(sibling_section).after(section);

		section.removeClass('animate-top');
		sibling_section.removeClass('animate-top');

		section.css({'top': '-=' + sibling_section.outerHeight(true) + 'px', 'z-index': '+=1'});
		sibling_section.css({'top': '+=' + section.outerHeight(true) + 'px', 'z-index': '-=1'});

		section.addClass('animate-top');
		sibling_section.addClass('animate-top');

		section.css('top', '+=' + sibling_section.outerHeight(true) + 'px');
		sibling_section.css('top', '-=' + section.outerHeight(true) + 'px');

		/*
		if (questionnaire_are_questions_of_type_single_choice_radio_buttons_and_multiple_choice_checkboxes(section, sibling_section)) {
			alert(questionnaire_get_question_number(section));

			update_single_multiple_choice_input_ids(section, 1);
			update_single_multiple_choice_input_ids(sibling_section, -1);
		}
		*/

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

function questionnaire_get_questions(question_type_filter) {
	if (question_type_filter === undefined) {
		return $(questionnaire.selector).children(questionnaire.question.selector);
	} else {
		var filtered_questions = $(questionnaire.selector).children(questionnaire.question.selector).children('.panel-body').children('.question-type-' + question_type_filter);
		return filtered_questions.parent('.panel-body').parent(questionnaire.question.selector);
	}
}

function questionnaire_get_mandatory_questions(question_type_filter) {
	var filtered_questions = questionnaire_get_questions(question_type_filter);

	var mandatory_filtered_questions = filtered_questions.find('.questionnaire-mandatory-question-label > input[type="checkbox"]:checked').closest(questionnaire.question.selector);

	return mandatory_filtered_questions;
}

function questionnaire_get_heading_and_descriptions() {
	return $(questionnaire.selector).children(questionnaire.heading_and_description.selector);
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
		question_type = questionnaire.question_type.default_type;
	}

	if (!questionnaire_is_question_type_valid(question_type)) {
		return false;
	} else {
		return questionnaire_add_section(questionnaire_get_question_prototype(), function(cloned_question_div) {
			questionnaire_change_question_type(cloned_question_div, question_type);
		});
	}
}

function questionnaire_add_heading_and_description() {
	return questionnaire_add_section(questionnaire_get_heading_and_description_prototype());
}

function questionnaire_update_section_z_indexes() {
	var sections = questionnaire_get_sections_array(questionnaire.default_section_sort_function);

	for (var i = 0; i < sections.length; i++) {
		$(sections[i]).css('z-index', i + 1);
	}
}

function questionnaire_preview() {
	$(questionnaire.selector).toggleClass('is-previewing');

	if ($(questionnaire.selector).hasClass('is-previewing')) {
		// Preview mode ON
		return questionnaire_preview_questionnaire(true);
	} else {
		// Preview mode OFF
		questionnaire_remove_all_question_validation_errors();
		return questionnaire_preview_questionnaire(false);
	}
}

function questionnaire_clear() {
	// Clear the questionnaire
	questionnaire_get_sections().remove();
	questionnaire_set_title(questionnaire.title.default_text);
	questionnaire_set_description(questionnaire.description.default_text);

	return true;
}

function questionnaire_save(new_questionnaire) {
	console.log("saving...");

	if (typeof(Storage) !== "undefined") {
		var saved_questionnaires = questionnaire_get_saved_questionnaires();
		console.log(saved_questionnaires);

		if (questionnaire_is_already_saved(saved_questionnaires, new_questionnaire)) {
			alert("questionnaire '" + new_questionnaire + "' is already saved!");
		} else {
			saved_questionnaires.push(new_questionnaire);
			localStorage.setItem('questionnaires', JSON.stringify(saved_questionnaires));
		}
	}
}

function questionnaire_is_already_saved(saved_questionnaires, questionnaire) {
	if (saved_questionnaires == undefined) {
		return false;
	} else {
		for (var i = 0; i < saved_questionnaires.length; i++) {
			if (saved_questionnaires[i].name === questionnaire.name) {
				return true;
			}
		}

		return false;
	}
}

function questionnaire_get_saved_questionnaires() {
	if (typeof(Storage) !== "undefined") {
		var saved_questionnaires = JSON.parse(localStorage.getItem('questionnaires'));
		return saved_questionnaires == undefined ? [] : saved_questionnaires;
	}
}

function questionnaire_on_save(response) {
	alert("Formulär sparat!");
}

function questionnaire_load(selected_questionnaire) {
	var saved_questionnaires = questionnaire_get_saved_questionnaires();

	for (var i = 0; i < saved_questionnaires.length; i++) {
		if (saved_questionnaires[i].name === selected_questionnaire) {
			var saved_html = saved_questionnaires[i].html;
			$(questionnaire.selector).html(saved_html);
			break;
		}
	}
}

function questionnaire_on_load(response) {
	$(questionnaire.selector).html(response);
	alert("Formulär laddat!");
}

function questionnaire_toggle_ranked_choice_alternatives_display_mode(ranked_choice, ranked_choice_type, new_choice_type_alternatives_positions) {
	ranked_choice_get_alternatives_list(ranked_choice).children('li').each(function(index, alternative) {
		ranked_choice_set_alternative_position(ranked_choice, $(alternative), new_choice_type_alternatives_positions);

		if (index === 0) {
			if (ranked_choice_type === ranked_choice_types.type_a.name || ranked_choice_type === ranked_choice_types.type_b.name) {
				$(alternative).css('display', 'none');
			} else if (ranked_choice_type === ranked_choice_types.type_c.name) {
				$(alternative).css('display', '');
			}
		} else {
			if (ranked_choice_type === ranked_choice_types.type_a.name || ranked_choice_type === ranked_choice_types.type_b.name) {
				$(alternative).css('display', '');
			} else if (ranked_choice_type === ranked_choice_types.type_c.name) {
				$(alternative).css('display', 'none');
			}
		}
	});
}

function questionnaire_change_ranked_choice_type(ranked_choice, new_choice_type) {
	var ranked_choice_scale_list = ranked_choice.siblings('.ranked-choice-scale-text-list');
	var ranked_choice_slider_bar = ranked_choice_get_slider_bar(ranked_choice);
	var new_ranked_choice_type = undefined;

	if (new_choice_type === ranked_choice_types.type_a.name) {
		new_ranked_choice_type = ranked_choice_types.type_a;
		$('.ranked-choice-add-alternative-button').prop('disabled', false);
	} else if (new_choice_type === ranked_choice_types.type_b.name) {
		new_ranked_choice_type = ranked_choice_types.type_b;
		$('.ranked-choice-add-alternative-button').prop('disabled', false);
	} else if (new_choice_type === ranked_choice_types.type_c.name) {
		new_ranked_choice_type = ranked_choice_types.type_c;
		$('.ranked-choice-add-alternative-button').prop('disabled', true);
	}

/*
	if (new_choice_type === ranked_choice_types.type_a.name) {
		ranked_choice.removeClass(ranked_choice_types.type_b.classname);
		ranked_choice.removeClass(ranked_choice_types.type_c.classname);
		ranked_choice.addClass(ranked_choice_types.type_a.classname);

		ranked_choice_set_slider_bar_update_function_callback(ranked_choice, ranked_choice_types.type_a.update_function_callback);

		new_choice_type_slider_bar_steps = ranked_choice_types.type_a.slider_bar_steps;
		new_choice_type_alternatives_positions = ranked_choice_types.type_a.alternatives_initial_position;
		new_scale_text = ranked_choice_types.type_a.scale_text;

		$('.ranked-choice-add-alternative-button').prop('disabled', false);
		scale_list.css('visibility', 'visible');

	} else if (new_choice_type === ranked_choice_types.type_b.name) {
		ranked_choice.removeClass(ranked_choice_types.type_a.classname);
		ranked_choice.removeClass(ranked_choice_types.type_c.classname);
		ranked_choice.addClass(ranked_choice_types.type_b.classname);

		ranked_choice_set_slider_bar_update_function_callback(ranked_choice, ranked_choice_types.type_b.update_function_callback);

		new_choice_type_slider_bar_steps = ranked_choice_types.type_b.slider_bar_steps;
		new_choice_type_alternatives_positions = ranked_choice_types.type_b.alternatives_initial_position;
		new_scale_text = ranked_choice_types.type_b.scale_text;

		$('.ranked-choice-add-alternative-button').prop('disabled', false);
		scale_list.css('visibility', 'hidden');

	} else if (new_choice_type === ranked_choice_types.type_c.name) {
		ranked_choice.removeClass(ranked_choice_types.type_a.classname);
		ranked_choice.removeClass(ranked_choice_types.type_b.classname);
		ranked_choice.addClass(ranked_choice_types.type_c.classname);

		ranked_choice_set_slider_bar_update_function_callback(ranked_choice, ranked_choice_types.type_c.update_function_callback);

		new_choice_type_slider_bar_steps = ranked_choice_types.type_c.slider_bar_steps;
		new_choice_type_alternatives_positions = ranked_choice_types.type_c.alternatives_initial_position;
		new_scale_text = ranked_choice_types.type_c.scale_text;

		$('.ranked-choice-add-alternative-button').prop('disabled', true);
		scale_list.css('visibility', 'visible');
	}
*/
	for (var ranked_choice_type in ranked_choice_types) {
		ranked_choice.removeClass(ranked_choice_types[ranked_choice_type].classname);
	}

	ranked_choice.addClass(new_ranked_choice_type.classname);
	ranked_choice_slider_bar.css({'padding-left': '', 'padding-right': ''});
	ranked_choice_set_slider_bar_steps(ranked_choice, new_ranked_choice_type.slider_bar_steps);
	questionnaire_toggle_ranked_choice_alternatives_display_mode(ranked_choice, new_choice_type, new_ranked_choice_type.alternatives_initial_position);
	ranked_choice_update_alternatives_positions(ranked_choice);
	ranked_choice_set_slider_bar_update_function_callback(ranked_choice, new_ranked_choice_type.function_callback);

	// Update ranked choice scale text
	for (var i = 0; i < new_ranked_choice_type.scale_text.length; i++) {
		ranked_choice_scale_list.children('li:nth-child(' + (i+1) + ')').children('span').text(new_ranked_choice_type.scale_text[i]);
	}
}