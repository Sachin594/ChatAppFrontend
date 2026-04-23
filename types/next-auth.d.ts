import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User{
        id:string; //Required ID for next-auth
        email:string; //c# backernd retturns email as username
        token:string; // c# returns single jwt token
        role?:string; //UserRole From Backend
    }

    interface Session extends DefaultSession{
        access_token:string
        user:{
            email?:string|null;
            role?:string;
        };

    }
}

declare module "next-auth/jwt"{
    interface JWT{
        access_token:string;
        user:{email:string; role?:string};
    }
}