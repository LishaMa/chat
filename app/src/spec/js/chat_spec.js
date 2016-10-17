describe("Chat Spec", function() {
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

    });

    //Users
    it("User id should be greater than 0.", function() {
        expect(chat.id).toBeGreaterThan(0);
    });

    it("Length of user name should be greater than 4.", function() {
        expect(chat.user.length).toBeGreaterThan(4);
    });
    it("User input should be empty.", function() {
        expect($("#user-input")).toBeEmpty();
    });

    it("User name should not be changed with invalid input: length from 5 to 20, only letters, digits, underline are allowed.", function() {
        expect(chat.changeUserName()).toBe(false);
        expect(chat.changeUserName(null)).toBe(false);
        expect(chat.changeUserName(true)).toBe(false);
        expect(chat.changeUserName(false)).toBe(false);
        expect(chat.changeUserName(123456)).toBe(false);
        expect(chat.changeUserName('invalid@')).toBe(false);
        expect(chat.changeUserName('')).toBe(false);
        expect(chat.changeUserName('shor')).toBe(false);//short
        expect(chat.changeUserName('a_very_long_name_is_n')).toBe(false);//long
    });

    it("User name should be changed", function() {
        expect(chat.changeUserName('changed')).toBe(true);
    });
    it("User name should not be changed to existed name. Example: system", function() {
        expect(chat.changeUserName('system')).toBe(false);
    });

    //Message
    it("User can not post empty message.", function() {
        expect(chat.postMsg('')).toBe(-1);
    });

    it("User can post none empty message.", function() {
        var result = chat.postMsg('none empty');
        var msg = chat.messages[result-1];
        expect(result).toBeGreaterThan(-1);
        expect(msg.id).toBe(chat.id);
        expect(msg.content).toBe('none empty');
    });

    it("User can not modify messages not created by itself.", function() {
        expect(chat.saveMsg(0, "can not modify others' message")).toBe(null);
    });

    it("User can not save empty message.", function() {
        var result = chat.postMsg('none empty');
        expect(chat.saveMsg(result-1,'')).toBe(null);
    });

    it("User can modify message created by itself with none empty value.", function() {
        var result = chat.postMsg('none empty');
        var changed = chat.saveMsg(result-1, 'changed');
        expect(changed.content).toBe('changed');
    });

    it("User can not delete others' message.", function() {
        expect(chat.deleteMsg(0)).toBe(false);
    });

    it("User can delete message created by itself", function() {
        var length = chat.postMsg('none empty');
        var id = length - 1;
        var result = chat.deleteMsg(id);
        expect(result).toBe(true);
        expect(chat.messages[id].deleted).toBe(true);
    });

});
