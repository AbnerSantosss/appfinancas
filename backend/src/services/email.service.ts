import nodemailer from 'nodemailer';
import { settingsService, SmtpConfig } from './settings.service';

/**
 * Serviço de envio de emails.
 * Primeiro tenta carregar config SMTP do banco de dados.
 * Fallback para variáveis de ambiente.
 * Se nenhum estiver configurado, retorna false.
 */
class EmailService {
  /**
   * Cria um transporter sob demanda, buscando config do DB ou env vars.
   */
  private async getTransporter(): Promise<{ transporter: nodemailer.Transporter; fromAddress: string } | null> {
    // 1. Tenta carregar do banco de dados
    try {
      const dbConfig = await settingsService.getSmtpConfigFull();
      if (dbConfig && dbConfig.host && dbConfig.user && dbConfig.pass) {
        const transporter = nodemailer.createTransport({
          host: dbConfig.host,
          port: dbConfig.port || 587,
          secure: (dbConfig.port || 587) === 465,
          auth: { user: dbConfig.user, pass: dbConfig.pass },
        });
        return { transporter, fromAddress: dbConfig.from || 'noreply@senafinance.com' };
      }
    } catch {
      // DB não disponível, tenta env vars
    }

    // 2. Fallback para variáveis de ambiente
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: parseInt(process.env.SMTP_PORT || '587') === 465,
        auth: { user, pass },
      });
      return { transporter, fromAddress: process.env.SMTP_FROM || 'noreply@senafinance.com' };
    }

    return null;
  }

  /**
   * Verifica se SMTP está configurado (DB ou env).
   */
  async checkConfigured(): Promise<boolean> {
    const result = await this.getTransporter();
    return result !== null;
  }

  /**
   * Testa a conexão SMTP.
   */
  async testConnection(config: SmtpConfig): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port || 587,
        secure: (config.port || 587) === 465,
        auth: { user: config.user, pass: config.pass },
      });

      await transporter.verify();
      return { success: true, message: 'Conexão SMTP estabelecida com sucesso!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Falha na conexão SMTP.' };
    }
  }

  /**
   * Envia email de convite com credenciais de acesso.
   */
  async sendInviteEmail(toEmail: string, password: string, name?: string): Promise<boolean> {
    const transport = await this.getTransporter();
    if (!transport) return false;

    try {
      await transport.transporter.sendMail({
        from: `"Sena Finance" <${transport.fromAddress}>`,
        to: toEmail,
        subject: '🎉 Convite — Sena Family Finance',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
            <div style="background: linear-gradient(135deg, #10b981, #14b8a6); padding: 32px 24px; text-align: center;">
              <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">Sena Family Finance</h1>
              <p style="color: #064e3b; margin: 8px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Convite de Acesso</p>
            </div>
            <div style="padding: 32px 24px;">
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Olá${name ? ` <strong style="color: #fff;">${name}</strong>` : ''}! 👋<br><br>
                Você foi convidado(a) para acessar o <strong style="color: #10b981;">Sena Family Finance</strong>. 
                Use as credenciais abaixo para fazer seu primeiro login:
              </p>
              <div style="background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155;">
                <div style="margin-bottom: 12px;">
                  <span style="color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Email</span>
                  <p style="color: #fff; font-size: 16px; font-weight: 700; margin: 4px 0 0;">${toEmail}</p>
                </div>
                <div>
                  <span style="color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Senha</span>
                  <p style="color: #10b981; font-size: 18px; font-weight: 800; margin: 4px 0 0; font-family: monospace; letter-spacing: 1px;">${password}</p>
                </div>
              </div>
              <p style="color: #64748b; font-size: 12px; margin: 24px 0 0; line-height: 1.5;">
                ⚠️ Recomendamos que você altere sua senha após o primeiro acesso.
              </p>
            </div>
            <div style="padding: 16px 24px; border-top: 1px solid #1e293b; text-align: center;">
              <p style="color: #475569; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin: 0;">
                Sena Family Finance • Self-Hosted
              </p>
            </div>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de convite:', error);
      return false;
    }
  }

  /**
   * Envia email notificando que a senha foi resetada.
   */
  async sendPasswordResetEmail(toEmail: string, newPassword: string): Promise<boolean> {
    const transport = await this.getTransporter();
    if (!transport) return false;

    try {
      await transport.transporter.sendMail({
        from: `"Sena Finance" <${transport.fromAddress}>`,
        to: toEmail,
        subject: '🔑 Senha Resetada — Sena Family Finance',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
            <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 32px 24px; text-align: center;">
              <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">Senha Resetada</h1>
              <p style="color: #78350f; margin: 8px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Sena Family Finance</p>
            </div>
            <div style="padding: 32px 24px;">
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Sua senha foi resetada pelo administrador. Use a nova senha abaixo para acessar o sistema:
              </p>
              <div style="background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155;">
                <div>
                  <span style="color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Nova Senha</span>
                  <p style="color: #f59e0b; font-size: 18px; font-weight: 800; margin: 4px 0 0; font-family: monospace; letter-spacing: 1px;">${newPassword}</p>
                </div>
              </div>
              <p style="color: #64748b; font-size: 12px; margin: 24px 0 0; line-height: 1.5;">
                ⚠️ Recomendamos que você altere esta senha após o próximo login.
              </p>
            </div>
            <div style="padding: 16px 24px; border-top: 1px solid #1e293b; text-align: center;">
              <p style="color: #475569; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin: 0;">
                Sena Family Finance • Self-Hosted
              </p>
            </div>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de reset:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
