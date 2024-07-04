

function isAuthenticated(req, res, next) {
    // console.log("req.session.user", req.session.user)  
    // console.log("req.session", req.session) 

    if (req.session.user) {
        return next(); 
    } else {
        res.status(401).send({message: "No autorizado."}); 
    }
}

module.exports = isAuthenticated;