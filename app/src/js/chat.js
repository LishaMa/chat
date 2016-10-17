window.chat = (function ($) {
    function Message(id, msg) {
        var date = new Date();
        var ms = date.getTime();
        return {
            id: id,
            content: msg,
            ms: ms,
            deleted: false
        };
    }
    Message.create = function(id, msg) {
        if (Number.isInteger(id) && id>=0 && typeof msg === "string" && msg.length > 0) {
            return new Message(id, msg);
        } else {
            return null;
        }
    };
    var testUser = /^\w+$/;

    return {
        version: "0.0.1",
        members: null,
        messages: null,
        id: -1,
        user: "",
        signOn: function () {
            this.updateMembers();
            this.updateUser();
            this.updateMessages();
            this.setUpWatcher();
        },
        updateMembers: function () {
            var members = JSON.parse(localStorage.getItem("members"));
            if (this.isValidMembers(members)) {
                this.members = members;
            } else {
                this.members = ['system'];
                localStorage.setItem("members",JSON.stringify(this.members));
            }
        },
        isValidMembers: function (members) {
            return (members && Array.isArray(members));
        },
        validateMembers: function () {
            if (!this.isValidMembers(this.members)){
                this.updateMembers();
            }
            return this.members.length;
        },
        updateUser: function () {
            var user = sessionStorage.getItem('user');
            var id = this.getUserId(user);
            if (id>-1) {
                this.user = user;
                this.id = id;
            } else {
                this.user = this.createNewUser();
            }
        },
        getUserId: function (user) {
            if (this.isValidUser(user)) {
                this.validateMembers();
                return $.inArray(user, this.members);
            }
            return -10;

        },
        isValidUser: function (user) {
            return (typeof user === "string" && user.length>4 && user.length<21 && testUser.test(user));
        },
        createNewUser: function () {
            var prefix = "user",
                user = "",
                id = 0;
            for (var i=1; i<999999; i++) {
                user = prefix + i;
                id = this.getUserId(user);
                if (id===-1) {
                    sessionStorage.user = user;
                    this.id = this.members.length;
                    this.members.push(user);
                    localStorage.setItem("members",JSON.stringify(this.members));
                    return user;
                }
            }
            throw new Error("Can not create new user.");
        },
        changeUserName: function (name) {
            if (name === this.user) {
                return true;
            }
            if (this.isValidUser(name) && this.getUserId(name)===-1) {
                this.user = name;
                sessionStorage.setItem('user', name);
                this.members[this.id] = name;
                localStorage.setItem("members",JSON.stringify(this.members));
                return true;
            }
            return false;
        },
        updateMessages: function () {
            var messages = JSON.parse(localStorage.getItem("messages"));
            if (this.isValidMessages(messages)) {
                this.messages = messages;
            } else {
                this.messages = [];
                var msg = Message.create(0,"Welcome to Chat Room!");
                var max = this.validateMembers();
                if (this.isValidMsg(msg,max)) {
                    this.messages.push(msg);
                }
                localStorage.setItem("messages", JSON.stringify(this.messages));
            }

        },
        isValidMessages: function (messages) {
            var max = this.validateMembers();
            var isValid = true;
            var msg = null;
            if (messages && Array.isArray(messages)) {
                for (var i=0; i<messages.length; i++) {
                    msg = messages[i];
                    if (this.isValidMsg(msg, max)) {
                        continue;
                    }
                    isValid = false;
                    break;
                }
            } else {
                isValid = false;
            }
            return isValid;
        },
        isValidMsg: function (msg, max) {
            return (msg && typeof msg === "object" &&
                Number.isInteger(msg.id) &&
                msg.id>-1 && msg.id<max &&
                typeof msg.content === "string" &&
                Number.isInteger(msg.ms) && msg.ms>0
            );
        },
        postMsg: function(message) {
            var msg = Message.create(this.id, message);
            var max = this.validateMembers();
            if (this.isValidMsg(msg,max)) {
                this.messages.push(msg);
                localStorage.setItem("messages", JSON.stringify(this.messages));
                return this.messages.length;
            }
            return -1;
        },
        setUpWatcher: function () {
            $(window).on("storage", function (e) {
                var event = e.originalEvent;
                var storageArea = event.storageArea;
                if (storageArea === localStorage) {
                    var key = event.key;
                    var newValue = event.newValue;
                    var oldValue = event.oldValue;
                    window.chat.updateFromLocalStorage(key, newValue, oldValue);
                }
            })
        },
        updateFromLocalStorage: function (key, newValue, oldValue) {
            if (key==="members") {
                this.updateMembers();
                window.view.populateMembers();
            } else if (key==="messages") {
                this.updateMessages();
                window.view.populateMsgList();
            } else if (typeof key === "string" && key.length>0) {
                //Unknown case
                console.log("Unknown key: " + key);
            } else if (key===null) {
                //localStorage.clear() has been called.
                //restart the app
                sessionStorage.clear();
                window.setupChat();
            }
        },
        canModifyMsg: function (msgId) {
            if (this.isMsgAvailable(msgId)) {
                var msg = this.messages[msgId];
                if (msg.id === this.id) {
                    return msg;
                }
            }
            return null;
        },
        isMsgAvailable: function (msgId) {
            return (Number.isInteger(msgId) && msgId>=0 && msgId<this.messages.length);
        },
        deleteMsg: function(msgId){
            var msg = this.canModifyMsg(msgId);
            if (msg) {
                msg.deleted = true;
                localStorage.setItem("messages", JSON.stringify(this.messages));
                return true;
            }
            return false;
        },
        saveMsg: function (msgId, content) {
            var msg = this.canModifyMsg(msgId);
            if (msg) {
                msg.content = content;
                localStorage.setItem("messages", JSON.stringify(this.messages));
                return msg;
            }
            return null;
        }
    }
})(jQuery);
