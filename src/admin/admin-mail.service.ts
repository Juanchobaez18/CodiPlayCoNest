import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AdminMailService {
  private readonly logger = new Logger(AdminMailService.name);

  private createTransport(): nodemailer.Transporter | null {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
      return null;
    }
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendBulk(emails: string[], subject: string, text: string): Promise<void> {
    const transport = this.createTransport();
    if (!transport) {
      throw new ServiceUnavailableException(
        'Configura SMTP_HOST, SMTP_USER, SMTP_PASS y opcionalmente SMTP_PORT y SMTP_FROM para enviar correos.',
      );
    }
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    for (const to of emails) {
      await transport.sendMail({ from, to, subject, text });
    }
    this.logger.log(`Correos enviados: ${emails.length}`);
  }
}
