import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProps } from 'next/app';
import { NextRouter, Router } from 'next/router';
import { NextComponentType } from 'next';
import App from '../_app';

// Mock the theme to avoid Material-UI theme-related issues in tests
jest.mock('@/theme/theme', () => ({
  __esModule: true,
  default: {
    palette: {
      primary: { main: '#000000' },
    },
  },
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('App', () => {
  const TestComponent: NextComponentType = () => <div>Test Page</div>;

  const mockRouter: Router = {
    pathname: '/',
    push: jest.fn(),
    prefetch: jest.fn(),
    route: '/',
    asPath: '/',
    basePath: '',
    query: {},
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    beforePopState: jest.fn(),
    forward: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
    components: {},
    sdc: {},
    sbc: {},
    sub: jest.fn(),
    clc: jest.fn(),
    locale: 'en',
    locales: ['en'],
    defaultLocale: 'en',
    domainLocales: undefined,
    isFirstPopStateEvent: jest.fn(),
    _bps: jest.fn(),
    _wrapApp: jest.fn(),
    _key: '1',
  };

  const mockPageProps: AppProps = {
    Component: TestComponent,
    pageProps: {},
    router: mockRouter,
  };

  it('renders without crashing', () => {
    render(<App {...mockPageProps} />);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('applies theme provider', () => {
    render(<App {...mockPageProps} />);
    const root = document.querySelector('body');
    expect(root).toHaveStyle({ margin: '0px' });
  });

  it('removes server-side injected CSS', () => {
    // Create a mock style element
    const mockStyle = document.createElement('style');
    mockStyle.id = 'jss-server-side';
    document.body.appendChild(mockStyle);

    render(
      <App
        Component={mockComponent}
        pageProps={mockPageProps}
        router={{} as any}
      />
    );

    // Check if the style element was removed
    expect(document.querySelector('#jss-server-side')).toBeNull();
  });
}); 