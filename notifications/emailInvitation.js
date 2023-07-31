const nodemailer = require('nodemailer');

// Emailing the connection request details to the user who wants to connect.
const sendInvitation = async (fromEmail, toEmail, invitationObject) =>{

    const options = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: "lilliana.dibbert@ethereal.email",
            pass: "vYZXzqcSdk75JN2R6k"
        }
    }
    
    let transporter = nodemailer.createTransport(options);
    
    let mailInfo = {
        from: fromEmail,
        to: toEmail,
        subject: "Indy Blockchain Org Connection Invitation",
        text: invitationObject,
        html: "the body of email"
    }
    
    let info = await transporter.sendMail(mailInfo);

    return info.messageId;

}

module.exports = {sendInvitation};
