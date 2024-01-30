import { AssertionError } from './error';

export function assert<T extends Error>(condition: unknown, error?: string | T): asserts condition {
  if (!condition) {
    if (!error) {
      throw new AssertionError('Assertion Error');
    }
    if (typeof error === 'string') {
      throw new AssertionError(error);
    }
    throw error;
  }
}
