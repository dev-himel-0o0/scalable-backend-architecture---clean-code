export interface IAuth {
  email: string;
  password: string;
}

export interface IJwtPayload {
  id: string;
  name: string;
  email: string;
}
