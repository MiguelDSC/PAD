// Set the caretaker info
let caretakerData;

class CaretakerProfileController extends CategoryController {

    constructor() {
        super();
        this.loadView("views/caretaker/profile.html");
        this.userRepository = new UserRepository();
        this.caretakerRepository = new CaretakerRepository();
    }

    //Called when the home.html has been loaded
    async setup(data) {
        //Set the navigation color to the correct CSS variable.
        this.updateCurrentCategoryColor("--color-category-default");
        //Set the navigation to the correct state.
        nav.setNavigationState(navState.Caretaker);
        //Load the welcome-content into memory
        this.caretakerView = $(data);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.caretakerView);

        // Set the caretakerinfo
        this.getCaretakerInfo();

        // once the modal is opened, set up the modal
        $(this.caretakerView).on("click", ".btn-edit--caretaker", (e) => {
            this.fillProfileEdit();
        });

        this.caretakerView.find(".edit-form").on("submit", (data) => this.saveProfile(data));
    }

    /**
     * Function from profile but edited a little bit, sets the caretaker info on the profile page
     * @returns {Promise<void>}
     */
    async getCaretakerInfo() {
        try {
            const currentLoggedID = sessionManager.get("userID");
            caretakerData = await this.caretakerRepository.getLoggedInCaretakerInfo(currentLoggedID);

            const caretakerID = caretakerData[0].caretaker_id;
            const fullname = caretakerData[0].first_name + " " + caretakerData[0].last_name

            document.querySelectorAll(".name_caretaker").forEach((element) => {
                element.innerText = fullname
            })
            document.querySelector(".phone_caretaker").innerText = caretakerData[0].phone
            document.querySelector(".email_caretaker").innerText = caretakerData[0].email
            document.querySelector(".experience1_caretaker").innerText = caretakerData[0].experience_field1
            document.querySelector(".experience2_caretaker").innerText = caretakerData[0].experience_field2
            document.querySelector(".experience3_caretaker").innerText = caretakerData[0].experience_field3
            document.querySelector(".description_caretaker").innerText = caretakerData[0].description
            //profile pic
            document.querySelector(".profile_pic_caretaker").src = `assets/img/caretaker/${caretakerID}_profile_pic.png`;

        } catch (e) {
            console.log("Foutgegaan tijdens het opzetten: ", e);
        }
    }

    /**
     * Fill the profile editor
     */
    fillProfileEdit() {
        // Remove the previous success message
        $(".alert-success").remove();

        // Set the values
        $("#firstNameEdit").val(caretakerData[0].first_name);
        $("#lastNameEdit").val(caretakerData[0].last_name);
        $("#emailEdit").val(caretakerData[0].email);
        $("#descriptionEdit").val(caretakerData[0].description);
        $("#phoneEdit").val(caretakerData[0].phone);
        $("#experienceOneEdit").val(caretakerData[0].experience_field1)
        $("#experienceTwoEdit").val(caretakerData[0].experience_field2)
        $("#experienceThreeEdit").val(caretakerData[0].experience_field3)
    }

    /**
     * Save the edited files.
     */
    saveProfile(data) {
        data.preventDefault();
        let editValues = this.getEditValues();

        if (this.validateForm(editValues[0].firstname, editValues[0].lastname, editValues[0].email, editValues[0].phone)) {
            return false;
        }

        try {
            this.caretakerRepository.saveCaretaker(sessionManager.get("userID"), editValues).then((r) => {
                // Give an succes message
                $(".alert").remove(); //remove if one already exists
                $(".edit-form").prepend("<div class=\"alert alert-success edit-succes mb-2\" role=\"alert\">\n" +
                    ""+ editValues[0].firstname + " is bewerkt!\n" +
                    "</div>")

                // Set the values in the html
                document.querySelector(".name_caretaker").innerText = editValues[0].firstname + " " + editValues[0].lastname;
                document.querySelector(".phone_caretaker").innerText = editValues[0].phone;
                document.querySelector(".email_caretaker").innerText = editValues[0].email;
                document.querySelector(".experience1_caretaker").innerText = editValues[0].experience_one;
                document.querySelector(".experience2_caretaker").innerText = editValues[0].experience_two;
                document.querySelector(".experience3_caretaker").innerText = editValues[0].experience_three;
                document.querySelector(".description_caretaker").innerText = editValues[0].description;

                // Set the caretaker values as the same as the editValues;
                caretakerData[0].first_name = editValues[0].firstname;
                caretakerData[0].last_name = editValues[0].lastname;
                caretakerData[0].email = editValues[0].email;
                caretakerData[0].description = editValues[0].description;
                caretakerData[0].phone = editValues[0].phone;
                caretakerData[0].experience_field1 = editValues[0].experience_one;
                caretakerData[0].experience_field2 = editValues[0].experience_two;
                caretakerData[0].experience_field3 = editValues[0].experience_three;
            })
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * Set the edit values, and return an array with them
     * @returns {[]} array with values
     */
    getEditValues() {
        let firstname = $("#firstNameEdit").val();
        let lastname = $("#lastNameEdit").val();
        let email = $("#emailEdit").val();
        let description = $("#descriptionEdit").val();
        let phone = $("#phoneEdit").val();
        let experience_one = $("#experienceOneEdit").val();
        let experience_two = $("#experienceTwoEdit").val();
        let experience_three = $("#experienceThreeEdit").val();

        let valuesToGive = [];
        valuesToGive.push({"firstname": firstname, "lastname": lastname, "email": email, "description": description, "phone": phone, "experience_one": experience_one,
        "experience_two": experience_two, "experience_three": experience_three});

        return valuesToGive;
    }

    /**
     * Checks for most values in the form if they're validated, otherwise return an error
     * @returns {boolean}
     */
    validateForm(firstname, lastname, email, phone) {
        let errorcount = 0;

        // Check if firstname is empty
        if (firstname === "") {
            errorcount++;
            $("#firstnameError").text("Voornaam kan niet leeg zijn!");
        }

        if (lastname === "") {
            errorcount++;
            $("#lastnameError").text("Achternaam kan niet leeg zijn!");
        }

        if (phone === "") {
            errorcount++;
            $("#phoneEditError").text("Mobiel kan niet leeg zijn!");
        } else if (!/^\d+$/.test(phone)) {
            errorcount++;
            $("#phoneEditError").text("Mobiel moet alleen nummers zijn!");
        }

        if (email === "") {
            errorcount++;
            $("#emailError").text("Email kan niet leeg zijn!");
        }

        if (errorcount > 0) {
            return true;
        } else {
            $("#firstnameError").text("");
            $("#lastnameError").text("");
            $("#phoneEditError").text("");
            $("#emailError").text("");
        }
    }
}