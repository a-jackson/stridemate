import express from 'express';
import path from 'path';

export async function useClient(app: express.Application) {
  if (process.env.NODE_ENV == 'development') {
    const webpack = await import('webpack');
    const webpackDevMiddleware = await import('webpack-dev-middleware');
    const config = await import('../../webpack.config.js');

    const devConfig = config.default('development');
    const compiler = webpack.webpack(devConfig);
    app.use(
      webpackDevMiddleware.default(compiler, {
        publicPath: '/',
      }),
    );
  } else {
    app.use(express.static(path.join(__dirname, '../public')));

    app.get('*', (req, res) => {
      res.sendFile(__dirname, '../public/index.html');
    });
  }
}
