import { add } from '@/module';

describe('test', () => {
  it('add', () => {
    const result = add(1, 2);
    expect(result).toBe(3);
  });
});
