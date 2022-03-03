// Test for social page, made by Miguel
describe('Social', function () {
    beforeEach(() => {
        cy.visit("http://localhost:8080")

        const session = {"username": "test"};
        session['userID'] = 1;

        localStorage.setItem("session", JSON.stringify(session));
        cy.server()
    })

    it("#check if my message box is loaded.", () => {

        //Visit the social page
        cy.visit("http://localhost:8080/#social");

        //Check if the message box exists.
        expect(cy.get(".message"))

    });

    it("#2 - Check if share message works", () => {

        //Visit the social page
        cy.visit("http://localhost:8080/#social");

        //write text in the text box
        const text = "random-test";
        cy.get("#message-content").type(text);

        //press submit my text
        cy.get(".btn-submit").click();
        //check if text appears in textbox
        expect(cy.get(".message").contains(text))

    });


});