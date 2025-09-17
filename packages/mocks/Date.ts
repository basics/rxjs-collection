import { vi } from 'vitest';

export const mockDate = () => {
  const mockClassConstructor = vi.fn().mockReturnValue({
    method: vi.fn()
  });

  return {
    /**
     * Here, we're assigning properties to the mock function we made above
     */
    Date: Object.assign(mockClassConstructor, {
      /**
       * This the mock for the static method. Replace "staticMethod" with the
       *  name of the method you're mocking.
       */
      now: vi.fn()
    })
  };
};
