// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(): void {
    // Do nothing
  }

  unobserve(): void {
    // Do nothing
  }

  disconnect(): void {
    // Do nothing
  }

  private callback: IntersectionObserverCallback;
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe(): void {
    // Do nothing
  }

  unobserve(): void {
    // Do nothing
  }

  disconnect(): void {
    // Do nothing
  }
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
}); 