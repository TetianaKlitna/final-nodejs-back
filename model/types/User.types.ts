export interface User {
  name: string;
  email: string;
  password: string;
}

export interface UserMethods {
  createJWT(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
