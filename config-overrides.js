const { injectBabelPlugin } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');

module.exports = function override(config, env) {
  // override webpack config here...
  config = injectBabelPlugin(['import', { libraryName: 'antd', style: true, libraryDirectory: "es" }], config);  // change importing css to less
  config = rewireLess.withLoaderOptions({
    modifyVars: { "@primary-color": "#44a8d7",
                  "@secondary-color": "#6b45d1",
                  "@font-family": "Barlow",
                  "@body-background": "#f1f6fa",
                  "@text-color": "#38383a"
                },
  })(config, env);
  return config;
};
