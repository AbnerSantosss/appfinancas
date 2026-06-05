import { settingsRepository } from '../repositories/settings.repository';

export class SettingsService {
  async getSalary() {
    const setting = await settingsRepository.get('base_salary');
    return setting ? parseFloat(setting.value) : 0;
  }

  async updateSalary(value: number) {
    return settingsRepository.upsert('base_salary', value.toString());
  }
}

export const settingsService = new SettingsService();
