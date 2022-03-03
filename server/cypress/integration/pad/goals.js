// Test for goals, made by Kevin
describe('Goals', function () {
    beforeEach(() => {
        cy.visit("http://localhost:8080")

        const session = {"username": "test"};
        session['userID'] = 1;

        localStorage.setItem("session", JSON.stringify(session));
        cy.server()
    })

    it("#1 Check if element is loaded on the goal screen.", () => {
        //Visit the goals page
        cy.visit("http://localhost:8080/#goals");

        //Check if an progression bar exists.
        expect(cy.get(".pad-progress-container"))

    });

    it("#2 - Check if total goal is displayed on the screen", () => {

        const testTotalValue = 50;

        cy.route("POST", "/rehabilitator/goal/total", {0: {"pam_goal_total": testTotalValue}}).as("pamTotal");

        //Visit the goals page
        cy.visit("http://localhost:8080/#goals");
        cy.wait("@pamTotal");

        cy.get("@pamTotal").should((xhr) => {
            //Check if an progression bar exists.
            expect(cy.get(".legend-total").contains(testTotalValue))
        })
    });

    it("#3 - Check if page responds correctly if pam total request fails.", () => {

        //Create an incorrect request
        cy.route("POST", "/rehabilitator/goal/total", "").as("pamTotal");

        //Visit the goals page
        cy.visit("http://localhost:8080/#goals");
        cy.wait("@pamTotal");

        //Check if the element is hidden.
        cy.get(".total-li").should(('be.hidden'));

    });

});