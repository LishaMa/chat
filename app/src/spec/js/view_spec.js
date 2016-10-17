describe("View Spec", function() {
    var foo = 1;
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = ".";  // path to your templates
        jasmine.getFixtures().load('tpl.html');   // load a template
        sessionStorage.clear();
        localStorage.clear();
        chat.signOn();
        view.setupView();
        $("#user-input").jemoji({
            folder: 'src/emoji/images/basic/',
            navigation: window.innerWidth > 768,
            theme: 'blue'
        });
    });

    afterEach(function() {
        foo = 1;
    });

    it("User can post and can edit or delete it.", function() {
        var length = chat.postMsg("new post");
        if (length === chat.messages.length) {
            view.appendMsg(length-1, chat.messages[length-1]);
        }
        var id = "#msg-" + (length-1);
        var post = $(id);
        expect($("#msg-list").children.length).toBe(length);
        expect(post).toContainElement('span.edit');
        expect(post).toContainElement('span.delete');
        expect(post.find('p')).toContainText("new post");
    });

    it("Others' posts should not have edit or delete button.", function() {
        var post = $('#msg-0');
        expect(post).not.toContainElement('span.edit');
        expect(post).not.toContainElement('span.delete');
    });

    it("User can edit name.", function() {
        expect($("#user-container")).toContainElement('span.edit');
    });

    it("Message should be updated.", function() {
        chat.messages[0].content = "welcome";
        view.updateMsg(0);
        var post = $('#msg-0');
        expect(post.find('p')).toContainText("welcome");
    });

    it("New message should be updated.", function() {
        var msg = chat.MSG(0,'welcome again');
        chat.messages.push(msg);
        var id = chat.messages.length-1;
        view.appendMsg(id, msg);
        var post = $('#msg-'+id);
        expect(post.find('p')).toContainText("welcome again");
    });

    it("New user should be updated.", function() {
        chat.members.push("new_user");
        view.addNewMember();
        var id = chat.members.length - 1;
        var user = $("#c-member-container").find('.cu'+id);
        expect(user.length).toBe(1);
    });

});
