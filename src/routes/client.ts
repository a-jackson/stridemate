import express from 'express';
import path from 'path';

export async function useClient(app: express.Application) {
  if (process.env.NODE_ENV == 'development') {
    const webpack = await import('webpack');
    const webpackDevMiddleware = await import('webpack-dev-middleware');
    const webpackHotMiddleware = await import('webpack-hot-middleware');
    const configImport = await import('../../webpack.config.js');

    const config = configImport.default('development');
    config.plugins.push(new webpack.HotModuleReplacementPlugin());

    const compiler = webpack.webpack(config);
    const devMiddleware = webpackDevMiddleware.default(compiler, {
      publicPath: '/',
    }) as any;
    app.use(devMiddleware);
    app.use(webpackHotMiddleware.default(compiler));

    app.get(
      '*',
      function (req, res) {
        var index = devMiddleware.context.outputFileSystem.readFileSync(
          path.join(config.output.path, 'index.html'),
        );
        res.end(index);
      }.bind(this),
    );
  } else {
    app.use(express.static(path.join(__dirname, '../public')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
  }
}
