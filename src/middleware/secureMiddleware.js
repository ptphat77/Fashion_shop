var bodyParser = require("body-parser");
const csrf = require("csurf");
const rateLimit = require("express-rate-limit");
const fetch = require("isomorphic-fetch");

// create application/x-www-form-urlencoded parser
exports.urlencodedParser = bodyParser.urlencoded({ extended: false });

// Prevent CSRF
exports.csrfProtection = csrf({ cookie: false });

// Prevent DDOS
exports.apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 20, // Adjusting the maximum request
    message: "Too many connection",
});

// Captcha
exports.captcha = (req, res, next) => {
    // getting site key from client side
    const response_key = req.body["g-recaptcha-response"];
    
    if (!response_key) {
        req.flash("error", "Vui lòng xác thực captcha !!!");
        return res.redirect("/login");
    }
    // Put secret key here, which we get from google console
    const secret_key = process.env.CAPTCHA_SECRET_KEY;

    const url =
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

    // Making POST request to verify captcha
    fetch(url, {
        method: "post",
    })
        .then((response) => response.json())
        .then((google_response) => {
        // google_response is the object return by
        // google as a response
        if (google_response.success == true) {
            // if captcha is verified
            next()
        } else {
            // if captcha is not verified
            req.flash("error", "Captcha không đúng !!!");
            return res.redirect("/login");
        }
        })
        .catch((error) => {
            // Some error while verify captcha
            return res.json({ error });
        });
}

