$(document).ready(function() {
    $('.select-single > ul.options > li').click(onSelectOptionClick);
    $('.select-single > ul.options > li > span.select-remove-option').click(removeAlternative);
    $('.select-single > ul.options li.select-add-option, .select-multi > ul.options > li.select-add-option').mousedown(addNewListAlternative);

    $('.select-single > div:first-child').focusout(function(event) {
      console.log("hej!");
      if ($(event.relatedTarget).hasClass('select-single') || $(event.relatedTarget).hasClass('select-remove-option')) {
        return;
      }

      $(this).siblings('ul.options').removeClass('menu-open');
    }).mousedown(function() {
        $(this).siblings('ul.options').toggleClass('menu-open');
    });

    $('.select-multi > div:first-child').mousedown(function() {
        $(this).siblings('ul.options').toggleClass('menu-open');
    }).focusout(function(event) {
        if ($(event.relatedTarget).hasClass('select-multi') || $(event.relatedTarget).hasClass('select-remove-option') || $(event.relatedTarget).parent('ul.options').length == 1) {
          return;
        }

        $(this).siblings('ul.options').removeClass('menu-open');
    });

    $('.select-single > .options > li > span').focusout(onSelectOptionFocusOut);


  $('.select-single, .select-multi').keydown(function(event) {
    if (event.keyCode == 13) {
      // Stop word break from happening
      event.preventDefault();
    } else if (event.keyCode == 38) {
      // Up arrow
      var selected_item = parseInt($(this).data('selected-item'));

      if ((selected_item-1) > 0) {
        var new_active_item = $(this).children('ul.options').children('li:nth-child(' + (selected_item-1) + ')');
        setSelectedItem($(this).children('ul.options'), new_active_item);
      }
    } else if (event.keyCode == 40) {
      // Down arrow
      var selected_item = parseInt($(this).data('selected-item'));

      if ($(this).children('ul.options').children('li').length > (selected_item+1)) {
        var new_active_item = $(this).children('ul.options').children('li:nth-child(' + (selected_item+1) + ')');
        setSelectedItem($(this).children('ul.options'), new_active_item);
      }
    }
  });
});

function previewSelects(preview) {
  if (preview == true) {
    $('.select-single, .select-multi').removeClass('editable');
    $('.select-single > ul.options, .select-multi > ul.options').removeClass('menu-open');
    $('.select-single > ul.options > li:not(:last-child) > span.text, .select-multi > ul.options > li:not(:last-child) > span.text').attr('contenteditable', 'false');
    $('.select-single > .options > li, .select-multi > .options > li').css('cursor', 'default').attr('tabindex', '0');
    $('.select-single > .options > li > span.select-remove-option, .select-multi > .options > li > span.select-remove-option').css('display', 'none');
    $('.select-single > .options > li:last-child, .select-multi > .options > li:last-child').addClass('hide-me');

    $('.select-single > div:first-child, .select-multi > div:first-child').each(function(index, element) {
      updateAlternativesListWidth($(this).parent('div'));
      $(this).attr('data-initial-text', $(this).text());
      $(this).children('span.text').attr('contenteditable', 'false');
    });
  } else {
    $('.select-single, .select-multi').addClass('editable');
    $('.select-single > ul.options > li.active, .select-multi > ul.options > li.active').removeClass('active');
    $('.select-single > .options > li:not(:last-child) > span.text, .select-multi > .options > li:not(:last-child) > span.text').attr('contenteditable', 'true');
    $('.select-single > .options > li, .select-multi > .options > li').css('cursor', 'auto');
    $('.select-single > .options > li > span.select-remove-option, .select-multi > .options > li > span.select-remove-option').css('display', 'inline-block');
    $('.select-single > .options > li:last-child, .select-multi > .options > li:last-child').removeClass('hide-me');

    $('.select-single > div:first-child, .select-multi > div:first-child').each(function(index, element) {
      $(this).children('span.text').text($(this).attr('data-initial-text')).attr('contenteditable', 'true');
    });
  }
}

function onSelectOptionFocusIn() {

}

function onSelectOptionFocusOut(event) {
  if ($(event.relatedTarget).hasClass('select-single')
      || $(event.relatedTarget).hasClass('remove')
      || $(event.relatedTarget).hasClass('select-add-option')) {
    return;
  }

  console.log(event.relatedTarget);

  if (!$(event.relatedTarget).hasClass('text')) {
    $(this).parent('li').parent('ul.options').removeClass('menu-open');
  }
}

function onSelectOptionClick() {
  var select_list = $(this).parent('ul.options').parent('div');

  if (select_list.hasClass('select-multi')) {
    $(this).toggleClass('active');

    var number_of_alternatives_chosen = $(this).parent('ul.options').children('li.active').length;

    $(this).parent('ul.options').siblings('div[tabindex="0"]').children('span.text').text(number_of_alternatives_chosen + ' alternativ valda');
  } else if (select_list.hasClass('select-single') && !select_list.hasClass('editable')) {
    $(this).parent('ul.options').children('li.active').removeClass('active');
    $(this).toggleClass('active');
    $(this).parent('ul.options').siblings('div').children('span.text').text($(this).children('span.text').text());
    $(this).parent('ul.options').removeClass('menu-open');
  }
}

function setSelectedItem(select_list, new_active_item) {
  select_list.children('li.active').removeClass('active');
  new_active_item.addClass('active');
  select_list.parent().data('selected-item', new_active_item.index()+1);
  select_list.siblings('div:first-child').children('span.text').text(new_active_item.children('span.text').text());
}

function removeAlternative() {
  var select_list = $(this).parent('li').parent('ul.options').parent('div');

  $(this).tooltip('destroy');
  $(this).parent('li').remove();
  //updateAlternativesListWidth(select_list);
}

function updateAlternativesListWidth(select_list) {
  var current_width = select_list.children('div:first-child').children('span.text').outerWidth();
  var options_list_width = select_list.children('ul.options').outerWidth();

  select_list.children('div:first-child').css('min-width', Math.max(current_width, options_list_width) + 'px');
}

function addNewListAlternative() {
  var li = document.createElement('li');
  var span_text = document.createElement('span');
  var span_remove = document.createElement('span');
  $(span_text).addClass('text').attr({'contenteditable': 'true', 'spellcheck': 'false'});
  $(span_text).text('Alternativ');
  $(span_text).focusin(onSelectOptionFocusIn).focusout(onSelectOptionFocusOut);
  $(span_remove).addClass('select-remove-option');
  $(span_remove).attr({'tabindex': '0', 'data-toggle': 'tooltip', 'data-placement': 'right', 'title': 'Ta bort alternativ', 'data-container': 'body'});
  $(span_remove).text('×')
  li.appendChild(span_text);
  li.appendChild(span_remove);
  $(span_remove).click(removeAlternative).tooltip();

  $(this).before(li);

  $(li).click(onSelectOptionClick);

  $(this).parent('ul.options').scrollTop(0);
  var scroll_top = $(this).parent('ul.options').children('li:last-child').position().top;
  $(this).parent('ul.options').scrollTop(scroll_top);

  //$(span_text).focusin(onSelectOptionFocusIn);
  //$(span_text).focusout(onSelectOptionFocusOut);
}