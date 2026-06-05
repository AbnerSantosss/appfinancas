import { prisma } from '../lib/prisma';

export class SettingsRepository {
  async get(key: string) {
    return prisma.settings.findUnique({ where: { key } });
  }

  async upsert(key: string, value: string) {
    return prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

export const settingsRepository = new SettingsRepository();
