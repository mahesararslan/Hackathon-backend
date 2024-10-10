import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',  // Or your preferred email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email) {
    const otp = this.generateOTP();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Authentication',
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return otp;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send OTP');
    }
  }
}

export default new EmailService();