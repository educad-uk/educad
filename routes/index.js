var express = require('express');
var router = express.Router();
const fs = require("fs");
const Mail = require("nodemailer");
const bodyParser = require("body-parser");
const Handlebars = require("handlebars");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.static("public"));

var readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

var MailObject = Mail.createTransport({
  service: "gmail",
  auth: {
    user: "educadtuition@gmail.com",
    pass: "ocqg uppp fish prip",
  },
});

router.post("/send", (Request, Response) => {
  readHTMLFile("./views/contactDetailsEmail.pug", function (err, html) {
    if (err) {
      console.log("error reading file", err);
      return;
    }
    var template = Handlebars.compile(html);
    var replacements = {
      firstName: Request.body.firstName,
      lastName: Request.body.lastName,
      contactNumber: Request.body.contactNumber,
      tuitionType: Request.body.tuitionType,
      email: Request.body.email,
    };
    var htmlToSend = template(replacements);

    var date = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
    var MailQuery = {
      to: "educadtuition@gmail.com",
      subject:
        "New Application (#" +
        Math.floor(Math.random() * 10000000000 + 1) +
        ")",
      html: htmlToSend,
    };

    MailObject.sendMail(MailQuery, function (error, info) {
      if (error) {
        console.log(error);
        Response.sendFile(__dirname + "./views/error.pug");
      } else {
        console.log("Email sent: " + info.response);
        Response.sendFile(__dirname + "./views/index.pug");
      }
    });

    readHTMLFile("./views/recipientEmail.pug", function (err, html2) {
    if (err) {
      console.log("error reading file", err);
      return;
    }
    var template2 = Handlebars.compile(html2);
    var replacements2 = {
      firstName: Request.body.firstName,
      lastName: Request.body.lastName,
      contactNumber: Request.body.contactNumber,
      tuitionType: Request.body.tuitionType,
    };
    var htmlToSend2 = template2(replacements2);

    var MailQuery2 = {
      to: Request.body.email,
      subject: "We have recieved your application",
      html: htmlToSend2,
    };
      
    MailObject.sendMail(MailQuery2, function (error, info) {
      if (error) {
        console.log(error);
        Response.sendFile(__dirname + "./views/error.pug");
      } else {
        console.log("Email sent: " + info.response);
        Response.sendFile(__dirname + "./views/index.pug");
      }
    });
  });
});


router.get('/', function(req, res, next) {
   res.render('index');
});

module.exports = router;
