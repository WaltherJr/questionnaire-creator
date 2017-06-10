"use strict";

var select_list_data = (function() {
	var classnames = {
		'LIST': 'select-list',
		'CARET': 'select-list-caret',
		'BUTTON': 'select-list-button',
		'BUTTON_TEXT': 'select-list-button-text',
		'ALTERNATIVES_LIST': 'select-list-alternatives-list',
		'ALTERNATIVE': 'select-list-alternative',
		'ALTERNATIVE_TEXT': 'select-list-alternative-text',
		'ADD_ALTERNATIVE_BUTTON': 'select-list-add-alternative-button',
		'REMOVE_ALTERNATIVE_BUTTON': 'select-list-remove-alternative-button',
		'SELECTED_MARK': 'select-list-alternative-selected-mark glyphicon glyphicon-ok'
	};

	var attributes = {
		'EDITABLE': 'select-list-editable',
		'MULTI_OPTION': 'select-list-multi-option',
		'LIST_OPEN': 'select-list-alternatives-list-open',
		'ALTERNATIVE_SELECTED': 'select-list-alternative-selected',
		'BUTTON_INITIAL_TEXT': 'data-initial-text'
	};

	var constants = {
		'DEFAULT_CARET_HTML_ENTITY': '&#9207;',
		'DEFAULT_REMOVE_ALTERNATIVE_BUTTON_HTML_ENTITY': '&times;',
		'DEFAULT_BUTTON_TEXT': 'Välj',
		'DEFAULT_ALTERNATIVE_TEXT': 'Alternativ',
		'DEFAULT_ADD_ALTERNATIVE_BUTTON_TEXT': 'Lägg till svarsalternativ',
		'DEFAULT_REMOVE_ALTERNATIVE_BUTTON_TOOLTIP_TEXT': 'Ta bort alternativ',
		'DEFAULT_BUTTON_TEXT_ALTERNATIVES_SELECTED_STRING': ' alternativ valda'
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

$(document).ready(function() {
	$(document).on('click', '.select-list-button', function(event) {
		select_list_toggle_alternatives_list_dropdown($(this).closest('.select-list'));
	});

	$(document).on('click', '.select-list-add-alternative', function(event) {
		event.preventDefault();
		select_list_add_alternative($(this).closest('.select-list'));
	});

	$(document).on('click', '.select-list-remove-alternative-button', function() {
		select_list_remove_alternative($(this).closest('.select-list-alternative'));
	});

	$(document).on('focusout', '.select-list', function(event) {
		console.log(this);
		select_list_focus_out_event(event, $(this).closest('.select-list'));
	});

	$(document).on('keydown', '.select-list', function(event) {
		console.log("hej!");
		select_list_key_down_event(event, $(event.target).closest('.select-list'));
	});
});

function select_list_focus_out_event(event, select_list) {
	if (event.relatedTarget == null) {
		select_list_close_alternatives_list(select_list);
	} else {
		var classname = $(event.relatedTarget).attr('class');
		var valid_classname_prefix = 'select-list';

		if (classname == null || classname.indexOf(valid_classname_prefix) == -1) {
			select_list_close_alternatives_list(select_list);
		} else {
			var a = $(event.target).closest('div.select-list').get(0);
			var b = $(event.relatedTarget).closest('div.select-list').get(0);

			if (a !== b) {
				select_list_close_alternatives_list(select_list);
			}
		}
	}
}

function select_list_enter_key_down_event(select_list, event) {
	if ($(event.target).hasClass(select_list_data.classname('BUTTON_TEXT'))
		|| $(event.target).hasClass(select_list_data.classname('ALTERNATIVE_TEXT'))) {
		// Stop word break from happening
		event.preventDefault();

	} else if ($(event.target).hasClass(select_list_data.classname('LIST'))) {
		select_list_toggle_alternatives_list_dropdown($(event.target));
	} else if ($(event.target).hasClass(select_list_data.classname('ALTERNATIVE'))) {
		select_list_set_active_alternative(select_list, $(event.target));
	}
}

function select_list_handle_arrow_key_down_event(select_list, new_alternative_index, change_selection) {
	if (change_selection === true) {
		var new_alternative_selector = select_list_data.selector('ALTERNATIVE') +
										':nth-child(' + new_alternative_index + ')';
		var new_alternative = select_list.children(select_list_data.selector('ALTERNATIVES_LIST'))
												.children(new_alternative_selector);

		if (new_alternative.length > 0) {
			select_list_set_active_alternative(select_list, new_alternative);
		}
	}
}

function select_list_down_arrow_key_down_event(select_list) {
	if (!select_list_is_list_editable(select_list)) {
		var selected_alternative_index = select_list_get_selected_alternatives(select_list).index();
		var total_number_of_alternatives = select_list_get_alternatives_list(select_list)
											.children(select_list_data.selector('ALTERNATIVE')).length;

		select_list_handle_arrow_key_down_event(select_list, selected_alternative_index+2,
					 selected_alternative_index < (total_number_of_alternatives-1) ? true : false);
	}
}

function select_list_up_arrow_key_down_event(select_list) {
	if (!select_list_is_list_editable(select_list)) {
		var selected_alternative_index = select_list_get_selected_alternatives(select_list).index();

		select_list_handle_arrow_key_down_event(select_list, selected_alternative_index,
									 selected_alternative_index > 0 ? true : false);
	}
}

function select_list_key_down_event(event) {
	var select_list = $(event.target).closest(select_list_data.selector('LIST'));

	if (event.keyCode == 13) {
		select_list_enter_key_down_event(select_list, event);
	} else if (event.keyCode == 38) {
		select_list_up_arrow_key_down_event(select_list);
	} else if (event.keyCode == 40) {
		select_list_down_arrow_key_down_event(select_list);
	}
}

function select_list_alternative_click_event(event) {
	var select_list = $(event.target).closest(select_list_data.selector('LIST'));
	select_list_set_active_alternative(select_list, $(event.target).closest(select_list_data.selector('ALTERNATIVE')));

	if (!select_list_is_list_multi_option(select_list)) {
		select_list_close_alternatives_list(select_list);
	}
}

function select_list_create_new(editable, multi_option, button_text, add_alternative_button_text) {
	var select_list = $(document.createElement('div')).attr({
		'class': select_list_data.classname('LIST'),
		'tabindex': '0'
	});

	var select_list_button = $(document.createElement('div')).attr({
		'class': select_list_data.classname('BUTTON')
	});

	var select_list_button_text = $(document.createElement('span')).attr({
		'class': select_list_data.classname('BUTTON_TEXT'),
		'spellcheck': 'false'
	});

	/*
	var select_list_caret = $(document.createElement('img')).attr({
		'class': select_list_data.classname('CARET'),
		'src': 'svg/caret.svg',
		'alt': 'caret'
	});
	*/

	var select_list_caret = $(document.createElement('span')).attr({
		'class': select_list_data.classname('CARET')
	});

	var select_list_alternatives_list = $(document.createElement('ul')).attr({
		'class': select_list_data.classname('ALTERNATIVES_LIST')
	});

	var select_list_add_alternative_list_item = $(document.createElement('li'));

	var select_list_add_alternative_button = $(document.createElement('a')).attr({
		'class': 'select-list-add-alternative',
		'href': '#'
	});

	if (editable === true) {
		select_list.addClass(select_list_data.attribute('EDITABLE'));
		select_list_button_text.attr('contenteditable', 'true');
	}

	if (multi_option === true) {
		select_list.addClass(select_list_data.attribute('MULTI_OPTION'));
	}

	if (typeof(button_text) === 'undefined') {
		select_list_button_text.text(select_list_data.constant('DEFAULT_BUTTON_TEXT'));
	} else {
		select_list_button_text.text(button_text);
	}

	if (typeof(add_alternative_button_text) === 'undefined') {
		select_list_add_alternative_button.text(select_list_data.constant('DEFAULT_ADD_ALTERNATIVE_BUTTON_TEXT'));
	} else {
		select_list_add_alternative_button.text(add_alternative_button_text);
	}

	select_list_button.append(select_list_button_text, select_list_caret);
	select_list_add_alternative_list_item.append(select_list_add_alternative_button);
	select_list_alternatives_list.append(select_list_add_alternative_list_item);
	select_list.append(select_list_button, select_list_alternatives_list);

	return select_list;
}

function select_list_set_active_alternative(select_list, alternative) {
	if (!select_list.hasClass(select_list_data.attribute('MULTI_OPTION'))) {
		select_list_get_selected_alternatives(select_list).removeClass(select_list_data.attribute('ALTERNATIVE_SELECTED'));

		alternative.addClass(select_list_data.attribute('ALTERNATIVE_SELECTED'));
		select_list.find(select_list_data.selector('BUTTON_TEXT'))
			.text(alternative.children(select_list_data.selector('ALTERNATIVE_TEXT')).text());

		select_list_close_alternatives_list(select_list.children(select_list_data.selector('ALTERNATIVES_LIST')));
	} else {
		// Multi-option select list
		alternative.toggleClass(select_list_data.attribute('ALTERNATIVE_SELECTED'));

		var number_alternatives_selected = select_list_get_selected_alternatives(select_list).length;
		var select_list_button_text = number_alternatives_selected +
					select_list_data.constant('DEFAULT_BUTTON_TEXT_ALTERNATIVES_SELECTED_STRING');

		select_list.find(select_list_data.selector('BUTTON_TEXT')).text(select_list_button_text);
	}
}

function select_list_get_alternatives(select_list) {
	return select_list_get_alternatives_list(select_list).children(select_list_data.selector('ALTERNATIVE'));
}

function select_list_get_selected_alternatives(select_list) {
	return select_list_get_alternatives_list(select_list).children(select_list_data.selector('ALTERNATIVE_SELECTED'));
}

function select_list_clear_alternatives_list(select_list) {
	var alternatives_list = select_list_get_alternatives(select_list);

	alternatives_list.each(function(index, alternative) {
		$(alternative).remove();
	});
}

function select_list_add_alternative(select_list, alternative_data, removable) {
	var alternatives_list = select_list_get_alternatives_list(select_list);
	var new_list_item = $(document.createElement('li'));
	var alternative_text = $(document.createElement('span'));
	var selected_mark = $(document.createElement('span'));

	$(alternative_text).attr({
		'class': select_list_data.classname('ALTERNATIVE_TEXT'),
		'contenteditable': select_list_is_list_editable(select_list) ? 'true' : 'false',
		'spellcheck': 'false',
		'tabindex': '0'
	});

	if (typeof(alternative_data) === 'string') {
		alternative_text.html(alternative_data);
	} else if (typeof(alternative_data) === 'object' && alternative_data !== null) {
		alternative_text.html(alternative_data.text);
	} else {
		alternative_text.text(select_list_data.constant('DEFAULT_ALTERNATIVE_TEXT'));
	}

	$(selected_mark).attr({'class': select_list_data.classname('SELECTED_MARK')});

	$(new_list_item).addClass(select_list_data.classname('ALTERNATIVE')).css('display','none');
	new_list_item.append(alternative_text);
	new_list_item.append(selected_mark);

	if (removable == undefined || (typeof(removable === 'object' && removable !== null))) {
		$(new_list_item).addClass('select-list-removable');

		var remove_alternative_button = $(document.createElement('button'));

		$(remove_alternative_button).attr({
			'class': select_list_data.classname('REMOVE_ALTERNATIVE_BUTTON'),
			'type': 'button',
			'tabindex': '-1'
		});

		$(remove_alternative_button).attr({
			'data-toggle': 'tooltip',
			'data-placement': 'right',
			'data-container': 'body',
			'title': removable != undefined ? removable.tooltip_title : 'Ta bort alternativ'
		}).tooltip();

		new_list_item.append(remove_alternative_button);
	}

	alternatives_list.children('li:last-child').before(new_list_item);
	alternatives_list.animate({scrollTop: '2000px'}, 300, 'swing');

	$(new_list_item).slideDown(300, function() {
		questionnaire_select_text_node(alternative_text.get(0));
		$(alternative_text).focus();
	});

	//select_list_reset_scroll_top(select_list);
	//select_list_adjust_margin_bottom(select_list);
}

function select_list_reset_scroll_top(select_list) {
	var alternatives_list = select_list_get_alternatives_list(select_list);

  	alternatives_list.scrollTop(0);
  	var scroll_top = alternatives_list.children('li:last-child').position().top;
  	alternatives_list.scrollTop(scroll_top);
}

function select_list_remove_alternative(alternative) {
	var select_list = alternative.closest(select_list_data.selector('LIST'));
	var alternative_index = alternative.index() === 0 ? 1 : alternative.index();

	$(alternative).children(select_list_data.selector('REMOVE_ALTERNATIVE_BUTTON')).tooltip('destroy');
	select_list.focus();
	$(alternative).slideUp(400);

	setTimeout(function() {
		alternative.remove();
	}, 400);

	select_list_adjust_margin_bottom(select_list);
}

function select_list_get_alternatives_list(select_list) {
	return $(select_list).find(select_list_data.selector('ALTERNATIVES_LIST'));
}

function select_list_is_alternatives_list_open(select_list) {
	return select_list_get_alternatives_list(select_list).hasClass(select_list_data.attribute('LIST_OPEN'));
}

function select_list_toggle_alternatives_list_dropdown(select_list) {
	if (select_list_is_alternatives_list_open(select_list)) {
		select_list_close_alternatives_list(select_list);
	} else {
		select_list_open_alternatives_list(select_list);
	}
}

function select_list_open_alternatives_list(select_list) {
	var alternatives_list = select_list_get_alternatives_list(select_list);

	alternatives_list.addClass(select_list_data.attribute('LIST_OPEN'));
	select_list_adjust_margin_bottom(select_list);
	alternatives_list.children('li:last-child')
		.children(select_list_data.selector('ADD_ALTERNATIVE_BUTTON')).attr('tabindex', '0');

	if (select_list_is_list_editable(select_list)) {
		var alternatives = alternatives_list.children(select_list_data.selector('ALTERNATIVE'));

		alternatives.children(select_list_data.selector('REMOVE_ALTERNATIVE_BUTTON')).attr('tabindex', '0');
		alternatives.children(select_list_data.selector('ALTERNATIVE_TEXT')).attr('contenteditable', 'true');
	} else {
		alternatives_list.children(select_list_data.selector('ALTERNATIVE')).attr('tabindex', '0');
	}
}

function select_list_close_alternatives_list(select_list) {
	var alternatives_list = select_list_get_alternatives_list(select_list);

	alternatives_list.removeClass(select_list_data.attribute('LIST_OPEN'));
	alternatives_list.css('position', '');
	select_list.css('width', '');

	// Old solution:
	//alternatives_list.css('margin-bottom', '');
	alternatives_list.children('li:last-child')
		.children(select_list_data.selector('ADD_ALTERNATIVE_BUTTON')).attr('tabindex', '-1');

	if (select_list_is_list_editable(select_list)) {
		var alternatives = alternatives_list.children(select_list_data.selector('ALTERNATIVE'));

		alternatives.children(select_list_data.selector('REMOVE_ALTERNATIVE_BUTTON')).attr('tabindex', '-1');
		alternatives.children(select_list_data.selector('ALTERNATIVE_TEXT')).attr('contenteditable', 'false');
	} else {
		alternatives_list.children(select_list_data.selector('ALTERNATIVE')).attr('tabindex', '-1');
	}
}

function select_list_is_list_editable(select_list) {
	return select_list.hasClass(select_list_data.attribute('EDITABLE'));
}

function select_list_is_list_multi_option(select_list) {
	return select_list.hasClass(select_list_data.attribute('MULTI_OPTION'));
}

function select_list_is_alternative_selected(alternative) {
	return alternative.hasClass(select_list_data.attribute('ALTERNATIVE_SELECTED'));
}

function select_list_adjust_margin_bottom(select_list) {
	var alternatives_list = select_list_get_alternatives_list(select_list);

	alternatives_list.closest('.select-list').css('width', alternatives_list.outerWidth(true) + 'px');
	alternatives_list.css('position', 'absolute');
	// Old solution:
	//alternatives_list.css('margin-bottom', '-' + alternatives_list.outerHeight() + 'px');
}

function select_list_toggle_editable_mode(select_list) {
	var alternatives_list = select_list_get_alternatives_list(select_list);

	alternatives_list.scrollTop(0);

	if (select_list_is_list_editable(select_list)) {
		select_list.find(select_list_data.selector('BUTTON_TEXT')).attr('contenteditable', 'false');
		alternatives_list.children(select_list_data.selector('ALTERNATIVE'))
						.children(select_list_data.selector('ALTERNATIVE_TEXT')).attr('contenteditable', 'false');

		select_list.removeClass(select_list_data.attribute('EDITABLE'));
		select_list.attr(select_list_data.attribute('BUTTON_INITIAL_TEXT'),
									select_list_get_button_text(select_list));
		select_list.on('click', select_list_data.selector('ALTERNATIVE'), select_list_alternative_click_event);
	} else {
		var selected_alternatives = select_list_get_alternatives_list(select_list)
				.children(select_list_data.selector('ALTERNATIVE_SELECTED'));

		selected_alternatives.removeClass(select_list_data.attribute('ALTERNATIVE_SELECTED'));

		select_list.find(select_list_data.selector('BUTTON_TEXT')).attr('contenteditable', 'true');
		alternatives_list.children(select_list_data.selector('ALTERNATIVE'))
			.children(select_list_data.selector('ALTERNATIVE_TEXT')).attr('contenteditable', 'true');

		$(select_list).addClass(select_list_data.attribute('EDITABLE'));
		select_list_set_button_text(select_list, select_list.attr(select_list_data.attribute('BUTTON_INITIAL_TEXT')));
		select_list.off('click', select_list_data.selector('ALTERNATIVE'));
	}
}

function select_list_get_alternative_text(alternative) {
	return $(alternative).find('.select-list-alternative-text').text();
}

function select_list_get_button_text(select_list) {
	return select_list.find(select_list_data.selector('BUTTON_TEXT')).text();
}

function select_list_set_button_text(select_list, text) {
	select_list.find(select_list_data.selector('BUTTON_TEXT')).text(text);
}