const { loadRootEnv } = require('../../scripts/load-root-env.cjs')

loadRootEnv(__dirname)

module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      require.resolve('react-native-css-interop/dist/babel-plugin'),
      [
        '@babel/plugin-transform-react-jsx',
        {
          runtime: 'automatic',
          importSource: 'react-native-css-interop',
        },
      ],
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@hooks': './hooks',
            '@lib': './lib',
            '@store': './store',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  }
}
