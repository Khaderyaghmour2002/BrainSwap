const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig();
  return {
    transformer: {
      ...config.transformer,
      assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    },
    resolver: {
      ...config.resolver,
    },
  };
})();
