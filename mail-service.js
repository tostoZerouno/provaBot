
var mailer = require("nodemailer");


// Use Smtp Protocol to send Email
var smtpTransport = mailer.createTransport({
    service: "Outlook",
    auth: {
        user: "tommaso.tosi92@outlook.it",
        pass: "!01Stg3z"
    }
});

module.exports ={
    sendMail: function (indirizzo, PIN) {
    
    var mail = {
        from: "Tommaso Tosi <tommaso.tosi92@outlook.it>",
        to: indirizzo,
        subject: "invio codice",
        text: "PIN",
        html: "<b>"+PIN+"</b>"
    }

    smtpTransport.sendMail(mail, function (error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }

        smtpTransport.close();
    });
    }
}