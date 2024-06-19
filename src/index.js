const express = require("express");
const session = require("express-session"); // https://www.npmjs.com/package/express-session
const cors = require("cors");
const fetch = require("node-fetch");        // https://stackoverflow.com/questions/70541068/instead-change-the-require-of-index-js-to-a-dynamic-import-which-is-available
const UserRespository = require("./user-repository");
const app = express();


const PORT = 3000;

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

app.use(session({
    secret: 'miSecreto',            // Cadena única.
    resave: false,                  
    saveUninitialized: false, 
    cookie: { 
        secure: false,              
        maxAge: 24 * 60 * 60 * 1000 // Vida útil de la cookie: 24 horas.
    }
}));

app.get("/", (req, res) => {
    res.send("<h1> hola que tal</h1>");
});

app.post("/login", (req, res) => {
    const {username, password} = req.body;

    try {
        const userName = UserRespository.login({username, password});
        if (userName) {
            req.session.user = userName;
            res.status(200).send({message: "Login exitoso."});        
        }
        else {
            res.status(401).send({ message: "Credenciales incorrectas." });
        }
    }
    catch (error) {
        res.status(401).send(error.message);
    }
});

app.post("/register", (req, res) => {
    const {username, password} = req.body;
    // console.log('req.body :>> ', req.body);
    // console.log('typeof username :>> ', typeof username);

    try {
        const id = UserRespository.create({username, password});
        res.status(201).send({id: id, message: "Usuario creado con éxito."});  
    }
    catch (error) {
        res.status(400).send({message: "El usuario ya existe"});
    }    
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ message: 'Error cerrando sesión' });
        }
        res.clearCookie('connect.sid');
        res.status(200).send({ message: "Logout exitoso." });
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); 
    } else {
        res.status(401).send({ message: 'No autorizado' }); 
    }
}

app.get("/protected", isAuthenticated, async (req, res) => {
    console.log("req.session.user typeof ---> ", typeof req.session.user);
    console.log("Usuario que solicita los datos ---> ", req.session.user);
    try {
        const response = await fetch("http://localhost:3001/notes");
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => console.log("Servidor escuchando por puerto", PORT))
