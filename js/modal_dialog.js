function showOKDialog(title, message) {
	$('.modal-dialog-button').css('display', 'none');
	$('#modal-dialog-btn-ok').css('display', 'inline');
	
	showModalDialog(title, message);
	
	$('#modal-dialog-btn-ok').focus();
}

function showOKCancelDialog(title, message, okHandler) {
	$('.modal-dialog-button').css('display', 'none');
	$('#modal-dialog-btn-ok, #modal-dialog-btn-cancel').css('display', 'inline');
	$('#modal-dialog-btn-ok').click(okHandler);
	
	showModalDialog(title, message);
	
	$('#modal-dialog-btn-cancel').focus();
}

function showModalDialog(title, message) {
	$('#modal-dialog-title').text(title);
	$('#modal-dialog-message').text(message);
	$('#modal-dialog').css({'height': '100%', 'opacity': '1'});
	$('#modal-dialog-content').css('left', 'calc(50% - ' + $('#modal-dialog-content').outerWidth()/2 + 'px)');
	$('#modal-dialog-content').css('top', 'calc(50% - ' + $('#modal-dialog-content').outerHeight() + 'px)');
}
		
function closeModalDialog(event) {
	var target_id = $(event.target).attr('id');
	
	if (target_id == 'modal-dialog' || 
		target_id == 'modal-dialog-exit' || 
		target_id == 'modal-dialog-btn-ok' ||
		target_id == 'modal-dialog-btn-cancel') {
			$(event.target).closest('#modal-dialog').css({'height': '0', 'opacity': '0'});
	}
}