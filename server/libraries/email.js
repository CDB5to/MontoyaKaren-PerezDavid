/*jshint esversion: 8*/
const nodemailer = require('nodemailer');
const mainEmail = 'ejemplo@gmail.com';

class email {
    constructor() {
        this.transport = nodemailer.createTransport({
            service: 'gmail',
            port: 8000,
            secure: false,
            auth: {
                user: mainEmail,
                pass: 'contra'
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    sendEmail(strCorreo) {

        const emailBody = {
            from: mainEmail,
            to: strCorreo,
            subject: 'holaaa',
            html: "<body style='color:red;'>hgfhfh</body>"

        };

        this.transport.sendMail(emailBody, (err) => {
            if (err) {
                return console.log(err.message);
            }
        });
    }
}

module.exports = new email();