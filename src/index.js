const express = require("express");
const session = require("express-session"); // https://www.npmjs.com/package/express-session
const cors = require("cors");
const fetch = require("node-fetch");        // https://stackoverflow.com/questions/70541068/instead-change-the-require-of-index-js-to-a-dynamic-import-which-is-available
const UserRepository = require("./user-repository");
const app = express();


const PORT = process.env.PORT || 3000;

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
    res.send("<h1>Hola bienvenido...</h1>");
});

app.post("/login", (req, res) => {
    const {username, password} = req.body;

    try {
        const userName = UserRepository.login({username, password});
        if (userName) {
            req.session.user = userName;
            req.session.save(err => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ message: "Error guardando la sesión." });
                }
                res.status(200).send({ message: "Login exitoso." });
            }); 
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
        const id = UserRepository.create({username, password});
        res.status(201).send({id: id, message: "Usuario creado con éxito."});  
    }
    catch (error) {
        res.status(400).send({message: "El usuario ya existe"});
    }    
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ message: "Error al cerrar sesión." });
        }
        res.clearCookie('connect.sid');
        res.status(200).send({ message: "Logout exitoso." });
    });
});

function isAuthenticated(req, res, next) {
    console.log("req.session.user", req.session.user)  //////////////////////////////////////
    console.log("req.session", req.session)  //////////////////////////////////////

    if (req.session.user) {
        return next(); 
    } else {
        res.status(401).send({message: "No autorizado."}); 
    }
}

app.get("/protected", isAuthenticated, async (req, res) => {
    // console.log("req.session.user typeof ---> ", typeof req.session.user);
    const fecha = new Date(Date.now());
    console.log("Usuario que solicita los datos -->", req.session.user, " / Hora de la solicitud -->", 
        `${fecha.getHours()}:${fecha.getMinutes()}`, fecha.getFullYear(), fecha.getDay(), );

    try {
        const response = await fetch("http://localhost:3001/notes");
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/protected", isAuthenticated, async (req, res) => {
    // console.log("req.session.user typeof ---> ", typeof req.session.user);
    const fecha = new Date(Date.now());
    console.log("Usuario que añade nota -->", req.session.user, " / Hora de la solicitud -->", 
        `${fecha.getHours()}:${fecha.getMinutes()}`, fecha.getFullYear(), fecha.getDay(), );

    console.log("POST /protected req.body", req.body)   //////////////////////////////////////////////////////////////////
    const noteData = req.body;

    try {
        fetch("http://localhost:3001/notes", {
            method: "POST",
            body: JSON.stringify(noteData),
            headers: {
                "Content-Type": "application/json",
            }
        })
            .then(response => response.json())
            .then(noteSaved => { 
                console.log("Nueva nota añadida: ", noteSaved.content); 
                res.status(201).send({message: "Nota creada con éxito."});
            })
            .catch(err => console.log(err));
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => console.log("Servidor escuchando por puerto", PORT))
