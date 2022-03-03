/**
 * Controller responsible for all events in view and setting data
 *
 * @author Pim Meijer
 */
class GoalsController extends CategoryController {
    titlesMotivational = ["De eerste stap", "Een goed begin", "Einde is in zicht", "De nieuwe jij"];
    motvivationalContent = ["Het kan misschien wat intimiderend zijn, maar de eerste stappen zijn altijd het lastigst. Hoewel er nog genoeg te doen staat komt de voortgang vanzelf. Probeer jezelf te focussen op de eerste stappen, het zullen er vanzelf meer worden.",
        "Je hebt al een hele goede start gemaakt naar een gezonde heup. Probeer dit vol te houden, vind vrienden en familie om je te helpen. Je staat er niet alleen voor. Uiteidelijk komt deze balk helemaal naar het einde.",
        "Je bent er bijna! Kijk terug op hoe het in het begin ging, en bewonder de vooruitgang die je al hebt gemaakt. Binnenkort zal je weer door het leven kunnen huppelen, alleen de laatste meters nog.",
        "De laatste stappen en je hebt je doel behaald. Je mag trots zijn op jezelf. Ga met iemand een rondje fietsen, of maak een leuke wandeling. Dat heb je na deze revalidatie zeker wel verdient."];

    constructor() {
        super();
        this.loadView("views/goals.html");
        this.pamRepository = new PamRepository();
        this.rehabilitatorRepository = new RehabilitatorRepository();
    }

    //Called when the login.html has been loaded.
    async setup(data) {
        //Set the navigation to the correct state.
        nav.setNavigationState(navState.User)
        //Load the login-content into memory.
        this.view = $(data);
        $(".content").empty();
        //Set the navigation color to the correct CSS variable.
        this.updateCurrentCategoryColor("--color-category-goals");
        //Create the progress component.
        this.progressBar = await new ProgressComponent(this.view.find("#progress-anchor"));
        const pamdata = await this.progressBar.retrieveProgressData(sessionManager.get("userID"));
        await this.progressBar.repaintProgressBar();

        //Empty the content-div and add the resulting view to the page
        $(".content").append(this.view);
        this.loadActivities(pamdata['daily']);
        this.fillMotivationalContent(pamdata['total'], pamdata['current']);

        $('#today-text').html(`U bent al aardig onderweg! Voor vandaag heeft u een doel staan van  ${pamdata['daily']} PAM punten.
                kijk of u een nieuwe wandelroute of doel kan aannemen om uwzelf uit te dagen!`);
        const dateExpired = (pamdata['date'] < new Date());
        this.setAppointmentState(dateExpired);

        const val = Math.round(this.progressBar.getCalculatedDailyPamGoal() * 10) / 10
        $('.pam-today-display').text(val);
    }

    setAppointmentState(state) {
        this.progressBar.htmlRoot.find(".goal-li").toggle(!state);
        $('#motivational-title').toggle(!state);
        $('#motivational-description').toggle(!state);
        $('#appointment-expired-text').toggle(state);
    }

    async loadActivities(dailyPam) {
        try {
            const activities = await this.rehabilitatorRepository.getPamActivities(dailyPam);
            const activityContainer = $('#activity-container');
            activityContainer.empty();
            for (let i = 0; i < activities.length; i++) {
                activityContainer.append(this.generateActivityCard(activities[i]));
            }

        } catch (e) {
            console.log("error while fetching activities.", e);
        }
    }

    generateActivityCard(cardData) {
        const pamText = cardData['earnable_pam'] === null ? "" : `<p class="goal-card-subheader">${cardData['earnable_pam']} verwachten PAM punten</p>`;
        return `
        <div class="goal-card-container mx-auto">
            <h5 class="goal-card-header">${cardData['header']}</h5>
            <div class="goal-card-content">
                <div class="mx-auto">
                    <img src="./assets/img/goal-activities/${cardData['icon_name']}.svg" onerror="if (this.src !== 'error.jpg') this.src = './assets/img/goal-activities/default.svg';" alt="website logo" width="45%" class="mx-auto d-block">
                </div>
                <p class="goal-card-subheader">${cardData['subheader']}</p>
                <p>${cardData['content']}</p>
                ${pamText}
            </div>
        </div>`;
    }

    fillMotivationalContent(total, current) {
        console.log(this.calculateProgress(total, current))
        const progresionIndex = this.calculateProgress(total, current);
        $('#motivational-title').empty().append(this.titlesMotivational[progresionIndex]);
        $('#motivational-description').empty().append(this.motvivationalContent[progresionIndex]);
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
}
