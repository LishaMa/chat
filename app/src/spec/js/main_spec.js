describe("Chat Spec", function() {
    var foo = 1;
    beforeEach(function() {
        sessionStorage.clear();
        localStorage.clear();
        chat.signOn();
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
