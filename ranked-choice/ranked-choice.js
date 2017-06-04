"use strict";

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
	var ranked_choice = $(document.createElement('div')).attr({
		'class': 'ranked-choice',
		'data-slider-steps': steps
	});

	var ranked_choice_alternatives_list = $(document.createElement('ul')).attr('class', 'ranked-choice-alternatives-list');
	var ranked_choice_slider_bar = $(document.createElement('div')).attr('class', 'ranked-choice-slider-bar');

	ranked_choice.append(ranked_choice_alternatives_list, ranked_choice_slider_bar);

	if (typeof(update_slider_bar_function_callback) !== undefined) {
		ranked_choice_set_slider_bar_update_function_callback(ranked_choice, update_slider_bar_function_callback);
	} else {
		ranked_choice_set_slider_bar_update_function_callback(ranked_choice, function(){});
	}

	return ranked_choice;
}

function ranked_choice_update_slider_bar(ranked_choice) {
	var function_callback = ranked_choice.data('ranked-choice-update-function-callback');

	if (function_callback != undefined) {
		var slider_bar = ranked_choice_get_slider_bar(ranked_choice);
		var alternatives_list = ranked_choice_get_alternatives_list(ranked_choice);

		function_callback(slider_bar, alternatives_list);
	}
}

function ranked_choice_set_slider_bar_update_function_callback(ranked_choice, function_callback) {
	ranked_choice.data('ranked-choice-update-function-callback', function_callback);
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
	return Number(alternative.attr('data-alternative-position'));
}

function ranked_choice_get_alternative_text(alternative) {
	return $(alternative).find('.ranked-choice-alternative-text').text();
}

function ranked_choice_set_alternative_position(ranked_choice, alternative, position) {
	var alternative_offset = ((position-1) / (ranked_choice_get_slider_bar_steps(ranked_choice)-1)) * 100;

	alternative.attr('data-alternative-position', position);
	alternative.css('left', Math.round(alternative_offset) + '%');
}

function ranked_choice_get_alternatives_positions(ranked_choice) {
	var alternatives_positions = [];

	ranked_choice_get_alternatives(ranked_choice).each(function(index, alternative) {
		alternatives_positions.push(ranked_choice_get_alternative_position(alternative));
	});

	return alternatives_positions;
}

function ranked_choice_get_slider_bar(ranked_choice) {
	return ranked_choice.find('.ranked-choice-slider-bar');
}

function ranked_choice_get_slider_bar_steps(ranked_choice) {
	return Number(ranked_choice.attr('data-slider-steps'));
}

function ranked_choice_set_slider_bar_steps(ranked_choice, steps) {
	ranked_choice.attr('data-slider-steps', steps);
}

function ranked_choice_move_alternative(alternative, direction) {
	if (direction == -1 || direction == 1) {
		var ranked_choice_slider_bar_steps = ranked_choice_get_slider_bar_steps(alternative.closest('.ranked-choice'));
		var alternative_new_position = ranked_choice_get_alternative_position(alternative) + direction;

		if (alternative_new_position < 1 || alternative_new_position > ranked_choice_slider_bar_steps) {
			return false;
		} else {
			ranked_choice_set_alternative_position(alternative.closest('.ranked-choice'), alternative, alternative_new_position);
			return true;
		}
	} else {
		return false;
	}
}

function ranked_choice_get_alternatives_list(ranked_choice) {
	return ranked_choice.find('.ranked-choice-alternatives-list');
}

function ranked_choice_get_alternatives(ranked_choice_element) {
	return $(ranked_choice_element).closest('.ranked-choice').find('.ranked-choice-alternatives-list').children('li');
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
	var ranked_choice_alternatives_list = $(ranked_choice).find('.ranked-choice-alternatives-list');

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
		new_alternative_text.text('Alternativ');
	}

	$(enclosing_div).prepend(new_alternative_text, new_alternative_remove_button);
	$(new_alternative).append(enclosing_div, new_alternative_polygon, new_alternative_slider_drag_handle);

	if (typeof(alternative_position) === 'undefined') {
		ranked_choice_set_alternative_position(ranked_choice, new_alternative, 1);
	} else {
		ranked_choice_set_alternative_position(ranked_choice, new_alternative, alternative_position);
	}

	ranked_choice_alternatives_list.append(new_alternative);

	ranked_choice_update_alternatives_positions(ranked_choice);
	ranked_choice_update_slider_bar(ranked_choice);

	questionnaire_select_text_node(new_alternative_text.get(0));

	return new_alternative;
}

function ranked_choice_remove_alternative(alternative) {
	if (alternative == null || $(alternative).parent('.ranked-choice-alternatives-list').length == 0) {
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