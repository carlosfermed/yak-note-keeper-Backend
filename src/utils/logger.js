const fs = require("node:fs");

const writeLogInFile = (date, username, personalizedLogMessage) => {

    formattedHour = date.getHours();
    formattedMinutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    formattedTime = `${formattedHour}:${formattedMinutes}`;
    console.log('date.getDay() :>> ', date.getDay());
    formattedDayMonthYear = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    fullFormattedDate = formattedTime + " - " + formattedDayMonthYear;

    const logMessage =  `${username.padEnd(20)} ${personalizedLogMessage.padEnd(15)} ${fullFormattedDate.padEnd(10)}\n`;


    fs.writeFile("server.log", logMessage, {flag: "a"}, (err) => {
        if (err) console.log("Ha ocurrido un error:", err);
    })
};

module.exports = writeLogInFile;