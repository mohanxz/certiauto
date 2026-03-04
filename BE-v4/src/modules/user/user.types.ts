import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  age: number;
  address: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}
