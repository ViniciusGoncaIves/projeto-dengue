const controller = require("../controllers/auth");

module.exports = (app) => {
    app.post("/auth/login", controller.PostLogin);
};
