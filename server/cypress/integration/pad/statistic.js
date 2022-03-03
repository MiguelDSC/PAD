// Test for statistics, made by Rick
describe('Statistics', function () {
    beforeEach(() => {
        cy.visit("http://localhost:8080")

        const session = {"username" : "rick"};
        session['userID'] = 1;
        localStorage.setItem("session", JSON.stringify(session));

        cy.server();
    })

    it("Check if the login works", () => {
        // Start faker
        cy.server();

        cy.get("#exampleInputUsername").type("test");

        //Find the field for the password and type the text "test".
        cy.get("#exampleInputPassword").type("test");

        //Find the button to login and click it.
        cy.get(".login-form button").click();
    });

    it("Check if you can go to statistics and go left", () => {
        cy.visit("http://localhost:8080/#statistics");

        //Check if an progression bar exists.
        cy.get(".nav-link[data-controller='statistics']").click();

        cy.get(".arrow-normal-date__left").click();
    })

    it("Check if you can go to advanced statis", () => {
        cy.visit("http://localhost:8080/#statistics");
        cy.get(".advanced-stats").click();
    });
});