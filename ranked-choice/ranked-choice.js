"use strict";

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

$(document).ready(function() {
	$(document).on('keydown', '.ranked-choice-alternative-text', function(event) {
		if (event.keyCode == 13) {
			event.preventDefault(); // Prevent new line insertion
		}
	});

	$(document).on('keydown', '.ranked-choice-alternative-slider-drag-handle', function(event) {
		ranked_choice_alternative_slider_drag_handle_key_down_event(event);
	});

	$(document).on('mousedown', '.ranked-choice-alternative-slider-drag-handle', function(event) {
		ranked_choice_alternative_mouse_down_event(event);
	});

	$(document).on('mousemove', function(event) {
		ranked_choice_document_mouse_move_event(event);
	});

	$(document).on('mouseup', function() {
		ranked_choice_document_mouse_up_event();
	});
});

function ranked_choice_create_new(steps, update_slider_bar_function_callback) {
	var attribute_slider_steps = ranked_choice_data.attribute('SLIDER_STEPS');

	var ranked_choice = $(document.createElement('div')).attr({
		'class': ranked_choice_data.classname('RANKED_CHOICE')
	});

	ranked_choice.attr(attribute_slider_steps, steps);

	var ranked_choice_alternatives_list = $(document.createElement('ul')).attr({
		'class': ranked_choice_data.classname('ALTERNATIVES_LIST')
	});

	var ranked_choice_slider_bar = $(document.createElement('div')).attr({
		'class': ranked_choice_data.classname('SLIDER_BAR')
	});

	ranked_choice.append(ranked_choice_alternatives_list, ranked_choice_slider_bar);

	if (typeof(update_slider_bar_function_callback) !== undefined) {
		ranked_choice_set_slider_bar_update_function_callback(ranked_choice, update_slider_bar_function_callback);
	} else {
		ranked_choice_set_slider_bar_update_function_callback(ranked_choice, function(){});
	}

	return ranked_choice;
}

function ranked_choice_update_slider_bar(ranked_choice) {
	var function_callback = ranked_choice.data(ranked_choice_data.constant('SLIDER_BAR_UPDATE_FUNCTION_CALLBACK'));

	if (function_callback != undefined) {
		var slider_bar = ranked_choice_get_slider_bar(ranked_choice);
		var alternatives_list = ranked_choice_get_alternatives_list(ranked_choice);

		function_callback(slider_bar, alternatives_list);
	}
}

function ranked_choice_set_slider_bar_update_function_callback(ranked_choice, function_callback) {
	ranked_choice.data(ranked_choice_data.constant('SLIDER_BAR_UPDATE_FUNCTION_CALLBACK'), function_callback);
}

function ranked_choice_alternative_slider_drag_handle_key_down_event(event) {
	var alternative = $(event.target).closest('li');

	if (event.keyCode == 37) {
		if (ranked_choice_move_alternative(alternative, -1)) {
			ranked_choice_update_slider_bar(alternative.closest('.ranked-choice'));
		}
	} else if (event.keyCode == 39) {
		if (ranked_choice_move_alternative(alternative, 1)) {
			ranked_choice_update_slider_bar(alternative.closest('.ranked-choice'));
		}
	}
}

function ranked_choice_alternative_mouse_down_event(event) {
	var ranked_choice = $(event.target).closest('.ranked-choice');
	var alternative = $(event.target).closest('li');
	var slider_bar = ranked_choice_get_slider_bar(ranked_choice);
	var slider_steps = ranked_choice_get_slider_bar_steps(ranked_choice);
	var slider_bar_width = slider_bar.outerWidth();
	var dx = slider_bar_width / (slider_steps-1);

	$(ranked_choice).data({
		'initial-mouse-pos-x': event.clientX,
		'dx': dx,
		'active-alternative': alternative
	});

	// Save active ranked-choice for document mousemove event handler
	$(document).data('active-ranked-choice', ranked_choice);
}

function ranked_choice_document_mouse_move_event(event) {
	var active_ranked_choice = $(document).data('active-ranked-choice');

	if (active_ranked_choice != undefined) {
		var initial_mouse_pos_x = active_ranked_choice.data('initial-mouse-pos-x');
		var dx = active_ranked_choice.data('dx');
		var apa = event.clientX - initial_mouse_pos_x;
		var direction = apa > 0 ? 1 : -1;

		if (Math.abs(apa) > dx) {
			// Move active alternative
			var active_alternative = active_ranked_choice.data('active-alternative');
			var slider_drag_square = $(active_alternative).children('.ranked-choice-alternative-slider-drag-handle');

			ranked_choice_move_alternative(active_alternative, direction);
			ranked_choice_update_slider_bar(active_ranked_choice);

			// Recalculate offset
			$(active_ranked_choice).data('initial-mouse-pos-x', slider_drag_square.offset().left);
		}
	}
}

function ranked_choice_document_mouse_up_event(event) {
	$(document).removeData('active-ranked-choice');
}

function ranked_choice_get_alternative(ranked_choice, alternative_index) {
	var alternative = ranked_choice_get_alternatives_list(ranked_choice).children('li:nth-child(' + alternative_index + ')');

	if (alternative.length === 1) {
		return alternative[0];
	} else {
		return null;
	}
}

function ranked_choice_get_alternative_position(alternative) {
	return parseInt(alternative.attr(ranked_choice_data.attribute('ALTERNATIVE_POSITION')));
}

function ranked_choice_get_alternative_text(alternative) {
	return $(alternative).find(ranked_choice_data.selector('ALTERNATIVE_TEXT')).text();
}

function ranked_choice_set_alternative_position(ranked_choice, alternative, position) {
	var alternative_offset = ((position-1) / (ranked_choice_get_slider_bar_steps(ranked_choice)-1)) * 100;

	alternative.attr('data-alternative-position', position);
	alternative.css('left', Math.round(alternative_offset) + '%');
}

function ranked_choice_get_alternatives_positions(ranked_choice) {
	var alternatives_positions = new Array();

	ranked_choice_get_alternatives(ranked_choice).each(function(index, alternative) {
		alternatives_positions.push(ranked_choice_get_alternative_position(alternative));
	});

	return alternatives_positions;
}

function ranked_choice_get_slider_bar(ranked_choice) {
	return ranked_choice.children('.ranked-choice-slider-bar');
}

function ranked_choice_get_slider_bar_steps(ranked_choice) {
	return parseInt(ranked_choice.attr(ranked_choice_data.attribute('SLIDER_STEPS')));
}

function ranked_choice_set_slider_bar_steps(ranked_choice, steps) {
	ranked_choice.attr(ranked_choice_data.attribute('SLIDER_STEPS'), steps);
}

function ranked_choice_move_alternative(alternative, direction) {
	if (direction == -1 || direction == 1) {
		var ranked_choice_slider_bar_steps = ranked_choice_get_slider_bar_steps(alternative.closest(ranked_choice_data.selector('RANKED_CHOICE')));
		var alternative_new_position = ranked_choice_get_alternative_position(alternative) + direction;

		if (alternative_new_position < 1 || alternative_new_position > ranked_choice_slider_bar_steps) {
			return false;
		} else {
			ranked_choice_set_alternative_position(alternative.closest(ranked_choice_data.selector('RANKED_CHOICE')), alternative, alternative_new_position);
			return true;
		}
	} else {
		return false;
	}
}

function ranked_choice_get_alternatives_list(ranked_choice) {
	return ranked_choice.children(ranked_choice_data.selector('ALTERNATIVES_LIST'));
}

function ranked_choice_get_alternatives(ranked_choice_element) {
	return $(ranked_choice_element)
			.closest(ranked_choice_data.selector('RANKED_CHOICE'))
			.find(ranked_choice_data.selector('ALTERNATIVES_LIST')).children('li');
}

function ranked_choice_update_alternatives_positions(ranked_choice) {
	var ranked_choice_alternatives_list = ranked_choice.children('.ranked-choice-alternatives-list');

	ranked_choice_alternatives_list.children('li').each(function(index, alternative) {
		var alternative_slider_drag_handle = $(alternative).find('.ranked-choice-alternative-slider-drag-handle');
		var alternative_polygon = $(alternative).find('.ranked-choice-alternative-polygon');
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
	var new_alternative_polygon = $(document.createElement('div')).attr('class', 'ranked-choice-alternative-polygon');
	var new_alternative_slider_drag_handle = $(document.createElement('button')).attr({'class': 'ranked-choice-alternative-slider-drag-handle', 'type': 'button'});
	var enclosing_div = $(document.createElement('div')).attr('class', 'ranked-choice-enclosing-div');
	var new_alternative_remove_button = $(document.createElement('button')).attr({
		'class': 'ranked-choice-alternative-remove-button',
		'type': 'button',
		'data-toggle': 'tooltip',
		'data-placement': 'right',
		'data-container': 'body',
		'title': 'Ta bort alternativ'
	}).tooltip();

	if (typeof(alternative_data) === 'string') {
		new_alternative_text.html(alternative_data);
	} else if (typeof(alternative_data) === 'object' && alternative_data !== null) {
		new_alternative_text.html(alternative_data.text);

		if (alternative_data.removable === false) {
			new_alternative_remove_button = undefined;
		}

		if (alternative_data.editable === false) {
			new_alternative_text.attr({'contenteditable': 'false', 'data-editable': 'false'});
		}

		if (typeof(alternative_data.font) === 'object' && alternative_data.font !== null) {
			if (alternative_data.font.size !== null) {
				new_alternative_text.css('font-size', alternative_data.font.size);
			}

			if (alternative_data.font.weight !== null) {
				new_alternative_text.css('font-weight', alternative_data.font.weight);
			}
		}
	} else {
		new_alternative_text.text(ranked_choice_data.constant('DEFAULT_ALTERNATIVE_TEXT'));
	}

	$(enclosing_div).prepend(new_alternative_text, new_alternative_remove_button);
	$(new_alternative).append(enclosing_div, new_alternative_polygon, new_alternative_slider_drag_handle);

	if (typeof(alternative_position) === 'undefined') {
		ranked_choice_set_alternative_position(ranked_choice, new_alternative, ranked_choice_data.attribute('DEFAULT_ALTERNATIVE_POSITION'));
	} else {
		ranked_choice_set_alternative_position(ranked_choice, new_alternative, alternative_position);
	}

	ranked_choice_alternatives_list.append(new_alternative);

	ranked_choice_update_alternatives_positions(ranked_choice);
	ranked_choice_update_slider_bar(ranked_choice);

	return new_alternative;
}

function ranked_choice_remove_alternative(alternative) {
	if (alternative == null || $(alternative).parent(ranked_choice_data.selector('ALTERNATIVES_LIST')).length == 0) {
		return false;
	} else {
		var ranked_choice = alternative.closest('.ranked-choice');
		alternative.find('.ranked-choice-alternative-remove-button').tooltip('destroy');
		alternative.remove();
		ranked_choice_update_alternatives_positions(ranked_choice);
		ranked_choice_update_slider_bar(ranked_choice);
		return true;
	}
}