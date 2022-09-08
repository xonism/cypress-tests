/* eslint-disable no-undef */
import path from 'path'

module.exports = {
  mode: 'development',
  // webpack will transpile TS and JS files
  resolve: {
    extensions: [ '.ts', '.js' ],
    alias: {
      '@fixtures': path.resolve(process.cwd(), 'cypress/fixtures/'),
      '@support': path.resolve(process.cwd(), 'cypress/support/'),
      '@entity': path.resolve(process.cwd(), 'cypress/support/entity/'),
      '@selectors': path.resolve(process.cwd(), 'selectors/'),
    }
  },
  module: {
    rules: [
      {
        // every time webpack sees a TS file (except for node_modules)
        // webpack will use "ts-loader" to transpile it to JavaScript
        test: /\.ts$/,
        exclude: [ /node_modules/ ],
        use: [
          {
            loader: 'ts-loader',
            options: {
              // skip typechecking for speed
              transpileOnly: true
            }
          }
        ]
      }
    ]
  }
}
