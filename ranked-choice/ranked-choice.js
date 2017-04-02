var ranked_choice_data = (function() {
	var classnames = {
		'RANKED_CHOICE': 'ranked-choice',
		'ALTERNATIVES_LIST': 'ranked-choice-alternatives-list',
		'SLIDER_BAR': 'ranked-choice-slider-bar',
		'ALTERNATIVE_TEXT': 'ranked-choice-alternative-text',
		'ALTERNATIVE_REMOVE_BUTTON': 'ranked-choice-alternative-remove-button',
		'ALTERNATIVE_TRIANGLE': 'ranked-choice-alternative-triangle',
		'ALTERNATIVE_SLIDER_DRAG_HANDLE': 'ranked-choice-alternative-slider-drag-handle'
	};

	var attributes = {
		'SLIDER_STEPS': 'data-slider-steps',
		'ALTERNATIVE_POSITION': 'data-alternative-position',
		'DEFAULT_ALTERNATIVE_POSITION': 1
	};

	var constants = {
		'ALTERNATIVE_DEFAULT_HEIGHT': 32,
		'ALTERNATIVE_SLIDER_DRAG_HANDLE_DEFAULT_HEIGHT': 20,
		'DEFAULT_ALTERNATIVE_TEXT': 'Alternativ',
		'SLIDER_BAR_UPDATE_FUNCTION_CALLBACK': 'slider-bar-update-function-callback'
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

function ranked_choice_install_event_listeners(ranked_choice) {
	var alternatives_list = ranked_choice_get_alternatives_list(ranked_choice);

	$(alternatives_list).on('keydown', 'li > ' + ranked_choice_data.selector('ALTERNATIVE_TEXT'), function(event) {
		if (event.keyCode == 13) {
			event.preventDefault(); // Prevent new line insertion
		}
	}).on('keydown', 'li > ' + ranked_choice_data.selector('ALTERNATIVE_SLIDER_DRAG_HANDLE'), function(event) {
		ranked_choice_alternative_slider_drag_handle_key_down_event(event);
	}).on('mousedown', 'li > ' + ranked_choice_data.selector('ALTERNATIVE_SLIDER_DRAG_HANDLE') + ', li > ' +
			ranked_choice_data.selector('ALTERNATIVE_TRIANGLE'), function(event) {
 		ranked_choice_alternative_mouse_down_event(event);
	}).on('click', 'li > ' + ranked_choice_data.selector('ALTERNATIVE_REMOVE_BUTTON'), function(event) {
		ranked_choice_remove_alternative($(this).closest('li'));
	});
}

function ranked_choice_create_new(steps) {
	var ranked_choice = $(document.createElement('div')).attr({
		'class': ranked_choice_data.classname('RANKED_CHOICE'),
		ranked_choice_data.attribute('SLIDER_STEPS'): steps
	});

	var ranked_choice_alternatives_list = $(document.createElement('ul')).attr({
		'class': ranked_choice_data.classname('ALTERNATIVES_LIST')
	});

	var ranked_choice_slider_bar = $(document.createElement('div')).attr({
		'class': ranked_choice_data.classname('SLIDER_BAR')
	});

	ranked_choice.append(ranked_choice_alternatives_list, ranked_choice_slider_bar);
	ranked_choice_install_event_listeners(ranked_choice);

	return ranked_choice;
}

function ranked_choice_update_slider_bar(ranked_choice) {
	var function_callback = ranked_choice.data(RANKED_CHOICE_CONSTANTS.SLIDER_BAR_UPDATE_FUNCTION_CALLBACK);

	if (function_callback !== undefined) {
		function_callback(ranked_choice.children(RANKED_CHOICE_SELECTORS.SLIDER_BAR), ranked_choice.children(RANKED_CHOICE_SELECTORS.ALTERNATIVES_LIST));
	}
}

function ranked_choice_set_slider_bar_update_function_callback(ranked_choice, function_callback) {
	ranked_choice.data(RANKED_CHOICE_CONSTANTS.SLIDER_BAR_UPDATE_FUNCTION_CALLBACK, function_callback);
}

function ranked_choice_alternative_slider_drag_handle_key_down_event(event) {
	var alternative = $(event.target).closest('li');

	if (event.keyCode == 37) {
		if (ranked_choice_move_alternative(alternative, -1)) {
			ranked_choice_update_slider_bar(alternative.closest(RANKED_CHOICE_SELECTORS.RANKED_CHOICE));
		}
	} else if (event.keyCode == 39) {
		if (ranked_choice_move_alternative(alternative, 1)) {
			ranked_choice_update_slider_bar(alternative.closest(RANKED_CHOICE_SELECTORS.RANKED_CHOICE));
		}
	}
}

/*
function ranked_choice_alternative_slider_drag_handle_key_down_event(event) {
	var target = event.target || event.srcElement;
	var ranked_choice = $(target).closest('li');
	var ranked_choice_alternatives_list = ranked_choice.closest(RANKED_CHOICE_ALTERNATIVES_LIST);
	var ranked_choice_slider_bar = ranked_choice_alternatives_list.siblings(SEL_RANKED_CHOICE_SLIDER_BAR);
	var ranked_choice_order_description = ranked_choice_alternatives_list.siblings(RANKED_CHOICE_ORDER_DESCRIPTION);
	var ranked_choice_type = ranked_choice_slider_bar.attr(ATTR_RANKED_CHOICE_CHOICE_TYPE);
	var ranked_choice_position = parseInt(ranked_choice.attr(ATTR_RANKED_CHOICE_ALTERNATIVE_POSITION));
	var total_number_of_steps = parseInt(ranked_choice_slider_bar.attr(ATTR_RANKED_CHOICE_SLIDER_STEPS));
	var step_bound = Math.floor(total_number_of_steps / 2);

	if (event.keyCode == 37 && ranked_choice_position > -step_bound) {
		// Left arrow key
		ranked_choice_move_alternative(ranked_choice_position-1, ranked_choice, total_number_of_steps, ranked_choice_slider_bar);
		updateRankedChoiceOrderDescription(ranked_choice_type, ranked_choice_order_description, ranked_choice_alternatives_list);

	} else if (event.keyCode == 39 && ranked_choice_position < step_bound) {
		// Right arrow key
		ranked_choice_move_alternative(ranked_choice_position+1, ranked_choice, total_number_of_steps, ranked_choice_slider_bar);
		updateRankedChoiceOrderDescription(ranked_choice_type, ranked_choice_order_description, ranked_choice_alternatives_list);
	}
}
*/

function ranked_choice_alternative_mouse_down_event(event) {
	/*
	var target = event.target || event.srcElement;
	var ranked_choice = $(target).closest('li');
	var ranked_choice_alternatives_list = ranked_choice.closest(RANKED_CHOICE_ALTERNATIVES_LIST);
	var ranked_choice_slider_bar = ranked_choice_alternatives_list.siblings(RANKED_CHOICE_SLIDER_BAR);
	var ranked_choice_slider_drag_handle = ranked_choice.children(RANKED_CHOICE_ALTERNATIVE_SLIDER_DRAG_HANDLE);
	var ranked_choice_slider_drag_handle_offset_x = event.clientX - $(ranked_choice_slider_drag_handle).offset().left;
	var ranked_choice_order_description = ranked_choice_alternatives_list.siblings(RANKED_CHOICE_ORDER_DESCRIPTION);
	var ranked_choice_type = ranked_choice_slider_bar.attr(ATTR_RANKED_CHOICE_CHOICE_TYPE);
	var ranked_choice_position = parseInt(ranked_choice.attr(ATTR_RANKED_CHOICE_ALTERNATIVE_POSITION));

	var total_width = ranked_choice_slider_bar.outerWidth() - ranked_choice_slider_drag_handle.outerWidth();
	var total_number_of_steps = parseInt(ranked_choice_slider_bar.attr(ATTR_RANKED_CHOICE_SLIDER_STEPS));
	var dx = total_width / (total_number_of_steps - 1);
	var step_bound = Math.floor(total_number_of_steps / 2);
	var relative_x_pos = 0;

	$('html').css('cursor', 'ew-resize');

	ranked_choice_slider_drag_handle.addClass('is-dragging');

	$(document).on('mouseup', function(event) {

		$(document).off('mousemove');
		$('html').css('cursor', 'auto');
		$(ranked_choice_slider_drag_handle).removeClass('is-dragging');

	}).on('mousemove', function(event) {

		relative_x_pos = event.clientX - (ranked_choice_slider_drag_handle.offset().left + ranked_choice_slider_drag_handle_offset_x);
		ranked_choice_position = parseInt(ranked_choice.attr(ATTR_RANKED_CHOICE_ALTERNATIVE_POSITION));

		if (relative_x_pos > dx && ranked_choice_position < step_bound) {
			// move to the right
			ranked_choice_move_alternative(ranked_choice_position+1, ranked_choice, total_number_of_steps, ranked_choice_slider_bar);
			updateRankedChoiceOrderDescription(ranked_choice_type, ranked_choice_order_description, ranked_choice_alternatives_list);

		} else if (relative_x_pos < -dx && ranked_choice_position > -step_bound) {
			// move to the left
			ranked_choice_move_alternative(ranked_choice_position-1, ranked_choice, total_number_of_steps, ranked_choice_slider_bar);
			updateRankedChoiceOrderDescription(ranked_choice_type, ranked_choice_order_description, ranked_choice_alternatives_list);

		}
	});
	*/
}

function ranked_choice_get_choice_type(ranked_choice) {
	return ranked_choice.attr(ATTR_RANKED_CHOICE_CHOICE_TYPE);
}

function ranked_choice_get_alternative_position(alternative) {
	return parseInt($(alternative).attr('data-position'));
}

function ranked_choice_get_alternative_text(alternative) {
	return $(alternative).find(RANKED_CHOICE_SELECTORS.ALTERNATIVE_TEXT).text();
}

function ranked_choice_set_alternative_position(ranked_choice, alternative, position) {
	var alternative_offset = ((position-1) / (ranked_choice_get_slider_bar_steps(ranked_choice)-1)) * 100;

	alternative.attr(RANKED_CHOICE_ATTRIBUTES.ALTERNATIVE_POSITION, position);
	alternative.css('left', Math.round(alternative_offset) + '%');
}

function ranked_choice_get_alternatives_positions(ranked_choice) {
	var alternatives_positions = new Array();

	ranked_choice_get_alternatives(ranked_choice).each(function(index, alternative) {
		alternatives_positions.push(ranked_choice_get_alternative_position(alternative));
	});

	return alternatives_positions;
}

function ranked_choice_get_slider_bar_steps(ranked_choice) {
	return parseInt(ranked_choice.attr(RANKED_CHOICE_ATTRIBUTES.SLIDER_STEPS));
}

function ranked_choice_move_alternative(alternative, direction) {
	if (direction == -1 || direction == 1) {
		var ranked_choice_slider_bar_steps = ranked_choice_get_slider_bar_steps(alternative.closest(RANKED_CHOICE_SELECTORS.RANKED_CHOICE));
		var alternative_new_position = ranked_choice_get_alternative_position(alternative) + direction;

		if (alternative_new_position < 1 || alternative_new_position > ranked_choice_slider_bar_steps) {
			return false;
		} else {
			ranked_choice_set_alternative_position(alternative.closest(RANKED_CHOICE_SELECTORS.RANKED_CHOICE), alternative, alternative_new_position);
			return true;
		}
	} else {
		return false;
	}
}

function getMinAndMaxRankedChoicePositions(ranked_choice_alternatives_list, ranked_choice_slider_bar) {
	var total_number_of_steps = parseInt($(ranked_choice_slider_bar).attr(ATTR_RANKED_CHOICE_SLIDER_STEPS));
	var min_ranked_choice_position = total_number_of_steps;
	var max_ranked_choice_position = -total_number_of_steps;

	$(ranked_choice_alternatives_list).children("li:not([style*='display: none'])").each(function(index, ranked_choice) {
		var ranked_choice_position = parseInt($(ranked_choice).attr(ATTR_RANKED_CHOICE_ALTERNATIVE_POSITION));

		if (ranked_choice_position >= max_ranked_choice_position) {
			max_ranked_choice_position = ranked_choice_position;
		}

		if (ranked_choice_position <= min_ranked_choice_position) {
			min_ranked_choice_position = ranked_choice_position;
		}
	});

	var min_max_arr = [min_ranked_choice_position, max_ranked_choice_position];
	return min_max_arr;
}

function ranked_choice_get_alternatives_list(ranked_choice) {
	return ranked_choice.children(ranked_choice_data.selector('ALTERNATIVES_LIST'));
}

function ranked_choice_get_alternatives(ranked_choice_element) {
	return $(ranked_choice_element)
			.closest(RANKED_CHOICE_SELECTORS.RANKED_CHOICE)
			.find(RANKED_CHOICE_SELECTORS.ALTERNATIVES_LIST).children('li');
}

function ranked_choice_update_alternatives_positions(ranked_choice) {
	var ranked_choice_alternatives_list = ranked_choice.children('.ranked-choice-alternatives-list');

	ranked_choice_alternatives_list.children('li').each(function(index, alternative) {
		var alternative_slider_drag_handle = $(alternative).find(RANKED_CHOICE_SELECTORS.ALTERNATIVE_SLIDER_DRAG_HANDLE);
		var alternative_polygon = $(alternative).find(RANKED_CHOICE_SELECTORS.ALTERNATIVE_POLYGON);
		var alternative_slider_drag_handle_new_top_position = ranked_choice_alternatives_list.outerHeight(true) - $(alternative).position().top - alternative_slider_drag_handle.outerHeight();
		var alternative_polygon_new_height = ranked_choice_alternatives_list.outerHeight(true) - $(alternative).position().top - $(alternative).outerHeight() - $(alternative_slider_drag_handle).outerHeight();

		alternative_slider_drag_handle.css('top', alternative_slider_drag_handle_new_top_position + 'px');
		alternative_polygon.css('height', alternative_polygon_new_height + 'px');
	});
}

function ranked_choice_add_alternative(ranked_choice, alternative_position, alternative_data) {
	var ranked_choice_alternatives_list = $(ranked_choice).find(ranked_choice_data.selector('ALTERNATIVES_LIST'));

	var new_alternative = $(document.createElement('li'));
	var new_alternative_text = $(document.createElement('span')).attr({'class': 'ranked-choice-alternative-text', 'contenteditable': 'true', 'spellcheck': 'false'});
	var new_alternative_remove_button = $(document.createElement('button')).attr({'class': 'ranked-choice-alternative-remove-button', 'type': 'button'}).html('&times;').tooltip({'title': 'Ta bort alternativ', 'placement': 'right'});
	var new_alternative_polygon = $(document.createElement('div')).attr('class', 'ranked-choice-alternative-polygon');
	var new_alternative_slider_drag_handle = $(document.createElement('button')).attr({'class': 'ranked-choice-alternative-slider-drag-handle', 'type': 'button'});

	if (typeof(alternative_data) === 'string') {
		new_alternative_text.html(alternative_data);
	} else if (typeof(alternative_data) === 'object' && alternative_data !== null) {
		new_alternative_text.html(alternative_data.text);

		if (alternative_data.removable === false) {
			new_alternative_remove_button.css('display', 'none');
		}

		if (alternative_data.editable === false) {
			new_alternative_text.attr('contenteditable', 'false');
		}
	} else {
		new_alternative_text.text(RANKED_CHOICE_CONSTANTS.DEFAULT_ALTERNATIVE_TEXT);
	}

	$(new_alternative).append(new_alternative_text, new_alternative_remove_button, new_alternative_polygon, new_alternative_slider_drag_handle);

	if (typeof(alternative_position) === 'undefined') {
		ranked_choice_set_alternative_position(ranked_choice, new_alternative, RANKED_CHOICE_CONSTANTS.DEFAULT_ALTERNATIVE_POSITION);
	} else {
		ranked_choice_set_alternative_position(ranked_choice, new_alternative, alternative_position);
	}

	ranked_choice_alternatives_list.append(new_alternative);

	ranked_choice_update_alternatives_positions(ranked_choice);
	ranked_choice_update_slider_bar(ranked_choice);

	return new_alternative;
}

function ranked_choice_remove_alternative(alternative) {
	if (alternative == null || $(alternative).parent('.ranked-choice-alternatives-list').length == 0) {
		return false;
	} else {
		alternative.children(RANKED_CHOICE_SELECTORS.ALTERNATIVE_REMOVE_BUTTON).tooltip('destroy');

		var ranked_choice = alternative.closest(RANKED_CHOICE_SELECTORS.RANKED_CHOICE);
		var removed = alternative.remove();

		ranked_choice_update_alternatives_positions(ranked_choice);

		return removed.length == 1;
	}
}