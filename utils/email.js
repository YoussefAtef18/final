const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url, message) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = `Crafts <${process.env.GMAIL_USERNAME}>`;
    this.message = message;
  }
  newTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    //1)render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.name,
      url: this.url,
      subject,
      message: this.message
    });

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
      // html:
    };
    //3)create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      'welcome to Crafts family!'
      );
  }

  async sendPassordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  async sendContactUS() {
    await this.send(
      'contactUs',
      'my problem is....',
    );
  }
};

// module.exports = class Email1 {
//   constructor(user, city, address, phone, floorNum, flatNum, products) {
//     this.to = user.email;
//     this.name = user.name;
//     this.from = `Crafts <${process.env.GMAIL_USERNAME}>`;
//     this.city = city;
//     this.address = address;
//     this.phone = phone;
//     this.floorNum = floorNum;
//     this.flatNum = flatNum;
//     this.products = products;
//   }
//   newTransport() {
//     return nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.GMAIL_USERNAME,
//         pass: process.env.GMAIL_PASSWORD,
//       },
//     });
//   }
//   async Order(template, subject) {
//     //1)render HTML based on a pug template
//     const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
//       subject,
//       city: this.city,
//       address: this.address,
//       phone: this.phone,
//       floorNum: this.floorNum,
//       flatNum: this.flatNum,
//       products: this.products

//     });

//     // 2) Define the email options
//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject,
//       html,
//       text: htmlToText.fromString(html),
//       // html:
//     };
//     //3)create a transport and send email
//     await this.newTransport().sendMail(mailOptions);
//   }
//   async order() {
//     await this.Order(
//       'order',
//       'my order is',
//     );
//   }
// };
