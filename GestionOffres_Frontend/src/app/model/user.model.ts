import { Entreprise } from "./entreprise.model";
import { Role } from "./role.model";

export class User{
    map(arg0: (user: User) => User): User[] {
      throw new Error('Method not implemented.');
    }
    id!: string; // UUID is represented as a string in TypeScript
    email!: string;
    cin!: string;
    datenais!: Date;
    lieunais!: string;
    name!: string;
    prenom!: string;
    password!: string; // You'll need to create a Password model
    roles!: Role[];
    entreprises!: Entreprise[];
    img!: string; 
    }