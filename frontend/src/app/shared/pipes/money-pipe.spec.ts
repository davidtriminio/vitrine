import { describe, expect, it } from 'vitest';
import { MoneyPipe } from './money-pipe';

describe('MoneyPipe', () => {
  const pipe = new MoneyPipe();

  it('formats an amount with two decimals', () => {
    expect(pipe.transform(1020)).toContain('1,020.00');
  });

  it('renders zero for null/undefined', () => {
    expect(pipe.transform(null)).toContain('0.00');
    expect(pipe.transform(undefined)).toContain('0.00');
  });
});
