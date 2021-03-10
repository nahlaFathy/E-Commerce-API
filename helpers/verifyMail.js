"use strict";
const nodemailer = require("nodemailer");

module.exports.sendMail = async function (userMail, username, userId) {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: 'brandeldev@gmail.com',
                pass: process.env.mailPass,
            },
        });

        let info = await transporter.sendMail({
            from: {
                name: 'ECommerce',
                address: 'brandeldev@gmail.com'
            },
            to: `${userMail}`,
            subject: `[ECommerce] Welcome to ECommerce ${username}`,
            text: "Welcome to ECommerce",
            html: `
                   <body style="color: white; margin: 0 auto; width: 50%; background-color: black; padding:50px">
                    <h1>Welcome to ECommerce!</h1>
                    <div style="color:rgb(18, 102, 95); background-color: white; 
                                    padding: 60px; border-radius: 5px; border: rgb(69, 85, 83) 2px solid;">
                        <h3>Almost done, ${username}! To complete your ECommerce sign up, we just need to verify your 
                            email address: ${userMail}</h3>
                        <div>
                         <a none;" href="http://127.0.0.1:3000/api/users/verify/${userId}">
                         <button style="height: 30px; background-color: #44c1c1c7; 
                         border: none; border-radius: 5%; margin: 10px; cursor: pointer;"> Verify your mail address</button><br>
                         </a>
                        </div>
                    </div>
                   </body>`,
        });

        console.log("Message sent: %s", info.messageId);
    }
    catch (err) {
        console.log(err.message)
    }
}