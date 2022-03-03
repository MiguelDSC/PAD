/**
 * Repository responsible for all caretaker data from server - CRUD
 */
class CaretakerRepository {

    constructor() {
        this.route = "/caretaker"
    }

    async getAllRehab(userID) {
        return await networkManager
            .doRequest(`${this.route}/all`, {"userID": userID}, "POST");
    }

    async getRehabByPageID(userID, paginationPosition,amountPerPage) {
        return await networkManager
            .doRequest(`${this.route}/all/pagination`, {"userID": userID, "paginationPosition": paginationPosition, "amountPerPage": amountPerPage}, "GET");
    }

    async getRehabCount(userID) {
        const data = await networkManager
            .doRequest(`${this.route}/all/count`, {"userID": userID}, "GET", false);
        return data[0]['count'];
    }

    async getUserInfo(userID) {
        return await networkManager
            .doRequest(`${this.route}/user`, {"userID": userID});
    }

    async getLoggedInCaretakerId(userID) {
        return await networkManager
            .doRequest(`${this.route}/getId`, {"userID": userID});
    }

    async getLoggedInCaretakerInfo(userID) {
        return await networkManager
            .doRequest(`${this.route}/getInfo`, {"userID": userID});
    }

    async saveCaretaker(userID, values) {
        return await networkManager
            .doRequest(`${this.route}/saveInfo`, {"userID": userID, "values": values});
    }
}