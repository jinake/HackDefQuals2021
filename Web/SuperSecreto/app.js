const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;
const flag = process.env.FLAG;

app.use(express.urlencoded({
    extended: true
}))

// Show my little Sample Site to the user
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Send source code to the user
app.get('/source', function (req, res) {
    res.download(path.join(__dirname, '/app.js'));
});

// Make sure no username starts with SS
app.post('/validate', (req, res) => {
    let username = req.body.username
    if (username.startsWith('SS') || username.startsWith('ss') ||
        username.startsWith('sS') || username.startsWith('Ss')) {
        username = username.replace("SS", 'nopo!');
        username = username.replace("ss", 'nopo!');
        username = username.replace("sS", 'nopo!');
        username = username.replace("Ss", 'nopo!');
    }
    username = username.toUpperCase();

    if (username.startsWith('SS'))
        res.send(flag)
    else {
        res.send("Usuario: " + username);
    }
    res.end()
})

app.listen(port);
console.log('Server started at http://localhost:' + port);
