import { createHash } from 'crypto';

export const md5Hash = (input: Buffer | string): string => {
  return createHash('md5').update(input).digest('hex');
};
