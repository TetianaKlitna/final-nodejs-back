import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

class MailService {
  transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  constructor() {
    const options: SMTPTransport.Options = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    this.transporter = nodemailer.createTransport(options);
  }

  async sendActivationLink(to: string, link: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"YourApp Team" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Activate your account',
      text: `Activate your account: ${link}`,
      html: `<p>Activate your account: <a href="${link}">${link}</a></p>`,
    });
  }
}

export default new MailService();
