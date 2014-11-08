var User      = require('./models/user');

module.exports = function(app, passport) {

    app.get('/', function (req, res) {
        res.render('home.html');
    });

    app.get('/funk', function (req, res) {
        res.render('funk.html');
    });

    app.get('/sites', function (req, res) {
        res.render('sites.html');
    });

}	