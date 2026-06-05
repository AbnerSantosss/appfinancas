import { settingsRepository } from '../repositories/settings.repository';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export class SettingsService {
  async getSalary() {
    const setting = await settingsRepository.get('base_salary');
    return setting ? parseFloat(setting.value) : 0;
  }

  async updateSalary(value: number) {
    return settingsRepository.upsert('base_salary', value.toString());
  }

  /**
   * Retorna configuração SMTP salva no banco.
   * Retorna null se não houver configuração salva.
   */
  async getSmtpConfig(): Promise<SmtpConfig | null> {
    const setting = await settingsRepository.get('smtp_config');
    if (!setting) return null;

    try {
      const config = JSON.parse(setting.value);
      // Retorna sem a senha para exibição no frontend
      return config;
    } catch {
      return null;
    }
  }

  /**
   * Retorna configuração SMTP com a senha (uso interno).
   */
  async getSmtpConfigFull(): Promise<SmtpConfig | null> {
    const setting = await settingsRepository.get('smtp_config');
    if (!setting) return null;

    try {
      return JSON.parse(setting.value);
    } catch {
      return null;
    }
  }

  /**
   * Salva configuração SMTP no banco.
   */
  async updateSmtpConfig(config: SmtpConfig) {
    await settingsRepository.upsert('smtp_config', JSON.stringify(config));
    return { success: true };
  }
}

export const settingsService = new SettingsService();
