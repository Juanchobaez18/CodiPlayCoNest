import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly configService: ConfigService) {}

  private getTransport() {
    const host = this.configService.get<string>('config.mail.host');
    const port = this.configService.get<number>('config.mail.port');
    const user = this.configService.get<string>('config.mail.user');
    const pass = this.configService.get<string>('config.mail.pass');

    if (!host || !port || !user || !pass) {
      throw new InternalServerErrorException(
        'El servidor de correo no está configurado correctamente.',
      );
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendContactEmail(dto: CreateContactDto) {
    const transport = this.getTransport();
    const mailFrom = this.configService.get<string>('config.mail.from');
    const contactTo = this.configService.get<string>('config.mail.to');

    if (!mailFrom || !contactTo) {
      throw new InternalServerErrorException(
        'Las direcciones de correo del remitente o del destino no están configuradas.',
      );
    }

    const subject = 'Solicitud de información para clase gratis';
    const userText = `Hola ${dto.name},\n\nGracias por tu interés. Hemos recibido tu solicitud de información y pronto alguien de nuestro equipo te contactará para programar tu clase gratis.\n\nResumen de tu solicitud:\n- Correo: ${dto.email}\n${dto.phone ? `- Teléfono: ${dto.phone}\n` : ''}${dto.message ? `- Mensaje: ${dto.message}\n` : ''}\n\n¡Nos vemos pronto!`;
    const adminText = `Nueva solicitud de información desde la landing page:\n\nNombre: ${dto.name}\nCorreo: ${dto.email}\n${dto.phone ? `Teléfono: ${dto.phone}\n` : ''}${dto.message ? `Mensaje: ${dto.message}\n` : ''}`;

    await transport.sendMail({
      from: mailFrom,
      to: dto.email,
      subject,
      text: userText,
    });

    await transport.sendMail({
      from: mailFrom,
      to: contactTo,
      subject: `Nuevo contacto: ${dto.name}`,
      text: adminText,
    });

    return {
      success: true,
      message: 'Solicitud registrada y correo de confirmación enviado.',
    };
  }
}
