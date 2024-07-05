const express = require("express");
const session = require("express-session"); // https://www.npmjs.com/package/express-session
const cors = require("cors");
const authsessionRouter = require("./routes/authSession");
const authTokenRouter = require("./routes/authToken");

require("dotenv").config();

const expressApp = express();

const PORT = process.env.PORT;

expressApp.use(express.json());

expressApp.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

expressApp.use(session({
    secret: 'miSecreto',                // Cadena única.
    resave: false,                  
    saveUninitialized: false, 
    cookie: { 
        secure: false,              
        maxAge: 24 * 60 * 60 * 1000     // Vida útil de la cookie: 24 horas.
    }
}));

expressApp.get("/", (req, res) => {
    res.send("<h2>Hola, esto es solo un mensaje de bienvenida a YAK application...")
})
expressApp.use("/authsession", authsessionRouter);
expressApp.use("/authtoken", authTokenRouter);

expressApp.listen(PORT, () => console.log("Servidor escuchando por puerto", PORT))
