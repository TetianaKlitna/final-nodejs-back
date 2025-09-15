import type { UserDoc } from '../model/User';

export default class UserDTO {
  userId: string;
  name: string;
  email: string;
  isActivated: boolean;

  constructor(model: UserDoc) {
    this.userId = model._id.toString();
    this.name = model.name;
    this.email = model.email;
    this.isActivated = model.isActivated;
  }
}
