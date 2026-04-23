export function decodeJWT(token:string){
    const payload= token.split('.')[1];
    return JSON.parse(atob(payload));
}