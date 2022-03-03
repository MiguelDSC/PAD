/**
 * Repository responsible for all caretaker data from server - CRUD
 */
class MessagesRepository {

    constructor() {
        this.route = "/messages"
    }

    async getAllMessages(id) {
        return await networkManager
            .doRequest(`${this.route}`, {"rehabilitatorID": id}, "POST");
    }

    async getAllMyMessages(userID) {
        return await networkManager
            .doRequest(`${this.route}/me`, {"userID": userID}, "POST");
    }


    async insertMessage(caretakerID, userID, message, date) {
        return await networkManager
            .doRequest(`${this.route}/insert`, {
                "caretakerID": caretakerID,
                "userID": userID,
                "message": message,
                "date": date
            }, "POST");
    }

    async deleteMessage(message) {
        return await networkManager
            .doRequest(`${this.route}/delete`, {"messageID": message}, "POST");
    }

    async reportMessage(message, id) {
        return await networkManager
            .doRequest(`${this.route}/report`, {"messageID": message, "rehabilitatorID": id}, "POST");
    }


}