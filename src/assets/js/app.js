/**
 * Entry point front end application - there is also an app.js for the backend (server folder)!
 *
 * Available: `sessionManager` or `networkManager` or `app.loadController(..)`
 *
 * You only want one instance of this class, therefor always use `app`.
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
const CONTROLLER_CARETAKER = "caretaker";
const CONTROLLER_LOGIN = "login";
const CONTROLLER_LOGOUT = "logout";
const CONTROLLER_WELCOME = "welcome";
const CONTROLLER_UPLOAD = "upload";
const CONTROLLER_CARETAKER_PROFILE = "caretaker_profile";

const CONTROLLER_HOME = "home";
const CONTROLLER_GOALS = "goals";
const CONTROLLER_STATISTICS = "statistics";
const CONTROLLER_PROFILE = "profile";
const CONTROLLER_SOCIAL = "social";
const CONTROLLER_PATIENTS = "patients";

const sessionManager = new SessionManager();
const networkManager = new NetworkManager();
const nav = new NavbarController();

let currentController;

class App {

    init() {
        //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
        this.loadControllerFromUrl(CONTROLLER_WELCOME);
    }

    /**
     * Loads a controller
     * @param name - name of controller - see constants
     * @param controllerData - data to pass from on controller to another
     * @returns {boolean} - successful controller change
     */
    loadController(name, controllerData) {
        console.log("loadController: " + name);

        if (controllerData) {
            console.log(controllerData);
        } else {
            controllerData = {};
        }

        if(currentController !== undefined)
            currentController.remove();

        switch (name) {

            case CONTROLLER_LOGIN:
                this.setCurrentController(name);
                currentController = this.isLoggedIn(() => new WelcomeController(), () => new LoginController());
                break;

            case CONTROLLER_LOGOUT:
                this.setCurrentController(name);
                this.handleLogout();
                break;

            case CONTROLLER_WELCOME:
                this.setCurrentController(name);
                currentController = this.isLoggedIn(() => new LoginController, () => new LoginController());
                break;

            case CONTROLLER_HOME:
                this.setCurrentController(name);
                currentController = this.isAdmin(() => new CaretakerController(),
                    () => this.isLoggedIn(() => new HomeController(), () => new LoginController()));
                break;

            case CONTROLLER_GOALS:
                this.setCurrentController(name);
                currentController = this.isLoggedIn(() => new GoalsController(), () => new LoginController());
                break;

            case CONTROLLER_STATISTICS:
                this.setCurrentController(name);
                currentController = this.isLoggedIn(() => new StatisticsController(), () => new LoginController());
                break;

            case CONTROLLER_PROFILE:
                this.setCurrentController(name);
                currentController = this.isLoggedIn(() => new ProfileController(), () => new LoginController());
                break;

            case CONTROLLER_SOCIAL:
                this.setCurrentController(name);
                currentController = this.isLoggedIn(() => new SocialController(), () => new LoginController());
                break;

            case CONTROLLER_CARETAKER:
                this.setCurrentController(name);
                currentController = this.isLoggedIn(() => new CaretakerController(), () => new LoginController());
                break;

            case CONTROLLER_PATIENTS:
                this.setCurrentController(name);
                currentController = this.isAdmin(() => new PatientsController(),
                    () => this.isLoggedIn(() => new HomeController(), () => new LoginController()));
                break;

            case CONTROLLER_CARETAKER_PROFILE:
                this.setCurrentController(name);
                currentController = this.isAdmin(() => new CaretakerProfileController(),
                    () => this.isLoggedIn(() => new HomeController(), () => new LoginController()));
                break;

            case CONTROLLER_UPLOAD:
                new UploadController();
                break;

            default:
                return false;
        }
        //Send to the navigation what controller is loaded
        nav.setSelectedCategoryButton(name)

        return true;
    }

    /**
     * Alternative way of loading controller by url
     * @param fallbackController
     */
    loadControllerFromUrl(fallbackController) {
        const currentController = this.getCurrentController();

        if (currentController) {
            if (!this.loadController(currentController)) {
                this.loadController(fallbackController);
            }
        } else {
            this.loadController(fallbackController);
        }
    }

    getCurrentController() {
        return location.hash.slice(1);
    }

    setCurrentController(name) {
        location.hash = name;
    }

    /**
     * Convenience functions to handle logged-in states
     * @param whenYes - function to execute when user is logged in
     * @param whenNo - function to execute when user is logged in
     */
    isLoggedIn(whenYes, whenNo) {
        if (sessionManager.get("username")) {
            return whenYes();
        } else {
            return whenNo();
        }
    }

    isAdmin(whenYes, whenNo) {
        if (sessionManager.get("role") === 1) {
            return whenYes();
        } else {
            return whenNo();
        }
    }

    /**
     * Removes username via sessionManager and loads the login screen
     */
    handleLogout() {
        sessionManager.remove("username");
        sessionManager.remove("role");
        sessionManager.remove("userID");

        //go to login screen
        this.loadController(CONTROLLER_LOGIN);
    }
}

const app = new App();

//When the DOM is ready, kick off our application.
$(function () {
    app.init();
});

(function($) {
    $.fn.invisible = function() {
        return this.each(function() {
            $(this).css("visibility", "hidden");
        });
    };
    $.fn.visible = function() {
        return this.each(function() {
            $(this).css("visibility", "visible");
        });
    };
}(jQuery));
