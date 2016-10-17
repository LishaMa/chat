(function ($, window) {
    emojify.setConfig({img_dir: "src/emoji/images/basic"});
    window.view = {
        chat: null,
        switcher: null,
        chatContainer: null,
        memberContainer: null,
        memberList: null,
        mainContainer: null,
        msgList: null,
        inputContainer: null,
        cTextBox: null,
        editor: null,
        setupView: function () {
            this.initilizeHandles();
            this.populateViews();
        },
        initilizeHandles: function () {
            this.chat = window.chat;
            this.chatContainer = $("#chat-container");
            this.memberContainer = $("#c-member-container");
            this.mainContainer = $("#c-main-container");
            this.inputContainer = $("#c-input-container");
            this.memberList = $("#member-list");
        },
        populateViews: function () {
            this.populateMembers();
            this.populateMsgList();
            this.setupChatInput();
            this.setupSwitcher();
            setTimeout(function () {
                window.view.scrollToBottom();
            }, 0);
        },
        populateMembers: function () {
            var members = this.chat.members;
            var styles = '';
            var ul = '<ul>';
            var user;
            for (var i=0; i<members.length; i++) {
                styles = styles + '.cu' + i + '::before {content:"' + members[i] + '"}\n';
                if (i===this.chat.id) {
                    user = this.buildUser(i, members[i]);
                    continue;
                }
                ul = ul + '<li><span class="user-name cu' + i + '"></span></li>';
            }
            ul = ul + '</ul>';
            this.memberList.html(styles);
            this.memberContainer.html(ul).find('ul').prepend(user);
        },
        buildUser: function (id, name) {
            var li = $('<li><div id="user-container"><div><span>You:</span></div>' +
                '<div><span class="user-name cu' +
                id + '"></span><span class="edit"></span></div></div>' +
                '<div id="name-input">' +
                '<div><button id="change-name">Change</button>' +
                '<button id="cancel-change">Cancel</button></div>' +
                '<input id="name-field" minlength="5" maxlength="20" />' +
                '</div></li>');
            var nameInput = li.find('#name-input');
            nameInput.on("click", "#cancel-change", function (event) {
                window.view.cancelChangeName(event);
            }).on("click", "#change-name", function (event) {
                window.view.changeName(event);
            }).on("keyup", "#name-field", function (event) {
                var ta = $(event.target);
                var value = ta.val();
                if (value.length>4 && window.chat.isValidUser(value) &&
                    (value === window.chat.user || window.chat.getUserId(value) === -1)){
                    ta.prev().children().first().attr('disabled', false);
                } else {
                    ta.prev().children().first().attr('disabled', true);
                }
            });
            li.on("click", '.edit', function (event) {
                var list = $(event.target).closest('li');
                var container = list.children('#user-container');
                container.hide();
                var nameInput = list.children('#name-input');
                nameInput.show();
                list.find("#name-field").val(window.chat.user).focus();
            });
            return li;
        },
        cancelChangeName: function (event) {
            var li = $(event.target).closest('li');
            var nameInput = li.children('#name-input');
            nameInput.hide();
            var container = li.children('#user-container');
            container.show();
        },
        changeName: function (event) {
            var li = $(event.target).closest('li');
            var value = li.find("#name-field").val();
            if (value === this.chat.user) {
                this.cancelChangeName();
            }
            if (this.chat.changeUserName(value)) {
                //restore state
                this.populateMembers();
            } else {
                this.cancelChangeName();
            }
        },
        populateMsgList: function () {
            var id = this.chat.id;
            var messages = this.chat.messages;
            this.msgList = $('<ul id="msg-list"></ul>');
            var list = '';
            for (var i=0; i<messages.length; i++) {
                var msg = messages[i];
                if (msg.deleted) {
                    continue;
                }
                list = list + this.buildMsgView(i, msg, msg.id === id);
            }
            this.mainContainer.html('');
            this.msgList.append($.parseHTML(list)).on('click','.delete', function(event){
                window.view.deleteMsg(event);
            }).on('click', '.edit', function (event) {
                window.view.editMsg(event);

            }).appendTo(this.mainContainer);
            emojify.run(document.getElementById('msg-list'));
            this.scrollToBottom();
        },
        deleteMsg: function (event) {
            var li = $(event.target).closest('li');
            var msgId = parseInt(li.attr('id').split('-')[1]);
            if (this.chat.deleteMsg(msgId)){
                li.remove();
            }
        },
        editMsg: function (event) {
            var li = $(event.target).closest('li');
            var msgId = parseInt(li.attr('id').split('-')[1]);
            var msg = this.chat.canModifyMsg(msgId);
            if (msg) {
                if (!this.editor) {
                    this.buildEditor();
                }
                if (jQuery.contains(document, this.editor[0])) {
                    return;
                }
                var textArea = this.editor.find('#editor');
                textArea.val(msg.content);
                var content = li.children().hide();
                li.append(this.editor);
                this.inputContainer.hide();
                this.chatContainer.css('padding-bottom', 0);
                li[0].scrollIntoView(false);
                setTimeout(function () {
                    $('#editor').focus();
                },0);
            }
        },
        buildEditor: function () {
            var ed = '<div><div id="jec"></div><div><button id="save">Save</button>' +
                '<button id="cancel">Cancel</button></div>' +
                '<textarea style="width: 100%;" rows="2" id="editor" ' +
                'placeholder="Enter your message."' +
                ' maxlength="200"></textarea></div>';
            this.editor = $(ed).on('click', '#save', function (event) {
                window.view.saveMsg(event);
            }).on('click', '#cancel', function (event) {
                window.view.cancelEditing(event);
            });
            this.editor.find("#editor").on('keydown', function (event) {
                var ta = $(event.target);
                var value = ta.val();
                if (value===''){
                    ta.prev().children().first().attr('disabled', true);
                } else {
                    ta.prev().children().first().attr('disabled', false);
                }
                if (event.which === 13 && value!=='' && !ta.jemoji('isOpen')) {
                    window.view.saveMsg(event);
                }
            }).jemoji({
                folder: 'src/emoji/images/basic/',
                container: this.editor.children().first()[0],
                navigation: window.innerWidth > 768,
                theme: 'blue'
            });
        },
        saveMsg: function (event) {
            var li = $(event.target).closest('li');
            var textArea = li.find('textarea');
            var content = textArea.val();
            if (content!=='') {
                var msgId = parseInt(li.attr('id').split('-')[1]);
                var msg = this.chat.saveMsg(msgId, content);
                if (msg) {
                    var newLi = $.parseHTML(this.buildMsgView(msgId, msg, true));
                    this.cancelEditing();
                    li.replaceWith(newLi);
                    emojify.run(document.getElementById('msg-'+msgId));
                }
            }
        },
        cancelEditing: function (event) {
            var li = this.editor.closest('li');
            this.editor.find("#editor").jemoji('close');
            this.editor.detach();
            li.children().show();
            this.inputContainer.show();
            this.chatContainer.css('padding-bottom', '');
        },
        buildMsgView: function (index, msg, isOwner) {
            var time = new Date(msg.ms);
            var tm = ('0' + time.getHours()).slice(-2)+':'+('0' + time.getMinutes()).slice(-2);
            var buttons = isOwner?'<span class="delete"></span><span class="edit"></span>':'';
            return '<li id="msg-' + index + '"><div><div class="msg-title">' +
                '<span class="user-name cu' + msg.id + '"></span>' +
                '<span class="time">' + tm +'</span>' +
                buttons +
                '</div><p>' +
                msg.content +
                '</p>' +
                '</div></li>';
        },
        appendMsg: function (index, msg) {
            this.msgList.append($.parseHTML(this.buildMsgView(index, msg, msg.id === this.chat.id)));
            emojify.run(document.getElementById('msg-'+index));
        },
        setupChatInput: function () {
            this.cTextBox = $('#user-input')
                .on("keydown", function (event) {
                    if (event.which === 13 ) {
                        window.view.post(event);
                    }
                });
        },
        post: function (event) {
            if (this.cTextBox.jemoji('isOpen')) {
                return;
            }
            var text = this.cTextBox.val();
            if (typeof text === "string" && text.length>0 ) {
                var length = this.chat.postMsg(text);
                if (length === this.chat.messages.length) {
                    this.appendMsg(length-1, this.chat.messages[length-1]);
                    this.cTextBox.val('');
                    this.scrollToBottom();
                }
            }
        },
        scrollToBottom: function () {
            this.mainContainer.scrollTop(this.mainContainer.prop('scrollHeight'));
            this.chatContainer.scrollTop(this.chatContainer.prop('scrollHeight'));
        },
        scrollToTop: function () {
            this.mainContainer.scrollTop(0);
            this.chatContainer.scrollTop(0);
        },
        setupSwitcher: function () {
            this.switcher = $("#switch");
            this.switcher.on('click', function (event) {
                    window.view.switchView(event);
                });
        },
        switchView: function (event) {
            if (this.switcher.attr('src')==="src/images/members.svg") {
                this.switcher.attr('src', "src/images/chat.svg");
                this.mainContainer.hide();
                this.inputContainer.hide();
                this.memberContainer.show();
                this.scrollToTop();
            } else if (this.switcher.attr('src')==="src/images/chat.svg") {
                this.switcher.attr('src', "src/images/members.svg");
                this.memberContainer.hide();
                this.mainContainer.show();
                this.inputContainer.show();
                this.scrollToBottom();
            } else {
                this.switcher.attr('src', "src/images/members.svg");
                this.memberContainer.hide();
                this.mainContainer.show();
                this.inputContainer.show();
            }
        }
    }
})(jQuery, window);
