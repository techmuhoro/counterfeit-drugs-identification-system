//File dependencies

// Middlewares container
const middlewares = {
    /**
     * 
     * this middleware makes sures a user is signed in for him to access a page
     */
    signedIn: function(req, res, next) {
        if(req.session.email) {
            next();
        } else {
            res.redirect("/"); 
        }
    },
};

module.exports = middlewares;