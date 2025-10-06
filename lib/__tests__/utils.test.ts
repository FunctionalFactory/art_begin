import { cn } from '../utils';

describe('cn utility function', () => {
  it('should return a single class name', () => {
    const result = cn('text-red-500');
    expect(result).toBe('text-red-500');
  });

  it('should merge multiple class names', () => {
    const result = cn('text-red-500', 'bg-blue-500', 'p-4');
    expect(result).toBe('text-red-500 bg-blue-500 p-4');
  });

  it('should handle conditional classes and filter falsy values', () => {
    const result = cn(
      'base-class',
      true && 'true-class',
      false && 'false-class',
      null,
      undefined,
      '',
      'another-class'
    );
    expect(result).toBe('base-class true-class another-class');
  });

  it('should merge conflicting Tailwind classes (last class wins)', () => {
    // tailwind-merge ensures that conflicting utilities like px-2 and px-4 are merged correctly
    const result = cn('px-2 py-4', 'px-4');
    expect(result).toBe('py-4 px-4');
  });

  it('should handle undefined and null values gracefully', () => {
    const result = cn(undefined, 'valid-class', null, 'another-valid');
    expect(result).toBe('valid-class another-valid');
  });
});
