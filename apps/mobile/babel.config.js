const { loadRootEnv } = require('../../scripts/load-root-env.cjs')

loadRootEnv(__dirname)

module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
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
    ],
  }
}
