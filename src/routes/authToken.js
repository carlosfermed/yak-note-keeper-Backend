const express = require("express");
const fetch = require("node-fetch");    // https://stackoverflow.com/questions/70541068/instead-change-the-require-of-index-js-to-a-dynamic-import-which-is-available
// const UserRepository = require("../services/user-repository");
// require("dotenv").config();
// const isAuthenticated = require("../middlewares/isAuthenticated");
// const writeLogInFile = require("../utils/logger");
const authTokenRouter = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();  // borrar cuando se inicie desde el servidor.


const SECRET = process.env.SECRET_KEY;

authTokenRouter.get("/", (req, res) => {

    console.log(req.session);
    const payload = {
        sub: ""
    }

    res.send("Acceso a información confidencial.");



})


module.exports = authTokenRouter