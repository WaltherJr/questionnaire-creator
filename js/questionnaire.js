"use strict";

var questionnaire = {
	selector: '#questionnaire',
	storage_key: 'questionnaires',

	popovers: {
		invalid_value: {
			content: '<p><b>Observera!</b> Du måste fylla i detta fält korrekt för att fortsätta.</p>',
			placement: 'top',
			title: 'Ogiltigt värde',
			trigger: 'manual',
			html: true
		},
		invalid_question: {
			content: 'Du måste ge ett giltigt svar på frågan.',
			placement: 'top',
			title: 'Ogiltigt svar',
			trigger: 'manual',
			html: true
		}
	},

	modal_dialogs: {
		add_image: {
			selector: '#questionnaire-add-image-modal-dialog',

			image_url: {
				selector: '#questionnaire-add-image-modal-dialog #add-image-modal-image-url',
				placeholder_text: 'http://www.exempel.se/bild.jpg',

				get: function() {
					return $('#questionnaire-add-image-modal-dialog #add-image-modal-image-url').val();
				},
				set: function(image_url) {
					return $('#questionnaire-add-image-modal-dialog #add-image-modal-image-url').val(image_url);
				}
			}
		},

		add_hyperlink: {
			selector: '#questionnaire-add-hyperlink-modal-dialog',

			hyperlink_url: {
				selector: '#questionnaire-add-hyperlink-modal-dialog #add-hyperlink-modal-hyperlink-url',
				placeholder_text: 'http://www.exempel.se',

				get: function() {
					return $('#questionnaire-add-hyperlink-modal-dialog #add-hyperlink-modal-hyperlink-url').val();
				},
				set: function(hyperlink_url) {
					return $('#questionnaire-add-hyperlink-modal-dialog #add-hyperlink-modal-hyperlink-url').val(hyperlink_url);
				}
			}
		},

		add_email_link: {
			selector: '#questionnaire-add-email-link-modal-dialog',

			email_address: {
				selector: '#questionnaire-add-email-link-modal-dialog #add-email-link-modal-email-address',
				placeholder_text: 'någon.person@exempel.se',

				get: function() {
					return $('#questionnaire-add-email-link-modal-dialog #add-email-link-modal-email-address').val();
				},
				set: function(email_address) {
					return $('#questionnaire-add-email-link-modal-dialog #add-email-link-modal-email-address').val(email_address);
				}
			}
		},

		save_questionnaire: {
			selector: '#questionnaire-save-modal-dialog',

			questionnaire_name: {
				selector: '#questionnaire-save-modal-dialog #txt-questionnaire-name',

				get: function() {
					return $('#questionnaire-save-modal-dialog #txt-questionnaire-name').val();
				},
				set: function(questionnaire_name) {
					return $('#questionnaire-save-modal-dialog #txt-questionnaire-name').val(questionnaire_name);
				}
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
		},

		questionnaire_submitted: {
			selector: '#questionnaire-questionnaire-submitted-modal-dialog'
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

			get_selected_alternative: function(question_div) {
				var list = $(question_div).find('.select-list');
				return select_list_get_selected_alternatives(list);
			},
			get_selected_alternative_text: function(question_div) {
				var list = $(question_div).find('.select-list');
				var selected_alternative = select_list_get_selected_alternatives(list);
				return selected_alternative.length !== 0 ? select_list_get_alternative_text(selected_alternative[0]) : '';
			},
			validation: function(question_div) {
				var alternatives_list = select_list_get_alternatives_list(question_div);

				if (alternatives_list.children('li.select-list-alternative-selected').length > 0) {
					return true;
				} else {
					$(question_div).find('.select-list').popover(questionnaire.popovers.invalid_value).popover('show');
					return false;
				}
			}
		},
		single_choice_radio_buttons: {
			name: 'single-choice-radio-buttons',
			add_alternative_label: {
				selector: '.single-choice-add-alternative'
			},

			get_selected_alternatives_text: function(question_div) {
				return $(question_div).find('.question-answer-alternatives input[type="radio"]:checked').siblings('label').text();
			},
			validation: function(question_div) {
				var alternatives_list = questionnaire_get_question_answer_alternatives_list(question_div);

				if (alternatives_list.find('input[type="radio"]:checked').length === 1) {
					return true;
				} else {
					$(question_div).find('.question-answer-alternatives').popover(questionnaire.popovers.invalid_value).popover('show');
					return false;
				}
			}
		},
		multiple_choice_list: {
			name: 'multiple-choice-list',

			get_selected_alternatives: function(question_div) {
				var list = $(question_div).find('.select-list');
				return select_list_get_selected_alternatives(list);
			},
			get_selected_alternatives_text: function(question_div) {
				var list = $(question_div).find('.select-list');
				var selected_alternatives = select_list_get_selected_alternatives(list);
				var alternative_texts = [];

				selected_alternatives.each(function(index, alternative) {
					alternative_texts.push(select_list_get_alternative_text(alternative));
				});

				return alternative_texts;
			},
			validation: function(question_div) {
				var alternatives_list = select_list_get_alternatives_list(question_div);

				if (alternatives_list.children('li.select-list-alternative-selected').length > 0) {
					return true;
				} else {
					$(question_div).find('.select-list').popover(questionnaire.popovers.invalid_value).popover('show');
					return false;
				}}
		},
		multiple_choice_checkboxes: {
			name: 'multiple-choice-checkboxes',
			add_alternative_label: {
				selector: '.multiple-choice-add-alternative'
			},

			get_selected_alternatives_text: function(question_div) {
				var selected_alternatives = $(question_div).find('.question-answer-alternatives input[type="checkbox"]:checked');
				var selected_alternatives_text = [];

				selected_alternatives.each(function(index, alternative) {
					selected_alternatives_text.push($(alternative).siblings('label').text());
				});

				return selected_alternatives_text;
			},
			validation: function(question_div) {
				var alternatives_list = questionnaire_get_question_answer_alternatives_list(question_div);
				return alternatives_list.find('input[type="checkbox"]:checked').length > 0;
			},
			display_validation_error: function(question_div) {
				$(question_div).find('.question-answer-alternatives').popover(questionnaire.popovers.invalid_value).popover('show');
			},
			clear_validation_error: function(question_div) {
				$(question_div).find('.question-answer-alternatives').popover('destroy');
			}
		},
		ranked_choice: {
			name: 'ranked-choice',

			validation: function() {
				// Not yet implemented
				return true;
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
		},
		footer_toolbar: {
			selector: '.section-footer-toolbar'
		}
	},

	question: {
		selector: '.question',
		prototype_selector: '.question[style*="display: none"]',
		question_types_list: {
			selector: '.questionnaire-question-types-list'
		},
		mandatory_question_label: {
			selector: '.mandatory-question-label'
		},
		mandatory_question_checkbox: {
			selector: '.mandatory-question-checkbox'
		},
		invalid_question: {
			classname: 'question-invalid'
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
			ranked_choice_types.type_a.update_ranking_text(ranked_choice_alternatives_list, $(ranked_choice_slider_bar).closest('.question-type-ranked-choice'));
		},
		update_ranking_text: function(alternatives_list, ranked_choice_question_type_div) {
        	var alternatives_array = $(alternatives_list).children('li:not(:first-child)').toArray();
        	var order_description = '';
        	var total_alternatives_difference = 0;

        	if (alternatives_array.length > 1) {
        		alternatives_array.sort(function(a, b) {
        			return ranked_choice_get_alternative_position($(b)) - ranked_choice_get_alternative_position($(a));
        		});
        	}

        	for (var i = 0; i < alternatives_array.length; i++) {
        		var alternative_text = $(alternatives_array[i]).find('.ranked-choice-alternative-text').text();
        		var next_alternative = $(alternatives_array[i+1]);

        		order_description += alternative_text;

        		if ((i+1) < alternatives_array.length) {
	        		var alternative_position = ranked_choice_get_alternative_position($(alternatives_array[i]));
	        		var previous_alternative_position = ranked_choice_get_alternative_position($(alternatives_array[i+1]));
	        		var alternatives_position_diff = alternative_position - previous_alternative_position;
	        		total_alternatives_difference += Math.abs(alternatives_position_diff);

	        		if (alternatives_position_diff !== 0) {
	        			order_description += (' <b>' + ranked_choice_types.type_a.ranking_scale_text[Math.abs(alternatives_position_diff)] + '</b> ');
	        		} else {
	        			order_description += ', ';
	        		}
	        	}
        	}

        	if (total_alternatives_difference === 0) {
        		order_description += ' <b>är lika bra</b>';
        	}

        	ranked_choice_question_type_div.find('.ranked-choice-order-description').html(order_description);
        },
		ranking_scale_text: [
        	'är lika bra',
        	'är något bättre än',
        	'är bättre än',
        	'är markant bättre än',
        	'är mycket bättre än',
        	'är väldigt mycket bättre än',
        	'är extremt mycket bättre än',
        	'är extremt mycket bättre (+) än',
        	'är extremt mycket bättre (++) än',
        	'är extremt mycket bättre (+++) än',
        	'är extremt mycket bättre (++++) än',
        	'är extremt mycket bättre (+++++) än',
        	'är extremt mycket bättre (++++++) än',
        	'är extremt mycket bättre (+++++++) än',
        	'är extremt mycket bättre (++++++++) än',
        ],
		get_alternatives_positions: function(ranked_choice) {
			var alternatives = ranked_choice_get_alternatives(ranked_choice);
			var positions = [];

			alternatives.each(function(index, alternative) {
				// Skip arrow
				if (index !== 0) {
					positions.push({
						text: $(alternative).find('.ranked-choice-alternative-text').text(),
						position: Number($(alternative).attr('data-alternative-position')) - Math.ceil(ranked_choice_types.type_a.slider_bar_steps/2)
					});
				}
			});

			return positions;
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

            $(ranked_choice_slider_bar).css({'padding-left': '0%', 'padding-right': Math.round((15-ranges.right)/14*100) + '%'});
            ranked_choice_types.type_b.update_ranking_text(ranked_choice_alternatives_list, $(ranked_choice_slider_bar).closest('.question-type-ranked-choice'));
        },
        update_ranking_text: function(alternatives_list, ranked_choice_question_type_div) {
        	var alternatives_array = $(alternatives_list).children('li:not(:first-child)').toArray();
        	var order_description = '';
        	var total_alternatives_difference = 0;

        	if (alternatives_array.length > 1) {
        		alternatives_array.sort(function(a, b) {
        			return ranked_choice_get_alternative_position($(b)) - ranked_choice_get_alternative_position($(a));
        		});
        	}

        	for (var i = 0; i < alternatives_array.length; i++) {
        		var alternative_text = $(alternatives_array[i]).find('.ranked-choice-alternative-text').text();
        		var next_alternative = $(alternatives_array[i+1]);

        		order_description += alternative_text;

        		if ((i+1) < alternatives_array.length) {
	        		var alternative_position = ranked_choice_get_alternative_position($(alternatives_array[i]));
	        		var previous_alternative_position = ranked_choice_get_alternative_position($(alternatives_array[i+1]));
	        		var alternatives_position_diff = alternative_position - previous_alternative_position;
	        		total_alternatives_difference += Math.abs(alternatives_position_diff);

	        		if (alternatives_position_diff !== 0) {
	        			order_description += (' <b>' + ranked_choice_types.type_b.ranking_scale_text[alternatives_position_diff] + '</b> ');
	        		} else {
	        			order_description += ', ';
	        		}
	        	}
        	}

        	if (total_alternatives_difference === 0) {
        		order_description += ' <b>är lika bra</b>';
        	}

        	ranked_choice_question_type_div.find('.ranked-choice-order-description').html(order_description);
        },
        ranking_scale_text: [
        	'är lika bra',
        	'är något viktigare än',
        	'är viktigare än',
        	'är markant viktigare än',
        	'är mycket viktigare än',
        	'är väldigt mycket viktigare än',
        	'är extremt mycket viktigare än',
        	'är extremt mycket viktigare (+) än',
        	'är extremt mycket viktigare (++) än',
        	'är extremt mycket viktigare (+++) än',
        	'är extremt mycket viktigare (++++) än',
        	'är extremt mycket viktigare (+++++) än',
        	'är extremt mycket viktigare (++++++) än',
        	'är extremt mycket viktigare (+++++++) än',
        	'är extremt mycket viktigare (++++++++) än',
        ],
		get_alternatives_positions: function(ranked_choice) {
			var alternatives = ranked_choice_get_alternatives(ranked_choice);
			var positions = [];

			alternatives.each(function(index, alternative) {
				// Skip arrow
				if (index !== 0) {
					positions.push({
						text: $(alternative).find('.ranked-choice-alternative-text').text(),
						position: Number($(alternative).attr('data-alternative-position'))
					});
				}
			});

			return positions;
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
            var ranked_choice = $(ranked_choice_slider_bar).closest('.ranked-choice');

            $(ranked_choice_slider_bar).css({'padding-left':  padding_left + '%', 'padding-right': padding_right + '%'});
            ranked_choice_types.type_c.update_ranking_text(arrow_alternative_position, $(ranked_choice_slider_bar).closest('.question-type-ranked-choice'));
        },
        update_ranking_text: function(arrow_alternative_position, ranked_choice_question_type_div) {
            var alternative_position_diff = arrow_alternative_position - ranked_choice_types.type_c.alternatives_initial_position;
			var alternative_a = ranked_choice_question_type_div.find('.ranked-choice-scale-text-list').children('li:first-child').children('span').text();
          	var alternative_b = ranked_choice_question_type_div.find('.ranked-choice-scale-text-list').children('li:last-child').children('span').text();
            var description_first_alternative = alternative_position_diff >= 0 ? alternative_b : alternative_a;
            var description_second_alternative = alternative_position_diff >= 0 ? alternative_a : alternative_b;
            var scale_text_index = Math.abs(alternative_position_diff);
            var order_description = description_first_alternative + ' <b>' + ranked_choice_types.type_c.ranking_scale_text[Math.abs(alternative_position_diff)] + '</b> ' + description_second_alternative;

            ranked_choice_question_type_div.find('.ranked-choice-order-description').html(order_description);
        },
        ranking_scale_text: [
        	'är lika viktigt som',
        	'är något viktigare än',
        	'är viktigare än',
        	'är markant viktigare än',
        	'är mycket viktigare än',
        	'är extremt mycket viktigare än'
        ],
        get_alternatives_positions: function(ranked_choice) {
			var arrow_alternative = ranked_choice_get_alternatives(ranked_choice).first();
			return {
				text: $(arrow_alternative).find('.ranked-choice-alternative-text').text(),
				position: Number($(arrow_alternative).attr('data-alternative-position')) - Math.ceil(ranked_choice_types.type_c.slider_bar_steps/2)
			};
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

	popover_settings.title = 'Platshållar-text';
	popover_settings.content = 'Platshållar-texten är den text som finns inledningsvis i textrutan, men som försvinner när textrutan fylls med text.';

	$('#text-input-pane-placeholder-text').popover(popover_settings);

	popover_settings.title = 'Bild-adress';
	popover_settings.content = 'Bild-adressen är den länktext som fås genom att högerklicka på en bild och sedan välja "Kopiera bildadress" från menyn som poppar upp.';
	$('#image-pane-image-url').popover(popover_settings);

	popover_settings.title = 'Rankat val-typ';
	popover_settings.html = true;
	popover_settings.content = '\
	<dl class="ranked-choice-type-definition-list">\
  		<dt>Typ A</dt>\
  		<dd>Inbördes ranking av <b>flera</b> alternativ, där rankingskalan går från negativ <span class="red bold">(röd)</span> till positiv <span class="green bold">(grön)</span>.</dd>\
  		<dt>Typ B</dt>\
  		<dd>Inbördes ranking av <b>flera</b> alternativ, där rankingskalan är neutral <span class="blue bold">(blå)</span>.</dd>\
  		<dt>Typ C</dt>\
  		<dd>Inbördes ranking av endast <b>två</b> alternativ, där rankingskalan går från negativ <span class="red bold">(röd)</span> till positiv <span class="green bold">(grön)</span>.</dd>\
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
	$(questionnaire.modal_dialogs.add_image.image_url.selector).attr('placeholder', questionnaire.modal_dialogs.add_image.image_url.placeholder_text);
	$(questionnaire.modal_dialogs.add_hyperlink.hyperlink_url.selector).attr('placeholder', questionnaire.modal_dialogs.add_hyperlink.hyperlink_url.placeholder_text);
	$(questionnaire.modal_dialogs.add_email_link.email_address.selector).attr('placeholder', questionnaire.modal_dialogs.add_email_link.email_address.placeholder_text);

	$(questionnaire.modal_dialogs.add_image.selector).on('shown.bs.modal', function() {
    	$(questionnaire.modal_dialogs.add_image.image_url.selector).select();
	});

	$(questionnaire.modal_dialogs.add_hyperlink.selector).on('shown.bs.modal', function() {
    	$(questionnaire.modal_dialogs.add_hyperlink.hyperlink_url.selector).select();
	});

	$(questionnaire.modal_dialogs.add_email_link.selector).on('shown.bs.modal', function() {
    	$(questionnaire.modal_dialogs.add_email_link.email_address.selector).select();
	});

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
	$('#questionnaire-context-toolbar').css('top', 'calc(100% - ' + $('#questionnaire-context-toolbar').outerHeight() + 'px)');
}

function questionnaire_hide_context_toolbar_panes() {
	$('#questionnaire-context-toolbar').children('div').css('display', 'none');
	$('#questionnaire-context-toolbar').css('top', '100%');
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

function questionnaire_init_contenteditable_paste_filter() {
	$(document).on('paste', '[contenteditable="true"]', function(event) {
		event.preventDefault();
	    var text = undefined;

	    if (window.clipboardData) {
	    	text = window.clipboardData.getData("Text");
	    } else {
			text = event.originalEvent.clipboardData.getData("text/plain");
	    	document.execCommand("insertText", false, text);
	    }
	});
}

function questionnaire_init_active_section_event_listeners() {
	$(document).on('blur', '.panel', function(event) {
		questionnaire_set_active_section(undefined);
	});

	$(document).on('focus', '.panel', function(event) {
		questionnaire_set_active_section($(this));
	});
}

$(document).ready(function() {
	questionnaire_activate_main_toolbar_tooltips();
	questionnaire_init_modal_dialogs();
	questionnaire_set_links_click_behaviour(false);
	questionnaire_init_popover_guides();
	questionnaire_init_contenteditable_paste_filter();
	questionnaire_init_active_section_event_listeners();

	/*
	$(document).on('click', questionnaire.operations_toolbar.selector + ' button', function() {
		$(this).blur();
	});
	*/

	$('#questionnaire-context-toolbar').children('div').css('display', 'none');

	// Fix bug "change question type menu being under next section"
	$(document).on('focusin', '.questionnaire-question-types-dropdown', function() {
		$(this).closest('.panel').css('z-index', '');
	}).on('focusout', '.questionnaire-question-types-dropdown', function() {
		var panel = $(this).closest('.panel');
		panel.css('z-index', questionnaire_get_section_position(panel));
	});

	// Fix bug "select list under section"
	$(document).on('focusin', '.select-list', function(event) {
		if ($(event.relatedTarget).closest('.select-list').length !== 1) {
			$(this).closest('.panel').css('z-index', '');
		}
	}).on('focusout', '.select-list', function(event) {
		if ($(event.relatedTarget).closest('.select-list').length !== 1) {
			var panel = $(this).closest('.panel');
			panel.css('z-index', questionnaire_get_section_position(panel));
		}
	});

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

	$('#hyperlink-pane-link-url').on('change', function() {
		var associated_link = $(this).data('link');

		if (associated_link != undefined) {
			if (associated_link.attr('href') !== $(this).val()) {
				// Change link URL
				associated_link.attr('href', $(this).val());
			}
		}
	});

	$('#hyperlink-pane-link-text, #email-link-pane-link-text').on('input', function() {
		var associated_link = $(this).data('link');

		if (associated_link != undefined) {
			associated_link.text($(this).val());
		}
	});

	$('#email-link-pane-email-address').on('change', function() {
		var associated_link = $(this).data('link');

		if (associated_link != undefined) {
			associated_link.attr('href', 'mailto:' + $(this).val());
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
			if (event_target.closest('.questionnaire-question-types-list').length === 1) {
				return;
			} else if (event_target.hasClass('ranked-choice-add-alternative') || event_target.hasClass('select-list-add-alternative')) {
				return;
			} else {
				var link_href = event_target.attr('href');
				var mailto_str = 'mailto:';

				if (link_href != undefined && link_href.startsWith(mailto_str)) {
					var email = link_href.substring(mailto_str.length);

					questionnaire_show_context_toolbar_pane('#questionnaire-context-toolbar-email-link-pane');
					$('#questionnaire-context-toolbar-email-link-pane').find('#email-link-pane-email-address, #email-link-pane-link-text').data('link', event_target);
					$('#questionnaire-context-toolbar-email-link-pane').find('#email-link-pane-email-address').val(email);
					$('#questionnaire-context-toolbar-email-link-pane').find('#email-link-pane-link-text').val(event_target.text());
				} else {
					questionnaire_show_context_toolbar_pane('#questionnaire-context-toolbar-hyperlink-pane');
					$('#questionnaire-context-toolbar-hyperlink-pane').find('#link-pane-hyperlink-url, #link-pane-hyperlink-text').data('link', event_target);
					$('#questionnaire-context-toolbar-hyperlink-pane').find('#link-pane-hyperlink-url').val(link_href);
					$('#questionnaire-context-toolbar-hyperlink-pane').find('#link-pane-hyperlink-text').val(event_target.text());
				}
			}
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
	$('.ranked-choice-scale-text-list').before(ranked_choice);

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

	$(document).on('click', '.ranked-choice-add-alternative', function(event) {
		event.preventDefault();

		var ranked_choice = $(this).closest('.question-type-ranked-choice').children('.ranked-choice');
		var ranked_choice_type = questionnaire_get_ranked_choice_type_from_ranked_choice_ctrl(ranked_choice);

		ranked_choice_add_alternative(ranked_choice, ranked_choice_type.alternatives_initial_position, 'Alternativ');
	});

	var single_choice_list = $(select_list_create_new(true, false)).addClass('question-type-validation-field');
	var multiple_choice_list = $(select_list_create_new(true, true)).addClass('question-type-validation-field');

	$('.question-type-single-choice-list').append(single_choice_list);
	$('.question-type-multiple-choice-list').append(multiple_choice_list);

	$('.ranked-choice-type-select-list').change(function() {
		 questionnaire_change_ranked_choice_type($(this)
		 	.closest('.question-type-ranked-choice')
		 	.children('.ranked-choice'), $(this).val());
	});

	$('#questionnaire-submit-button').on('click', function() {
		questionnaire_submit();
	});

	$('.questionnaire-load-modal-dialog-remove-questionnaire-button').on('click', function() {
		var selected_questionnaire = questionnaire.modal_dialogs.load_questionnaire.get_selected_questionnaire();
		var saved_questionnaires = questionnaire_get_saved_questionnaires();
		var options_list = $('#questionnaire-load-modal-dialog-questionnaires-list');
		var options = options_list.children('option');

		console.log(options);

		for (var i = 0; i < saved_questionnaires.length; i++) {
			if (saved_questionnaires[i].name === selected_questionnaire) {
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

	$(questionnaire.selector).on('click', questionnaire.question_types.single_choice_radio_buttons.add_alternative_label.selector, function() {
		questionnaire_add_question_answer_alternative($(this).closest('.panel'), questionnaire.question_types.single_choice_radio_buttons);
	});

	$(questionnaire.selector).on('click', questionnaire.question_types.multiple_choice_checkboxes.add_alternative_label.selector, function() {
		questionnaire_add_question_answer_alternative($(this).closest('.panel'), questionnaire.question_types.multiple_choice_checkboxes);
	});

	questionnaire_install_main_toolbar_event_listeners();
	questionnaire_install_section_toolbar_event_listeners();
	questionnaire_install_modal_dialogs_event_listeners();

	$('.ranked-choice-alternatives-list').tooltip({'title': 'Ta bort alternativ', 'placement': 'right', 'container': 'body', 'selector': '.remove-ranked-choice'});

	$(document).on('click', questionnaire.question.question_types_list.selector + ' > li', function() {
		var panel = $(this).closest('.panel');

		questionnaire_change_question_type(panel, $(this).attr('data-question-type'));
		panel.focus();
	});

	$(document).on('click', '.single-choice-remove-alternative-button, .multiple-choice-remove-alternative-button', function() {
		questionnaire_remove_question_answer_alternative($(this).parent());
	});

	$('#questionnaire-clear-questionnaire-modal-dialog button[class*="btn-danger"]').on('click', questionnaire_clear);

	questionnaire_activate_section_toolbar_tooltips();
});

function questionnaire_install_section_toolbar_event_listeners() {
	$(questionnaire.selector).on('click', '.questionnaire-move-section-up-button', function() {
		questionnaire_move_section_up($(this).closest('.panel'));
	});

	$(questionnaire.selector).on('click', '.questionnaire-move-section-down-button', function() {
		questionnaire_move_section_down($(this).closest('.panel'));
	});

	$(questionnaire.selector).on('click', '.questionnaire-duplicate-section-button', function() {
		questionnaire_duplicate_section($(this).closest('.panel'));
	});

	$(questionnaire.selector).on('click', '.questionnaire-remove-section-button', function() {
		$(this).tooltip('destroy');
		questionnaire_remove_section($(this).closest('.panel'));
	});
}

function questionnaire_activate_main_toolbar_tooltips() {
	$(questionnaire.operations_toolbar.selector).children('button').tooltip({
		container: 'body',
		placement: 'right',
		trigger: 'hover'
	});
}

function questionnaire_activate_section_toolbar_tooltips() {
	$(questionnaire.selector).tooltip({
		container: 'body',
		placement: 'top',
		trigger: 'hover',
		selector: '.questionnaire-move-section-up-button, \
					.questionnaire-move-section-down-button, \
					.questionnaire-duplicate-section-button, \
					.questionnaire-remove-section-button, ' +
					questionnaire.question.mandatory_question_label.selector
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
	var try_insert_new_image = function() {
		var image_url = questionnaire.modal_dialogs.add_image.image_url.get();

		if (image_url !== '') {
			$(questionnaire.modal_dialogs.add_image.selector).modal('hide');
			questionnaire_insert_image(questionnaire_get_saved_range());
		} else {
			$(questionnaire.modal_dialogs.add_image.image_url.selector).addClass('invalid').popover(questionnaire.popovers.invalid_value).popover('show');
		}
	};

	var try_insert_new_hyperlink = function() {
		var hyperlink_url = questionnaire.modal_dialogs.add_hyperlink.hyperlink_url.get();

		if (hyperlink_url !== '') {
			$(questionnaire.modal_dialogs.add_hyperlink.selector).modal('hide');
			questionnaire_insert_hyperlink(questionnaire_get_saved_range());
		} else {
			$(questionnaire.modal_dialogs.add_hyperlink.hyperlink_url.selector).addClass('invalid').popover(questionnaire.popovers.invalid_value).popover('show');
		}
	};

	var try_insert_new_email_link = function() {
		var email_address = questionnaire.modal_dialogs.add_email_link.email_address.get();

		if (email_address !== '') {
			$(questionnaire.modal_dialogs.add_email_link.selector).modal('hide');
			questionnaire_insert_email_link(questionnaire_get_saved_range());
		} else {
			$(questionnaire.modal_dialogs.add_email_link.email_address.selector).addClass('invalid').popover(questionnaire.popovers.invalid_value).popover('show');
		}
	};

	var try_save_questionnaire = function() {
		try {
			var new_questionnaire = {
				name: questionnaire.modal_dialogs.save_questionnaire.questionnaire_name.get(),
				html: $(questionnaire.selector).html()
			};

			questionnaire_save(new_questionnaire);

			$(questionnaire.modal_dialogs.save_questionnaire.selector).modal('hide');
		} catch (error) {
			alert(error);
		}
	};

	$(questionnaire.modal_dialogs.add_image.selector).on('submit', 'form', function(event) {
		event.preventDefault();
		try_insert_new_image();
	});

	$(questionnaire.modal_dialogs.add_image.selector).on('click', 'button.btn-primary', function() {
		try_insert_new_image();
	});

	$(questionnaire.modal_dialogs.add_hyperlink.selector).on('submit', 'form', function(event) {
		event.preventDefault();
		try_insert_new_hyperlink();
	});

	$(questionnaire.modal_dialogs.add_hyperlink.selector).on('click', 'button.btn-primary', function() {
		try_insert_new_hyperlink();
	});

	$(questionnaire.modal_dialogs.add_email_link.selector).on('submit', 'form', function(event) {
		event.preventDefault();
		try_insert_new_email_link();
	});

	$(questionnaire.modal_dialogs.add_email_link.selector).on('click', 'button.btn-primary', function() {
		try_insert_new_email_link();
	});

	$(questionnaire.modal_dialogs.save_questionnaire.selector).on('submit', 'form', function(event) {
		event.preventDefault();
		try_save_questionnaire();
	});

	$(questionnaire.modal_dialogs.save_questionnaire.selector).on('click', 'button.btn-primary', function() {
		try_save_questionnaire();
	});

	$(questionnaire.modal_dialogs.load_questionnaire.selector).on('click', 'button.btn-primary', function() {
		var selected_questionnaire_name = questionnaire.modal_dialogs.load_questionnaire.get_selected_questionnaire();
		questionnaire_load(selected_questionnaire_name);
	});

	$(questionnaire.modal_dialogs.load_questionnaire.selector).on('click', 'button.btn-danger', function() {
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

function questionnaire_display_modal_dialog_if_selection_exists(no_text_selected_item_text, modal_dialog_display_function) {
	var selection = rangy.getSelection();

	if (selection == undefined || (selection != undefined && selection.isCollapsed)) {
		$('#questionnaire-no-text-selected-modal-item').html(no_text_selected_item_text);
		$('#questionnaire-no-text-selected-modal-dialog').modal();
	} else {
		if (selection.rangeCount > 0) {
			var range = selection.getRangeAt(0);

			questionnaire_set_saved_range(range);
			modal_dialog_display_function();
		}
	}
}
function questionnaire_install_main_toolbar_event_listeners() {
	$('.questionnaire-add-question-button').on('click', function() {
		questionnaire_add_question(questionnaire.question_type.default_type);
	});

	$('.questionnaire-add-heading-and-description-button').on('click', function() {
		questionnaire_add_heading_and_description();
	});

	$('.questionnaire-add-image-button').on('click', function() {
		questionnaire_run_function_if_selection_inside_questionnaire(function() {
			questionnaire_display_add_image_modal();
		})
	});

	$('.questionnaire-add-hyperlink-button').on('click', function() {
		questionnaire_display_modal_dialog_if_selection_exists('<b>hyperlänk</b>', questionnaire_display_add_hyperlink_modal);
	});

	$('.questionnaire-add-email-link-button').on('click', function() {
		questionnaire_display_modal_dialog_if_selection_exists('<b>email-länk</b>', questionnaire_display_add_email_link_modal);
	});

	$('.questionnaire-undo-button').on('click', function() {
		document.execCommand('undo');
	});

	$('.questionnaire-redo-button').on('click', function() {
		document.execCommand('redo');
	});

	$('.questionnaire-preview-questionnaire-button').on('click', function() {
		questionnaire_preview();
	});

	$('.questionnaire-save-questionnaire-button').on('click', function() {
		questionnaire_display_save_questionnaire_modal();
	});

	$('.questionnaire-load-questionnaire-button').on('click', function() {
		questionnaire_display_load_questionnaire_modal();
	});

	$('.questionnaire-clear-questionnaire-button').on('click', function() {
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
	var image_url = questionnaire.modal_dialogs.add_image.image_url.get();
	var new_image = document.createElement('img');

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

function questionnaire_insert_link(range, link_url, starting_text_check, prepend_with) {
	var new_hyperlink = document.createElement('a');

	$(new_hyperlink).attr({
		'target': '_blank',
		'tabindex': '0',
		'contenteditable': 'false'
	});

	if (starting_text_check === true) {
		$(new_hyperlink).attr('href', link_url);
	} else {
		$(new_hyperlink).attr('href', prepend_with + link_url);
	}

	range.surroundContents(new_hyperlink);
}

function questionnaire_insert_hyperlink(range) {
	var hyperlink_url = questionnaire.modal_dialogs.add_hyperlink.hyperlink_url.get();
	questionnaire_insert_link(range, hyperlink_url, hyperlink_url.startsWith('http://') || hyperlink_url.startsWith('https://'), 'http://');
}

function questionnaire_insert_email_link(range) {
	var email_address = questionnaire.modal_dialogs.add_email_link.email_address.get();
	questionnaire_insert_link(range, email_address, email_address.startsWith('mailto:'), 'mailto:');
}

function questionnaire_display_add_image_modal() {
	$(questionnaire.modal_dialogs.add_image.image_url.selector).popover('hide').removeClass('invalid').val('');
	$(questionnaire.modal_dialogs.add_image.selector).modal();
}

function questionnaire_display_add_hyperlink_modal() {
	$(questionnaire.modal_dialogs.add_hyperlink.hyperlink_url.selector).popover('hide').removeClass('invalid').val('');
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

	$(questionnaire.modal_dialogs.add_email_link.email_address.selector).popover('hide').removeClass('invalid').val('');
	$(questionnaire.modal_dialogs.add_email_link.selector).modal();
}

function questionnaire_display_save_questionnaire_modal() {
	questionnaire.modal_dialogs.save_questionnaire.questionnaire_name.set(questionnaire_get_title());
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

function questionnaire_display_questionnaire_submitted_modal() {
	$(questionnaire.modal_dialogs.questionnaire_submitted.selector).modal();
}

function questionnaire_submit() {
	var invalid_questions = questionnaire_validate();

	if (invalid_questions.length === 0) {
		$('#questionnaire-submit-button').prop('disabled', true).text('Svar inskickat');
		questionnaire_display_questionnaire_submitted_modal();
		questionnaire_post();
	} else {
		var error_popover = $(invalid_questions[0]).find('.popover');

		if (error_popover != undefined) {
			$("html, body").animate({scrollTop: error_popover.offset().top + 'px'});
		}
	}
}

function questionnaire_post() {
	var questions = questionnaire_get_questions();
	var questionnaire_data = {
		title: questionnaire_get_title(),
		description: questionnaire_get_description(),
		question_answers: []
	};

	$(questions).each(function(index, question) {
		var question_type = questionnaire_get_question_type(question);
		var question_data = {
			heading: questionnaire_get_question_heading(question),
			description: questionnaire_get_question_description(question)
		}

		if (question_type === questionnaire.question_types.short_answer.name) {
			question_data.answer = questionnaire.question_types.short_answer.get_answer_text(question);
		} else if (question_type === questionnaire.question_types.paragraph.name) {
			question_data.answer = questionnaire.question_types.paragraph.get_answer_text(question);
		} else if (question_type === questionnaire.question_types.single_choice_list.name) {
			question_data.answer = questionnaire.question_types.single_choice_list.get_selected_alternative_text(question);
		} else if (question_type === questionnaire.question_types.multiple_choice_list.name) {
			question_data.answer = questionnaire.question_types.multiple_choice_list.get_selected_alternatives_text(question);
		} else if (question_type === questionnaire.question_types.single_choice_radio_buttons.name) {
			question_data.answer = questionnaire.question_types.single_choice_radio_buttons.get_selected_alternatives_text(question);
		} else if (question_type === questionnaire.question_types.multiple_choice_checkboxes.name) {
			question_data.answer = questionnaire.question_types.multiple_choice_checkboxes.get_selected_alternatives_text(question);
		} else if (question_type === questionnaire.question_types.ranked_choice.name) {
			var ranked_choice = $(question).find('.ranked-choice');
			var ranked_choice_type = questionnaire_get_ranked_choice_type_from_ranked_choice_ctrl(ranked_choice);
			var ranked_choice_scale_text = questionnaire_get_ranked_choice_scale_text(question);
			var ranked_choice_alternatives_positions = ranked_choice_type.get_alternatives_positions(ranked_choice);

			question_data.answer = {
				choice_type: ranked_choice_type.name,
				alternatives_positions: ranked_choice_alternatives_positions,
				scale: {
					length: ranked_choice_type.slider_bar_steps,
					text: ranked_choice_scale_text
				}
			}
			debugger;
		}

		questionnaire_data.question_answers.push(question_data);
	});

	// Convert questionnaire data to JSON format, ready to be transmitted to server for questionnaire answers database storage
	var json_data = JSON.stringify(questionnaire_data);
	questionnaire_send_answers_to_server(json_data);
}

function questionnaire_send_answers_to_server(json_data) {
	// To be implemented
}

function questionnaire_get_question_answer_alternatives_list(question_type_div) {
	return $(question_type_div).find('.question-answer-alternatives').children('li:not(:last-child)');
}

function questionnaire_add_question_answer_alternative_to_alternatives_list(question_type_div, answer_alternative) {
	var question_answer_alternatives_list = $(question_type_div).find('.question-answer-alternatives');

	$(answer_alternative).css('display', 'none');
	$(question_answer_alternatives_list).children('li:last-child').before(answer_alternative);
	$(answer_alternative).slideDown(400);
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
	var new_question_answer_remove_alternative_button = document.createElement('img');

	$(new_question_answer_alternative_label).attr({'contenteditable': 'true', 'spellcheck': 'false'});

	$(new_question_answer_alternative_input).prop('disabled', true);
	$(new_question_answer_remove_alternative_button).attr({'src': 'svg/remove_alternative.svg', 'alt': 'Remove alternative'});

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

	$(new_question_answer_remove_alternative_button).attr({
		'data-toggle': 'tooltip',
		'data-placement': 'right',
		'data-container': 'body',
		'title': 'Ta bort alternativ'
	}).tooltip();

	questionnaire_select_text_node(new_question_answer_alternative_label);

	return new_question_answer_alternative_list_item;
}

function questionnaire_remove_question_answer_alternative(alternative) {
	$(alternative).children('img').tooltip('destroy');
	$(alternative).slideUp(400, function() {
		$(alternative).remove();
	});
}

function questionnaire_select_text_node(node) {
		var range = rangy.createRange();
		range.selectNodeContents(node);
		var sel = rangy.getSelection();
		sel.setSingleRange(range);
		$(node).focus();

	/*
	var range = rangy.createRange();
	range.selectNodeContents(node);
	var sel = rangy.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
	*/
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
	}
}

function questionnaire_remove_section(section) {
	if (section == undefined) {
		return false;
	} else {
		var section_height = section.outerHeight(true);
		var section_z_index = questionnaire_get_section_z_index(section);

		// Prevent large sections to overflow questionnaire
		$(questionnaire.selector).css('overflow', 'hidden');
		section.addClass('animate-margin-top');
		section.css({'z-index': '0', 'margin-top': '-=' + section_height + 'px'});

		questionnaire_set_active_section(undefined);

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
			// Reset questionnaire overflow style
			$(questionnaire.selector).css('overflow', '');
		}, 1000);

		return true;
	}
}

function questionnaire_duplicate_section(section) {
	if (section == undefined) {
		return false;
	} else {
		var duplicated_section = $(section).clone(false);

		questionnaire_set_active_section(duplicated_section);

		duplicated_section.css('z-index', '+=1');

		$(duplicated_section).removeClass('animate-duplicate-section');
		$(duplicated_section).css('top', '-=' + $(section).outerHeight(true) + 'px');
		$(duplicated_section).css('margin-bottom', '-' + $(section).outerHeight() + 'px');

		// Insert the duplicated section just after the original one in the DOM
		section.after(duplicated_section);

		$(duplicated_section).addClass('animate-duplicate-section');
		$(duplicated_section).css('top', '+=' + $(section).outerHeight(true) + 'px');
		$(duplicated_section).css('margin-bottom', '');

		// Increase z-index by 1 for all sections positioned after the duplicated section
		$(duplicated_section).nextAll('.panel').css('z-index', '+=1');

		setTimeout(function() {
			// Necessary for correct movement later
			$(duplicated_section).removeClass('animate-duplicate-section');
		}, 900);

		duplicated_section.find('[data-toggle="tooltip"]').tooltip();

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

function questionnaire_get_question_heading(question) {
	return $(question).find('.panel-title').text();
}

function questionnaire_get_question_description(question) {
	return $(question).find('.question-description').text();
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

		// Required because loss of focus
		questionnaire_set_active_section(section);

		section.removeClass('animate-top');
		sibling_section.removeClass('animate-top');

		section.css({'top': '+=' + sibling_section.outerHeight(true) + 'px', 'z-index': '-=1'});
		sibling_section.css({'top': '-=' + section.outerHeight(true) + 'px', 'z-index': '+=1'});

		section.addClass('animate-top');
		sibling_section.addClass('animate-top');

		section.css('top', '-=' + sibling_section.outerHeight(true) + 'px');
		sibling_section.css('top', '+=' + section.outerHeight(true) + 'px');

		return true;

	} else if (direction === 1 && section_position < total_number_of_sections) {
		sibling_section = questionnaire_get_section(section_position + 1);

		$(sibling_section).after(section);

		// Required because loss of focus
		questionnaire_set_active_section(section);

		section.removeClass('animate-top');
		sibling_section.removeClass('animate-top');

		section.css({'top': '-=' + sibling_section.outerHeight(true) + 'px', 'z-index': '+=1'});
		sibling_section.css({'top': '+=' + section.outerHeight(true) + 'px', 'z-index': '-=1'});

		section.addClass('animate-top');
		sibling_section.addClass('animate-top');

		section.css('top', '+=' + sibling_section.outerHeight(true) + 'px');
		sibling_section.css('top', '-=' + section.outerHeight(true) + 'px');

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

	var mandatory_filtered_questions = filtered_questions.find('.mandatory-question-label > input[type="checkbox"]:checked').closest(questionnaire.question.selector);

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
	questionnaire_set_active_section(cloned_section_div);
	$(cloned_section_div).focus();

	$('html, body').animate({scrollTop: cloned_section_div.offset().top + 'px'}, 800, 'swing');

	return cloned_section_div;
}

function questionnaire_get_active_section() {
	return $(document).data('active-section');
}

function questionnaire_set_active_section(section) {
	if (section == undefined) {
		$(questionnaire.selector).children('.panel.panel-active').removeClass('panel-active');
		$(document).removeData('active-section');
	} else {
		$(questionnaire.selector).children('.panel.panel-active').removeClass('panel-active');
		$(section).addClass('panel-active');
		$(document).data('active-section', section);
	}
}

function questionnaire_add_question(question_type) {
	if (question_type == undefined) {
		question_type = questionnaire.question_type.default_type;
	}

	if (!questionnaire_is_question_type_valid(question_type)) {
		return false;
	} else {
		var new_question = questionnaire_add_section(questionnaire_get_question_prototype(), function(cloned_question_div) {
			questionnaire_change_question_type(cloned_question_div, question_type);
		});

		new_question.find('.question-type-validation-field').popover(questionnaire.popovers.invalid_question);

		return new_question;
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
		//questionnaire_remove_all_question_validation_errors();
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
	if (typeof(Storage) !== "undefined") {
		var saved_questionnaires = questionnaire_get_saved_questionnaires();

		if (questionnaire_is_already_saved(saved_questionnaires, new_questionnaire)) {
			throw "name already exists";
		} else {
			saved_questionnaires.push(new_questionnaire);
			localStorage.setItem('questionnaires', JSON.stringify(saved_questionnaires));
		}
	} else {
		throw "storage error";
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

function questionnaire_get_ranked_choice_scale_text(question_div) {
	var scale_text_list = $(question_div).find('.ranked-choice-scale-text-list');
	var scale_texts = [];

	scale_text_list.children('li').each(function(index, scale_item) {
		var scale_item_text = $(scale_item).children('span').text();

		if (scale_item_text !== '') {
			scale_texts.push(scale_item_text);
		}
	});

	return scale_texts;
}

function questionnaire_change_ranked_choice_type(ranked_choice, new_choice_type) {
	var ranked_choice_scale_list = ranked_choice.siblings('.ranked-choice-scale-text-list');
	var ranked_choice_slider_bar = ranked_choice_get_slider_bar(ranked_choice);
	var new_ranked_choice_type = undefined;

	if (new_choice_type === ranked_choice_types.type_a.name) {
		new_ranked_choice_type = ranked_choice_types.type_a;
		$(ranked_choice).siblings('.ranked-choice-add-alternative').css('display', '');
	} else if (new_choice_type === ranked_choice_types.type_b.name) {
		new_ranked_choice_type = ranked_choice_types.type_b;
		$(ranked_choice).siblings('.ranked-choice-add-alternative').css('display', '');
	} else if (new_choice_type === ranked_choice_types.type_c.name) {
		new_ranked_choice_type = ranked_choice_types.type_c;
		$(ranked_choice).siblings('.ranked-choice-add-alternative').css('display', 'none');
	}

	for (var ranked_choice_type in ranked_choice_types) {
		ranked_choice.removeClass(ranked_choice_types[ranked_choice_type].classname);
	}

	ranked_choice.addClass(new_ranked_choice_type.classname);
	ranked_choice_slider_bar.css({'padding-left': '', 'padding-right': ''});
	ranked_choice_set_slider_bar_steps(ranked_choice, new_ranked_choice_type.slider_bar_steps);
	questionnaire_toggle_ranked_choice_alternatives_display_mode(ranked_choice, new_choice_type, new_ranked_choice_type.alternatives_initial_position);
	ranked_choice_update_alternatives_positions(ranked_choice);
	ranked_choice_set_slider_bar_update_function_callback(ranked_choice, new_ranked_choice_type.update_function_callback);

	// Update ranked choice scale text
	for (var i = 0; i < new_ranked_choice_type.scale_text.length; i++) {
		ranked_choice_scale_list.children('li:nth-child(' + (i+1) + ')').children('span').text(new_ranked_choice_type.scale_text[i]);
	}

	new_ranked_choice_type.update_function_callback(ranked_choice_slider_bar, ranked_choice_get_alternatives_list(ranked_choice));
}