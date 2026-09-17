/**
 * Nickname <-> Synthetic Email and validation helpers
 * Synthetic email format: ${nickname.toLowerCase()}@studentportfolio.app
 */

export const SYNTHETIC_DOMAIN = 'studentportfolio.app';

export function nicknameToEmail(nickname: string): string {
  return `${nickname.trim().toLowerCase()}@${SYNTHETIC_DOMAIN}`;
}

export function emailToNickname(email: string): string {
  if (!email) return '';
  const atIndex = email.indexOf('@');
  return atIndex !== -1 ? email.substring(0, atIndex) : email;
}

export function validateNickname(nickname: string): { isValid: boolean; error?: string } {
  const trimmed = nickname.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Nickname is required.' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Nickname must be at least 3 characters.' };
  }
  if (trimmed.length > 20) {
    return { isValid: false, error: 'Nickname must be 20 characters or fewer.' };
  }
  const regex = /^[a-zA-Z0-9_-]+$/;
  if (!regex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Only letters, numbers, hyphens (-), and underscores (_) are allowed.',
    };
  }
  return { isValid: true };
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters.' };
  }
  return { isValid: true };
}
