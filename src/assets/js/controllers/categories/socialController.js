/**
 * Controller responsible for all events in view and setting data
 *
 * @author Pim Meijer
 */

class SocialController extends CategoryController {

    constructor() {
        super();
        this.loadView("views/social.html");
        this.userRepository = new UserRepository();
        this.messagesRepository = new MessagesRepository();
    }

    //Called when the login.html has been loaded.
    async setup(data) {
        //Set the navigation color to the correct CSS variable.
        this.updateCurrentCategoryColor("--color-category-social");
        //Set the navigation to the correct state.
        nav.setNavigationState(navState.User)
        //Load the login-content into memory.
        this.view = $(data);

        //Empty the content-div and add the resulting view to the page.
        $(".content").empty().append(this.view);
        await this.retrieveCaretakerInfo();
        await this.retrieveOtherMessages();
        await this.getMyMessages();
        this.addEventListeners()

    }

    addEventListeners() {
        $("#message-form-other").on("submit", async event => {
            event.preventDefault();
            const text = document.querySelector("#message-content").value
            await this.sendMessage(text);
            location.reload();
        })

        $('.btn-delete').on('click', async (event) => {
            const messageId = event.target.dataset.messageId
            await this.deleteMessage(messageId)
        })

        $('.btn-report').on('click', async (event) => {
            const messageId = event.target.dataset.messageId
            await this.reportMessage(messageId);
        })

    }

    async retrieveCaretakerInfo() {
        try {
            const currentLoggedID = sessionManager.get("userID");
            const careTakerInfo = (await this.userRepository.getCaretakerInfo(currentLoggedID))[0];
            const caretakerID = careTakerInfo.caretaker_id;
            const fullName = `${careTakerInfo.first_name} ${careTakerInfo.last_name}`

            document.querySelectorAll(".name_caretaker").forEach((element) => {
                element.innerText = fullName
            })
            document.querySelector(".phone_caretaker").innerText = careTakerInfo.phone
            document.querySelector(".email_caretaker").innerText = careTakerInfo.email
            document.querySelector(".experience1_caretaker").innerText = careTakerInfo.experience_field1
            document.querySelector(".experience2_caretaker").innerText = careTakerInfo.experience_field2
            document.querySelector(".experience3_caretaker").innerText = careTakerInfo.experience_field3
            document.querySelector(".description_caretaker").innerText = careTakerInfo.description
            //profile pic
            document.querySelector(".profile_pic_caretaker").src = `assets/img/caretaker/${caretakerID}_profile_pic.png`;
            return careTakerInfo;
        } catch (e) {
            console.log("error while retrieving caretaker info.", e);
        }
    }


    async getMyMessages() {
        try {
            const currentLoggedUserID = sessionManager.get("userID");
            const userData = await this.userRepository.getRehabilitatorInfo(currentLoggedUserID)
            const rehabilitatorID = userData[0].id;
            const messages = await this.messagesRepository.getAllMyMessages(rehabilitatorID);
            const messagesHtml = messages.map(message => (
                `<div class="message mb-2" >
                    <p style="padding-bottom: 20px; border-bottom:2px solid var(--color-category-current);">
                    <b>OP ${message.date.split("T")[0]}</b> <br>
                         
                         ${message.content}
                         <button class="btn-delete" data-message-id="${message.message_id}">Verwijder</button>
                        
                    </p>
                </div>  
               `))

            $("#my-messages").html(messagesHtml)
        } catch (e) {
            console.log("error while fetching social messages.", e);
        }
    }

    async deleteMessage(messageID) {
        const result = confirm("weet je zeker dat je bericht wilt verwijderen")
        if (result) {
            await this.messagesRepository.deleteMessage(messageID);
            location.reload();
        }
    }

    async retrieveOtherMessages() {
        try {
            const currentLoggedID = sessionManager.get("userID");
            const userData = await this.userRepository.getRehabilitatorInfo(currentLoggedID);
            const rehabilitatorID = userData[0].id;
            const messages = await this.messagesRepository.getAllMessages(rehabilitatorID);
            const messagesHtml = messages.map(message => {
                const age = Utils.getAge(message.birthdate)
                let actionsHtml = '';
                if (message.rehabilitator_id !== rehabilitatorID) {
                    actionsHtml += `<button class="btn-report" data-message-id="${message.message_id}">Rapporteer</button>`
                }

                return (`
                    <b>OP ${message.date.split("T")[0]}</b> <br>
                    <h2 class="mb-2"><b>${message.first_name}  ${age} jaar</b></h2>
                        <p style="padding-bottom: 20px; border-bottom:2px solid var(--color-category-current);">
                            ${message.content}
                           
                           ${actionsHtml} 
                        </p>  
                    `)
            });
            $("#social-messages").html(messagesHtml);

        } catch (e) {
            console.log("error while social 'other' messages.", e);
        }

    }

    async reportMessage(messageID) {
        const currentLoggedUserID = await sessionManager.get("userID");
        const userData = await this.userRepository.getRehabilitatorInfo(currentLoggedUserID)
        const rehabilitatorID = userData[0].id;
        await this.messagesRepository.reportMessage(messageID, rehabilitatorID);
        location.reload();
    }


    async sendMessage(message) {
        const caretakerID = (await this.retrieveCaretakerInfo()).caretaker_id
        const currentLoggedUserID = sessionManager.get("userID");
        const roomdata = await this.userRepository.getRehabilitatorInfo(currentLoggedUserID)
        const userID = roomdata[0].id;

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '/' + mm + '/' + dd;
        await this.messagesRepository.insertMessage(caretakerID, userID, message, today);
    }
}