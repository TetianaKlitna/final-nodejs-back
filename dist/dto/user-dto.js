"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserDTO {
    constructor(model) {
        this.userId = model._id.toString();
        this.name = model.name;
        this.email = model.email;
        this.isActivated = model.isActivated;
    }
}
exports.default = UserDTO;
