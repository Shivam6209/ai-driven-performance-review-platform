import React from 'react';
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import { createEmotionCache } from '../utils/createEmotionCache';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const originalRenderPage = ctx.renderPage;
    const cache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App: any) => (props) =>
          <App emotionCache={cache} {...props} />,
      });

    const initialProps = await Document.getInitialProps(ctx);
    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map((style) => (
      <style
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
        key={style.key}
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ));

    return {
      ...initialProps,
      styles: [...React.Children.toArray(initialProps.styles), ...emotionStyleTags],
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <title>PerformAI - AI-Powered Performance Management</title>
          <meta name="application-name" content="PerformAI" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="PerformAI" />
          <meta name="description" content="AI-powered performance reviews, OKR tracking, and continuous feedback" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#3f51b5" />

          <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM2Y1MWI1O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxYTIzN2U7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwgOCkiPgogICAgPHJlY3QgeD0iMCIgeT0iOCIgd2lkdGg9IjIuNSIgaGVpZ2h0PSI4IiByeD0iMS4yNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjcpIi8+CiAgICA8cmVjdCB4PSIzLjUiIHk9IjUiIHdpZHRoPSIyLjUiIGhlaWdodD0iMTEiIHJ4PSIxLjI1IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOSkiLz4KICAgIDxyZWN0IHg9IjciIHk9IjIiIHdpZHRoPSIyLjUiIGhlaWdodD0iMTQiIHJ4PSIxLjI1IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDEpIi8+CiAgICA8cmVjdCB4PSIxMC41IiB5PSI2IiB3aWR0aD0iMi41IiBoZWlnaHQ9IjEwIiByeD0iMS4yNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjgpIi8+CiAgPC9nPgo8L3N2Zz4K" />
          <link rel="shortcut icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM2Y1MWI1O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxYTIzN2U7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwgOCkiPgogICAgPHJlY3QgeD0iMCIgeT0iOCIgd2lkdGg9IjIuNSIgaGVpZ2h0PSI4IiByeD0iMS4yNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjcpIi8+CiAgICA8cmVjdCB4PSIzLjUiIHk9IjUiIHdpZHRoPSIyLjUiIGhlaWdodD0iMTEiIHJ4PSIxLjI1IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOSkiLz4KICAgIDxyZWN0IHg9IjciIHk9IjIiIHdpZHRoPSIyLjUiIGhlaWdodD0iMTQiIHJ4PSIxLjI1IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDEpIi8+CiAgICA8cmVjdCB4PSIxMC41IiB5PSI2IiB3aWR0aD0iMi41IiBoZWlnaHQ9IjEwIiByeD0iMS4yNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjgpIi8+CiAgPC9nPgo8L3N2Zz4K" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 