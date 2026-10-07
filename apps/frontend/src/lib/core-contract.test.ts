import { describe, expect, it } from 'vitest';
import { createClient, getRooms } from '@room-booking/core';

describe('core entry point', () => {
  it('exports sdk and client factory', () => {
    expect(typeof createClient).toBe('function');
    expect(typeof getRooms).toBe('function');
  });

  it('rejects unreachable api when throwOnError is set', async () => {
    const client = createClient({ baseUrl: 'http://127.0.0.1:1' });
    await expect(getRooms({ client, throwOnError: true })).rejects.toThrow();
  });
});
