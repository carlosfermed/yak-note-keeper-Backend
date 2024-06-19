const DBLocal = require("db-local");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { Schema } = new DBLocal({ path: "../yakdb" });

const User = Schema("Creators", {
    _id: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true }
});

class UserRespository {
    static create({username, password}){
        
        userValidation(username, password);

        const user = User.find(user => user.username === username); 
        // console.log('Repo Metodo find :>> ', User.find(user => user.username === username));  
        // console.log('Repo user :>> ', user);
        if (user.length !== 0) throw new Error("El nombre de usuario ya existe.");

        const id = crypto.randomUUID();
        const hashedPassword = bcrypt.hashSync(password, 4);

        User.create({
            _id: id,
            username,
            password: hashedPassword
        }).save()

        return id;
    }

    static login({username, password}){

        userValidation(username, password);

        const user = User.find(user => user.username === username);
        // console.log('user :>> ', user);
        if (user.length === 0) throw new Error("El usuario no existe.");
        // console.log('password :>> ', password);
        // console.log('user.password :>> ', user[0].password);
        const passwordMatches = bcrypt.compareSync(password, user[0].password);

        if (!passwordMatches) throw new Error("El password no es correcto.");

        return {
            username: user[0].username
        }
    }
}

const userValidation = (username, password) => {
    if (typeof username !== "string") throw new Error("El nombre debe ser un cadena de texto.");
    if (username.length < 4) throw new Error("El nombre debe superar los 3 caracteres.");

    if (typeof password !== "string") throw new Error("La contraseña debe ser un cadena de texto.");
    if (password.length < 4) throw new Error("La contraseña debe superar los 3 caracteres.");    
}

module.exports = UserRespository;