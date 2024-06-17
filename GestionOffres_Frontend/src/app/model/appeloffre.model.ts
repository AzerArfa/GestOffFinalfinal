import { Categorie } from "./categorie.model";

export class AppelOffre {
    id!: string;                    
    titre!: string;               
    description!: string;      
    entrepriseId!: string; 
localisation!:string;         
    datecreation!: Date;             
    datelimitesoumission!: Date;    
    img!: string;                   
    document!: string;    
    categorie!:Categorie;    
    
}