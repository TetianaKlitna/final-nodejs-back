import nodemailer, { Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { Resend } from 'resend'

class MailService {
  //transporter: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>

  //constructor () {
  // const options: SMTPTransport.Options = {
  //   host: process.env.SMTP_HOST,
  //   port: Number(process.env.SMTP_PORT) || 587,
  //   secure: false,
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASSWORD
  //   }
  // }

  // this.transporter = nodemailer.createTransport(options)
  //}

  resend = new Resend(process.env.RESEND_API_KEY)

  async sendActivationLink (to: string, link: string): Promise<void> {
    await this.resend.emails.send({
      from: `"NextTask Team" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Welcome! Please activate your account',
      html: `
            <p>Hello,</p>
            <p>Thank you for signing up for <strong>NextTask</strong>! 🎉</p>
            <p>Please activate your account by clicking the link below:</p>
            <p><a href="${link}">Activate My Account</a></p>
            <p>If you did not create this account, you can safely ignore this email.</p>
            <br/>
            <p>Best regards,<br/>NextTask Team</p>
          `
    })
  }

  async sendResetPasswordLink (to: string, link: string): Promise<void> {
    await this.resend.emails.send({
      from: `"NextTask Team" <${process.env.SMTP_USER}>`,
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
    })
  }
}

export default new MailService()
