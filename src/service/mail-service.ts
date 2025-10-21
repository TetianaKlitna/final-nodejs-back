import nodemailer, { Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

class MailService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>

  constructor () {
    // const options: SMTPTransport.Options = {
    //   host: process.env.SMTP_HOST,
    //   port: Number(process.env.SMTP_PORT ?? 587),
    //   secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587/25
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD
    //   }
    // }

    const options: SMTPTransport.Options = {
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    }

    this.transporter = nodemailer.createTransport(options)
  }

  async sendActivationLink (to: string, link: string): Promise<void> {
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER
    const mailOptions = {
      from,
      to,
      subject: 'Activation Link',
      html: `
        <p>Hello,</p>
        <p>Thank you for signing up for <strong>NextTask</strong>! 🎉</p>
        <p>Please activate your account by clicking the link below:</p>
        <p><a href="${link}">Activate My Account</a></p>
        <p>If you did not create this account, you can safely ignore this email.</p>
        <br/>
        <p>Best regards,<br/>NextTask Team</p>
      `
    }

    await this.transporter.sendMail(mailOptions)
  }

  async sendResetPasswordLink (to: string, link: string): Promise<void> {
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER
    const mailOptions = {
      from,
      to,
      subject: 'Password Reset Request',
      html: `
        <p>Hello,</p>
        <p>We received a request to reset your password.</p>
        <p>You can reset it by clicking the link below:</p>
        <p><a href="${link}">Reset Password</a></p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/>NextTask Team</p>
      `
    }

    await this.transporter.sendMail(mailOptions)
  }
}

export default new MailService()
