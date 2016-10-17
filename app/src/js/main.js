
function setupChat() {
    window.chat.signOn();
    window.view.setupView();
    $('body').css('height', window.innerHeight);
    $("#user-input").jemoji({
        folder: 'src/emoji/images/basic/',
        navigation: window.innerWidth > 768,
        theme: 'blue'
    });
}

$(setupChat);
