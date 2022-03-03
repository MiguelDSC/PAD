/**
 * Controller responsible for all events in view and setting data
 *
 * @author Pim Meijer
 */
class HomeController extends CategoryController {

    assistantTitle = ["De eerste stap", "Een goed begin", "Einde is in zicht", "De nieuwe jij"];

    constructor() {
        super();
        this.loadView("views/home.html");
        this.userRepository = new UserRepository();
        this.pamRepository = new PamRepository();
        this.rehabilitatorRepository = new RehabilitatorRepository();
    }

    //Called when the login.html has been loaded.
    async setup(data) {
        //Set the navigation color to the correct CSS variable.
        this.updateCurrentCategoryColor("--color-category-home");
        //Set the navigation to the correct state.
        nav.setNavigationState(navState.User)
        //Load the login-content into memory..
        this.view = $(data);

        //Empty the content-div and add the resulting view to the page.
        $(".content").empty().append(this.view);

        const currentLoggedID = sessionManager.get("userID");
        const userData = await this.userRepository.getRehabilitatorInfo(currentLoggedID)

        //pam score motivatie
        const motivatiePam = await this.pamRepository.motivationGoal(currentLoggedID)

        //Getting the pam score
        const pam = await this.userRepository.getAll(currentLoggedID)

        let totalPointsEarned = 0;
        pam.forEach((e) => {
            for (let i = 0; i < e.quarterly_score.length; i++) {
                if (e.quarterly_score.charAt(i) != 0) {
                    let number = Number(e.quarterly_score.charAt(i))
                    totalPointsEarned += number
                }
            }
        })

        // After a few seconds change sentence
        setTimeout(() => {
            this.assistantContent(motivatiePam[0].pam_goal_total, totalPointsEarned);
        }, 5000)

        //display random greeting sentence

        const greetingSentence = this.pickRandomGreeting();
        this.view.find("#welkom-text").html(`${greetingSentence} ${name}`);
        this.fitText();

        $(".cards").click(nav.handleClickMenuItem)
    }

    assistantContent(total, current) {
        console.log(total, current);
        const progresionIndex = this.calculateProgress(total, current);
        console.log();
        this.view.find('#welkom-text').html(this.assistantTitle[progresionIndex]);
    }

    calculateProgress(total, current) {
        const progression = Math.floor((current / total) * 100);
        if (progression < 10) {
            return 0;
        } else if (progression < 50) {
            return 1;
        } else if (progression < 80) {
            return 2;
        } else if (progression < 100) {
            return 3;
        } else {
            return 4;
        }
    }

    pickRandomGreeting() {
        const zinnen = ["Goed je weer te zien", "Je bent goed bezig", "Leuk je weer te zien"];
        const randomgetal = Math.floor(Math.random() * zinnen.length);
        return zinnen[randomgetal];
    }

    fitText() {
        const stringLength = this.pickRandomGreeting();
        if (stringLength > 29) {
            const element = document.getElementById("welkom-text");
            element.style.fontSize = "29px";
        }
    }
}