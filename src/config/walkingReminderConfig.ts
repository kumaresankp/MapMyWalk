/**
 * Central configuration for MyWalkMap's daily local walking reminder.
 *
 * To change the reminder time or message, edit ONLY this file:
 * - `enabled`: set to `false` to disable and cancel scheduled reminders
 * - `hour`: 24-hour format (0-23)
 * - `minute`: minute of the hour (0-59)
 * - `title`: notification title
 * - `messages`: pool of notification body messages
 */
export type WalkingReminderConfig = {
  enabled: boolean;
  hour: number;
  minute: number;
  title: string;
  messages: string[];
};

export const walkingReminderConfig: WalkingReminderConfig = {
  enabled: true,
  hour: 6,
  minute: 30,
  title: 'Good morning! ☀️',
  messages: [
    'A fresh morning, a fresh start. Time to go for a walk! 👟',
    'Every step counts. Get moving and make today healthier!',
    "Your morning walk is waiting. Let's make every step count!",
    'Start your day with fresh air and a little movement! 🌿',
    "A healthier day starts with one small step. Let's walk!",
  ],
};

/**
 * Validates that hour (0-23) and minute (0-59) are integers in 24-hour range.
 */
export const validateWalkingReminderConfig = (
  config: WalkingReminderConfig,
): WalkingReminderConfig => {
  if (!Number.isInteger(config.hour) || config.hour < 0 || config.hour > 23) {
    throw new Error(
      `Invalid walkingReminderConfig.hour (${config.hour}). Expected an integer from 0 to 23.`,
    );
  }
  if (
    !Number.isInteger(config.minute) ||
    config.minute < 0 ||
    config.minute > 59
  ) {
    throw new Error(
      `Invalid walkingReminderConfig.minute (${config.minute}). Expected an integer from 0 to 59.`,
    );
  }
  if (!config.title || !config.title.trim()) {
    throw new Error('Invalid walkingReminderConfig.title. Expected a non-empty string.');
  }
  if (!Array.isArray(config.messages) || config.messages.length === 0) {
    throw new Error(
      'Invalid walkingReminderConfig.messages. Expected at least one message.',
    );
  }
  return config;
};
