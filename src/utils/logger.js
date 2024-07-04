const fs = require("node:fs");

const writeLogInFile = (logMessage) => {
    fs.writeFile("server.log", logMessage, {flag: "a"}, (err) => {
        if (err) console.log("Ha ocurrido un error:", err);
    })
};

module.exports = writeLogInFile;