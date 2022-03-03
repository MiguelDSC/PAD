/**
 * Responsible for handling the actions happening on welcome view
 * For now it uses the roomExampleRepository to get some example data from server
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
class WelcomeController {
    constructor() {
        this.roomExampleRepository = new RoomExampleRepository();

        $.get("views/welcome.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
        console.log("kan je me zien")


    }

    //Called when the home.html has been loaded
    setup(data) {
        //Load the welcome-content into memory
        this.welcomeView = $(data);

        //Set the name in the view from the session
        const username = sessionManager.get("username");
        this.welcomeView.find(".name").html(username);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.welcomeView);

        this.fetchRooms(1256);

        //display random greeting sentence
        const greetingSentence = this.pickRandomGreeting();
        this.welcomeView.find("#welkom-text").html(`${greetingSentence} ${username}`);
        this.fitText();

        console.log(data);

    }

    /**
     * async function that retrieves a kamer by its id via repository
     * @param roomId the room id to retrieve
     */
    async fetchRooms(roomId) {
        const exampleResponse = this.welcomeView.find(".example-response");
        try {
            //await keyword 'stops' code until data is returned - can only be used in async function
            const roomData = await this.roomExampleRepository.get(roomId);

            exampleResponse.text(JSON.stringify(roomData, null, 4));
        } catch (e) {
            console.log("error while fetching rooms", e);

            //for now just show every error on page, normally not all errors are appropriate for user
            exampleResponse.text(e);
        }
    }

    //Called when the login.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }


}