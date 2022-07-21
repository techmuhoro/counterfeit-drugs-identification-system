//File dependencies
const express = require("express");
const cb = require("./callbacks");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const md = require("./middlewares");
const helpers = require("./helpers");
const qr = require("qrcode");
const fs = require("fs");
const { copyFile, readFile } = require("fs/promises");
const path = require("path");
// const Role = require("./models/Role");

// File variables
const router = express.Router();

//Middlewares
router.use(express.json());
router.use(express.urlencoded({extended: false}));
router.use(cookieParser());
// session configuration
router.use(session({
    secret: "i love secrets, more",
    cookie: {
        maxAge: 1000 * 60 * 60 * 1,
    },
    resave: false,
    saveUninitialized: false,
    store: new MongoDBStore({
        uri: "mongodb://localhost:27017/Counterfeit",
        collection: "mySession",
    })
}));

router.get("/", cb.home);
router.get("/register", cb.registerUser);
router.post("/register", cb.saveUser);
router.post("/login", cb.login);
router.get("/logout", cb.logout);

// Dashboard routes
router.get("/dashboard", md.signedIn, cb.dashboard);
router.get("/categories", md.signedIn, cb.categories);
router.get("/catalog", md.signedIn, cb.catalog);
router.get("/register-drug", md.signedIn, cb.registerDrug);
router.post("/register-drug", md.signedIn, cb.registerDrugPost);
router.post("/new-brand", md.signedIn, cb.newBrand);
router.get("/exchange-release", md.signedIn, cb.releaseCustody);
router.post("/release", md.signedIn, cb.releaseCustodypost);
router.get("/exchange-gain", md.signedIn, cb.gainCustody);
router.post("/gain", md.signedIn, cb.gainCustodyPost);
router.get("/sell", md.signedIn, cb.sell);
router.get("/settings", md.signedIn, cb.settings);
router.get("/serials", md.signedIn, cb.serials);
router.get("/track", md.signedIn, cb.track);

// end user pages
router.get("/end-user", cb.endUserPage);
router.get("/pharmacies", cb.pharmacies);
router.post("/end-user", cb.endUserPost);
router.get("/verify", cb.verify);

router.get("/qr-test", function(req, res) {
    const url = "http://localhost/verify?serial=1v8pmx1&endpoint=Kia";
    qr.toDataURL(url, async function(err, src) {
        if(err) console.log("An error ocuured");
        const imageData = src.replace(/^data:image\/png;base64,/, "");
        fs.writeFile(path.join(__dirname, "../public/qrcodes/out.png"), imageData, 'base64', function(err){
            console.log(err);
        });
    });
    res.send("Hello world");
});
router.get("/qr", md.signedIn, function(req, res) {
    const serial = "MYGW72:48529vf";
    console.log(helpers.generateQuikResponseCode(serial, req.session.email));

    res.send("James Muhoro, best software engineer");
});
router.get("/portal", function(req, res) {
    res.render("authentic-product", {
        product: {
            brand: "Fextmont",
            serial: "YIXR46:87215pb",
            manufacturer: "coporate@dawa.co.ke",
            DOR: "14/11/2021"
        }
    });
});

router.get("/portal2", function(req, res) {
    res.render("counterfeit-product");
});
router.get("/portal3", function(req, res) {
    res.render("request_sent", {
        role: "distributor",
        notifications: [],
    });
});

module.exports = router;