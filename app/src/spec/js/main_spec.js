describe("Chat Spec", function() {
    var foo = 1;
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = ".";  // path to your templates
        jasmine.getFixtures().load('tpl.html');   // load a template
        sessionStorage.clear();
        localStorage.clear();
        chat.signOn();
        view.setupView();
    });

    afterEach(function() {
        foo = 1;
    });

    it("User id should be greater than 0.", function() {
        expect(chat.id).toBeGreaterThan(0);
    });

    it("Length of user name should be greater than 4.", function() {
        expect(chat.user.length).toBeGreaterThan(4);
    });
    it("user input should be empty.", function() {
        expect($("#user-input")).toBeEmpty();
    });

    describe("nested inside a second describe", function() {
        var bar;

        beforeEach(function() {
            bar = 1;
        });

        it("can reference both scopes as needed", function() {
            expect(foo).toEqual(bar);
        });
    });
});
