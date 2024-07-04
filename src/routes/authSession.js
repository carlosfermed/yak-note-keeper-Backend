const express = require("express");
const fetch = require("node-fetch");    // https://stackoverflow.com/questions/70541068/instead-change-the-require-of-index-js-to-a-dynamic-import-which-is-available
const UserRepository = require("../user-repository");
const authsessionRouter = express.Router();
const writeLogInFile = require("../utils/logger");


authsessionRouter.post("/login", (req, res) => {
    const {username, password} = req.body;

    try {
        const userName = UserRepository.login({username, password});
        
        req.session.user = userName;
        req.session.save(error => {     // Aseguramos que cualquier error producido al guardar sesión sea manejado.
            if (error) {
                console.error("Error guardando la sesión:", error);
                return res.status(500).send({ message: "Error guardando la sesión." });
            }
            res.status(200).send({ message: "Login exitoso." });
        });         
    } catch (error) {
        res.status(401).send({ message: error.message });
    }
});

authsessionRouter.post("/register", (req, res) => {
    const {username, password} = req.body;

    try {
        const id = UserRepository.create({username, password});
        res.status(201).send({id: id, message: "Usuario creado con éxito."});  
    } catch (error) {
        res.status(400).send({message: "El usuario ya existe"});
    }    
});

authsessionRouter.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).send({ message: "Error al cerrar sesión." });
        }
        res.clearCookie('connect.sid');
        res.status(200).send({ message: "Logout exitoso." });
    });
});

function isAuthenticated(req, res, next) {
    // console.log("req.session.user", req.session.user)  
    // console.log("req.session", req.session) 

    if (req.session.user) {
        return next(); 
    } else {
        res.status(401).send({message: "No autorizado."}); 
    }
}

authsessionRouter.get("/protected", isAuthenticated, async (req, res) => {

    const fecha = new Date(Date.now());
    const logSolicitudDatos = `Usuario que solicita datos (notas)>> ${req.session.user.username} /// Fecha y hora --> ${fecha.getHours()}:${fecha.getMinutes()} - ${fecha.getDay()}/${fecha.getMonth()}/${fecha.getFullYear()}\n`;

    console.log('logSolicitudDatos :>> ', logSolicitudDatos);
    // Introducir método que guarde el log en un archivo txt.
    writeLogInFile(logSolicitudDatos);

    try {
        const response = await fetch("http://localhost:3001/notes");
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});

authsessionRouter.post("/protected", isAuthenticated, async (req, res) => {

    const fecha = new Date(Date.now());
    const noteData = req.body;

    const logGuardarNota = `Usuario que añade la nota >> ${req.session.user.username} /// Fecha y hora --> ${fecha.getHours()}:${fecha.getMinutes()} - ${fecha.getDay()}/${fecha.getMonth()}/${fecha.getFullYear()}\n`;

    console.log('logGuardarNota :>> ', logGuardarNota);
    // Introducir método que guarde el log en un archivo txt.
    writeLogInFile(logGuardarNota);

    fetch("http://localhost:3001/notes", {
        method: "POST",
        body: JSON.stringify(noteData),
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error, código de estado: ${response.status}`);
            }
            return response.json();
        })
        .then(data => { 
            console.log("Nueva nota añadida: ", data); 
            res.status(201).send({message: "Nota creada con éxito."});
        })
        .catch(error => {
            console.log(error)
            res.status(500).send(error.message);
        });
});

module.exports = authsessionRouter;