const express = require("express");
const authTokenRouter = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

authTokenRouter.use(cookieParser());

authTokenRouter.get("/protectedinfo", (req, res) => {
    
    try {
        const decoded = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
        console.log(decoded);

        res.send("Acceso a información confidencial autorizado.");
    }
    catch (err) {
        res.status(401).end();
    }
})

module.exports = authTokenRouter