const { loadRootEnv } = require('../../scripts/load-root-env.cjs')

loadRootEnv(__dirname)

module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    plugins: [
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
