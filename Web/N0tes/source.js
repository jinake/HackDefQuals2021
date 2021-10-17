'use strict'

const express = require("express");
const cookieParser = require('cookie-parser')
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ZombieBrowser = require('zombie');
const fetch = require('isomorphic-fetch');

const app = express();
const CHALL_PORT = process.env.CHALL_PORT || 1333
const CHALL_DOMAIN = process.env.CHALL_DOMAIN || "127.0.0.1"
const FLAG = process.env.FLAG_WEB_300 || "Hackdef{FAKE_TEST_FLAG}"
const COOKIE_KEY = process.env.COOKIE_KEY || "TMP_DEV_TEST_KEY"
const COOKIE_NAME = "connect.sid"

const MONGO_DB_USER = process.env.MONGO_DB_USER || "cd2"
const MONGO_DB_PWD = process.env.MONGO_DB_PWD || "cd2"
const MONGO_DB_HOST = process.env.MONGO_DB_HOST || "localhost"
const MONGO_DB_PORT = process.env.MONGO_DB_PORT || "27017"
const MONGO_DB_DB_NAME = process.env.MONGO_DB_DB_NAME || "cd2"
const MONGO_URI = process.env.MONGO_URI || `mongodb://${MONGO_DB_USER}:${MONGO_DB_PWD}@${MONGO_DB_HOST}:${MONGO_DB_PORT}/${MONGO_DB_DB_NAME}`

console.log("MONGO_URI==============", MONGO_URI)
const browser = new ZombieBrowser();

console.log(FLAG)
console.log(COOKIE_KEY)

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).catch(error => {
    console.log("mongoose error::::" + error)
});

// Only for test
const UserNote = mongoose.model('UserNote', {
    userId: {type: String, unique: true, required: true},
    notes: [String]
});

UserNote.find({}, function (err, docs) {
    if (err) {
        console.log(err);
    } else {
        console.log("Third function call : ", docs);
    }
});

const note = new UserNote({userId: "usuarioTest", notes: ["note1", "note2"]});
note.save().then(() => console.log('saved'));

const doc = UserNote.findOneAndUpdate({
    userId: "usuarioTest"
}, {$push: {notes: ["p7", "p8"]}}, {upsert: false}, function (err) {
    console.log("error= ", err)
});


console.log("notes", doc.notes)

function genUuidV4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

app.set('view engine', 'ejs');
app.use(session({
    genid: function (req) {
        return genUuidV4() // use UUIDs for session IDs
    },
    secret: COOKIE_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false},
    maxAge: 24 * 60 * 60 * 1000 // 24 hours - in milliseconds
}))

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(bodyParser.json());


const HEADERS = {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': 'null',
    'Content-Security-Policy': "script-src 'sha256-jq+togHz+z6xIxu9W5enAWBGlnwm4Ad06wDcm9H4R+4='  'self' www.gstatic.com *.google.com cdnjs.cloudflare.com use.fontawesome.com; style-src  jenil.github.io; font-src fonts.googleapis.com fonts.gstatic.com; style-src-elem  'sha256-bviLPwiqrYk7TOtr5i2eb7I5exfGcGEvVuxmITyg//c=' fonts.googleapis.com jenil.github.io; default-src 'self' 'unsafe-inline' 'nonce-EDNnf03nceIOfn39fn3e9h3sdfa' www.gstatic.com; object-src 'none'; connect-src *; frame-src www.google.com; img-src www.gstatic.com",  //  connect-src *;// report-uri /csp_violation_report
}

app.get('/', (req, res) => {
    res.set(HEADERS);

    let cookieSessionId = req.cookies[COOKIE_NAME] || ""
    let userNotes = []
    console.log("cookieSessionId===", cookieSessionId)

//    if (cookieSessionId !== "") {
    UserNote.find({userId: cookieSessionId}, function (err, docs) {
        if (docs.length !== 0) {
            userNotes = docs[0].notes
            console.log("UserNote doc:length ", docs.length);
            console.log("UserNote doc: ", docs);

            console.log("UserNote doc 0:  ", docs[0].notes);
            console.log("UserNote doc 0:  ", encodeURIComponent(cookieSessionId));
        }
        return res.render('index', {
            userSessionID: encodeURIComponent(cookieSessionId),
            challDomain: CHALL_DOMAIN,
            challPort: CHALL_PORT,
            notes: userNotes,
            headers: HEADERS,
            lastModified: false,
            etag: false
        });
    });
});


app.post('/add_note_back', (req, res) => {
    const newNote = req.body.nota;
    let cookieSessionId = req.cookies[COOKIE_NAME] || ""

    // Solo algunas validaciones
    if (cookieSessionId === ""
        || !newNote
        || newNote === ""
        || newNote.replace(/\s/g, '') === ""
        || newNote.length > 200) {
        return res.redirect("/") //status(500).json({"error": "Ha ocurrido un error :("})
    }

    UserNote.find({userId: cookieSessionId}, function (err, docs) {
        if (err) {
            console.log("Error find", err);
        } else {
            console.log("Update doc: ", docs);
            const doc = UserNote.findOneAndUpdate({
                userId: cookieSessionId
            }, {$push: {notes: [newNote]}}, {upsert: true}, function (err) {
                console.log("error= ", err)
            });
        }
    });

    /*
    const doc = UserNote.findOneAndUpdate({
        userId: cookieSessionId
    }, {$push: {notes: [newNote]}}, {upsert: true}, function (err) {
        console.log("error= ", err)
    });
*/

    return res.redirect("/")
    // return res.sendFile(__dirname + "/index.ejs", {headers: HEADERS, lastModified: false, etag: false});
});


app.get("/source", (req, res) => {
    return res.sendFile(__filename);
})


//Cosas aburridas

app.post('/logout', (req, res) => {
    req.session = null
    return res.redirect(`${__dirname}/index.ejs`, {headers: HEADERS, lastModified: false, etag: false});
});


const addNote = (req, res) => {
    const newNote = req.body.note;
    let cookieSessionId = req.cookies[COOKIE_NAME] || ""

    // Solo algunas validaciones
    if (cookieSessionId === ""
        || !newNote
        || newNote === ""
        || newNote.replace(/\s/g, '') === ""
        || newNote.length > 200) {
        return res.redirect("/") //status(500).json({"error": "Ha ocurrido un error :("})
    }

    UserNote.find({userId: cookieSessionId}, function (err, docs) {
        if (err) {
            console.log("Error find", err);
        } else {
            console.log("Update doc: Add note", docs);
            const doc = UserNote.findOneAndUpdate({
                userId: cookieSessionId
            }, {$push: {notes: [newNote]}}, {upsert: true}, function (err) {
                console.log("error= ", err)
            });
        }
    });

    return res.redirect("/")
}


const handleRecaptchaV3 = (req, res, next) => {
    // Agregamos recaptchaV3 para los chicos malos  c:
    const SECRET_KEY_RECAPTCHA = process.env.SECRET_KEY_RECAPTCHA_V3 || ""
    const token = req.body.token;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY_RECAPTCHA}&response=${token}`;

    fetch(url, {
        method: 'post'
    })
        .then(response => response.json())
        .then(google_response => {
            /// res.json({google_response})
            console.log("google_response= ", google_response)
            console.log("google_response success = ", google_response.success === true)
            if (google_response.success === true) {
                next()
            } else {
                return res.status(500).json({"error": "Lo siento chico malo: Invalid Captcha :("})
            }
        })
        .catch(error => res.status(500).json({error}));
};


app.post('/add_note', handleRecaptchaV3, addNote);


const handleRecaptchaV2 = (req, res, next) => {
    // Agregamos recaptchaV2 para los chicos más malos  c:

    const SECRET_KEY_RECAPTCHA = process.env.SECRET_KEY_RECAPTCHA_V2 || ""
    const response = req.body['g-recaptcha-response'];
    const url_note = req.body['url_note'];
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY_RECAPTCHA}&response=${response}`;

    console.log("response================", response)
    console.log("url_note================", url_note)
    fetch(url, {
        method: 'post'
    })
        .then(response => response.json())
        .then(google_response => {
            /// res.json({google_response})
            console.log("google_response= ", google_response)
            console.log("google_response success = ", google_response.success === true)
            if (google_response.success === true) {
                next()
            } else {
                return res.json({"error": "Lo siento chico malo: Invalid Captcha :("})
            }
        })
        .catch(error => res.json({error}));
};


/**
 * STUFF FOR admin BOT
 * **/

browser.waitDuration = '30s';

const sendAdmin = (req, res) => {
    const url_note = req.body.url_note || "";
    console.log("sendAdmin url_note =====  ", url_note)

    let url
    let userSessId = ""
    try {
        url = new URL(url_note);
        userSessId = url.searchParams.get('urlPost');
        console.log("userSessId===", userSessId)
    } catch (error) {
        return res.status(500).json({"error": "Error en la URL: " + error})
    }

    if (userSessId === "") {
        return res.status(500).json({"error": "Error en la URL: " + error})
    }


    /*  let cookieSessionId = req.cookies[COOKIE_NAME] || ""

      let userNotes = []
      UserNote.find({userId: url_note}, function (err, docs) {
          if (docs.length !== 0) {
              userNotes = docs[0].notes
              console.log("UserNote doc:length ", docs.length);
              console.log("UserNote doc: ", docs);
              console.log("UserNote doc 0:  ", docs[0].notes);
          }
          return res.render('index', {
              userSessionID: encodeURIComponent(cookieSessionId),
              challDomain: CHALL_DOMAIN,
              challPort: CHALL_PORT,
              notes: userNotes,
              headers: HEADERS,
              lastModified: false,
              etag: false
          });
      });*/

    browser.setCookie({domain: CHALL_DOMAIN, name: 'flag', value: FLAG, httpOnly: false});
    let urlTtVisit = `http://${CHALL_DOMAIN}:${CHALL_PORT}/view_notes/?urlPost=${userSessId}`
    browser.visit(urlTtVisit, function () {

        const value = browser.getCookie('flag');

        /*  console.log("browser.location.href=", browser.location.href);
          console.log("browser.location.href=", browser.location.href);

          console.log('Cookie', value);
          console.log('Cookie flag= ', browser.getCookie('flag'));
          console.log('Cookie connect.sid= =', browser.getCookie('connect.sid='));
          console.log('Cookie', browser.cookies);*/
    });

    return res.redirect("/")
}


app.post('/send_admin', handleRecaptchaV2, sendAdmin);


app.get('/send_admin/', (req, res) => {
    return res.render('send_admin');
});


app.get('/view_notes/', (req, res) => {
    res.set(HEADERS);

    let urlPost = req.query.urlPost || "";

    console.log("urlPost=", urlPost)

    if (urlPost !== "") {

    }

    let userNotes = []
    UserNote.find({userId: urlPost}, function (err, docs) {
        if (docs.length !== 0) {
            userNotes = docs[0].notes
        }
        return res.render('view_notes', {notes: userNotes, headers: HEADERS, lastModified: false, etag: false});
    });
});


app.listen(CHALL_PORT, '0.0.0.0');

console.log('Server started at http://localhost:' + CHALL_PORT);
