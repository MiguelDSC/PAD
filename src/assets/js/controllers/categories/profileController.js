/**
 * Controller responsible for all events in view and setting data
 *
 * @author Pim Meijer
 */


class ProfileController extends CategoryController {
    constructor() {
        super();
        this.loadView("views/profile.html");
        this.userRepository = new UserRepository();
    }

    //Called when the login.html has been loaded.
    setup(data) {
        //Set the navigation color to the correct CSS variable.
        this.updateCurrentCategoryColor("--color-category-profile");
        //Set the navigation to the correct state.
        nav.setNavigationState(navState.User);
        //Load the login-content into memory.
        this.view = $(data);

        //Empty the content-div and add the resulting view to the page.
        $(".content").empty().append(this.view);
        this.retrieveRehabilitatorInfo();
        this.retrieveCaretakerInfo();

        this.view.find("#fileUpload").on("change", function () {
            changeImageUploadPreview(this, '#file_uploader_popup', sessionManager.get("userID"))
            $('#file_uploader_save').removeAttr("disabled");
        });

        this.view.find('#file_uploader_save').on("click", function () {
            uploadImage(sessionManager.get("userID"), selectedImage);
            $('#file_uploader').attr('src', selectedImage);
        });
        
    }

    async retrieveRehabilitatorInfo() {
        try {
            const currentLoggedID = sessionManager.get("userID");
            const rehabilitatorData = await this.userRepository.getRehabilitatorInfo(currentLoggedID);

            //convert birthdate to string
            const birthdate = rehabilitatorData[0]['birthdate'];
            const birthdateString = birthdate.toString();
            const age = Utils.getAge(birthdateString);

            const fullname = rehabilitatorData[0]['first_name'] + " " + rehabilitatorData[0]['last_name']
            document.querySelectorAll(".name_rehabilitator").forEach((element) => {
                element.innerText = fullname;
            })
            document.querySelector(".age_rehabilitator").innerText = age;
            document.querySelector(".adress_rehabilitator").innerText = rehabilitatorData[0]['adress'];
            document.querySelector(".bloodtype_rehabilitator").innerText = rehabilitatorData[0]['bloodtype'];
            document.querySelector(".description_rehabilitator").innerText = rehabilitatorData[0]['description'];
            document.querySelector(".postalcode_rehabilitator").innerText = rehabilitatorData[0]['postalcode'];
            // //profile pic
            if (rehabilitatorData[0]['photo'] != null) {
                const photo = rehabilitatorData[0]['photo'];
                $(".profile_pic_rehabilitator").attr("src", "./uploads/" + photo);
            }

        } catch (e) {
            console.log("error while fetching rooms", e);
        }

    }

    async retrieveCaretakerInfo() {
        try {
            const currentLoggedID = sessionManager.get("userID");
            const caretakerData = await this.userRepository.getCaretakerInfo(currentLoggedID);
            const caretakerID = caretakerData[0]['caretaker_id'];
            const fullname = caretakerData[0]['first_name'] + " " + caretakerData[0]['last_name'];

            document.querySelectorAll(".name_caretaker").forEach((element) => {
                element.innerText = fullname
            })
            document.querySelector(".phone_caretaker").innerText = caretakerData[0]['phone'];
            document.querySelector(".email_caretaker").innerText = caretakerData[0]['email'];
            document.querySelector(".experience1_caretaker").innerText = caretakerData[0]['experience_field1'];
            document.querySelector(".experience2_caretaker").innerText = caretakerData[0]['experience_field2'];
            document.querySelector(".experience3_caretaker").innerText = caretakerData[0]['experience_field3'];
            document.querySelector(".description_caretaker").innerText = caretakerData[0]['description'];
            //profile pic
            document.querySelector(".profile_pic_caretaker").src = `assets/img/caretaker/${caretakerID}_profile_pic.png`;

        } catch (e) {
            console.log("error while fetching rooms", e);
        }

    }

}