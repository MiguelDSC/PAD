/**
 * Enum containing the different state of the navigation.
 * @type {{Caretaker: number, User: number, None: number}}
 */
const navState = {
    None: 0,
    User: 1,
    Caretaker: 2
};

/**
 * Responsible for handling the actions happening on sidebar view.
 *
 * @author Lennard Fonteijn, Pim Meijer, Kevin Breurken
 */
class NavbarController {

    constructor() {
        $.get("views/navbar.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    //Called when the navbar.html has been loaded
    setup(data) {
        //Load the sidebar-content into memory
        const sidebarView = $(data);
        //Find all anchors and register the click-event
        sidebarView.find("button").on("click", this.handleClickMenuItem);

        //Empty the sidebar-div and add the resulting view to the page
        $(".sidebar").empty().append(sidebarView);
        $(".home-back-element").click(this.handleClickMenuItem)
    }

    async handleClickMenuItem() {
        //Get the data-controller from the clicked element (this)
        const controller = $(this).attr("data-controller");

        //Pass the action to a new function for further processing
        await app.loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }

    /**
     * Changes the selected category on the bottom navigation.
     * @param controllerName value that is checked on the button's 'data-controller' attribute.
     */
    setSelectedCategoryButton(controllerName) {
        $('.bottom-nav-element').attr("selected", false);
        $(`.bottom-nav-element[data-controller="${controllerName}"]`).attr("selected", true);
    }

    /**
     * Changes the state of navigation by an given enum state. (use navState)
     * @param navEnumState state to set the navigation to e.g. User / Caretaker.
     */
    setNavigationState(navEnumState) {
        $('#right-nav').toggle(navEnumState === navState.User || navEnumState === navState.Caretaker);
        $('.nav-type-user').toggle(navEnumState === navState.User);
        $('.nav-type-caretaker').toggle(navEnumState === navState.Caretaker);
        //For the mobile hamburgermenu
        $('.navbar-toggler-anchor').toggle(navEnumState !== navState.None);
        if(navEnumState === navState.None) {
            $('#navigation-bottom').collapse('hide');
        }
    }

    //Called when the view failed to load
    error() {
        $(".content").html(`Failed to load navigation view!`);
    }
}
