const err = function (err, req, res, next) {
    // render the error page
    // res.status(err.status || 500);
    if (err.status == 404) {
        if (err.admin) {
            res.render("404_admin", { error: err.message });
        } else {
            res.render("404", { error: err.message });
        }
    } else {
        if (err.status == 500) {
            res.render("error", { error: "unfinded error" });
        } else {
            if (err.admin) {
                res.render("error", { error: "server down" });
            } else {
                res.render("error", { error: "server down" });
            }
        }
    }
};

module.exports = { err }