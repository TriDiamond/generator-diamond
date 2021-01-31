'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')

module.exports = class extends Generator {
  prompting() {
    // Change application name to dash linking.
    this.appname = this.appname.replace(/\s+/g, '-')
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to the ${chalk.red('Vue3 Webpack')} generator!`))

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Your project name',
        default: this.appname // Default to current folder name
      },
      {
        type: 'input',
        name: 'version',
        message: "Your project's version",
        default: '0.1.0'
      },
      {
        type: 'input',
        name: 'author',
        message: "Your project's author",
        store: true
      },
      {
        type: 'list',
        name: 'license',
        message: "Your project's license",
        choices: ['MIT']
      }
    ]

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props
    })
  }

  initPkg() {
    const pkgJson = {
      name: `${this.props.name}`,
      version: `${this.props.version}`,
      description: `${this.props.description}`,
      author: `${this.props.author}`,
      license: `${this.props.license}`,
      scripts: {
        serve: 'webpack-dev-server --config build/webpack.dev.js',
        'build:dev': 'webpack --config build/webpack.dev.js',
        'build:prod': 'webpack --config build/webpack.prod.js'
      },
      dependencies: {},
      devDependencies: {},
      browserslist: ['> 1%', 'last 2 versions']
    }

    // Extend or create package.json file in destination path
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson)
  }

  writing() {
    // Copy all default templates into destination folder
    this.fs.copyTpl(`${this.templatePath()}/\*\*/!(\_)`, this.destinationPath(), this.props)
  }

  install() {
    // Install vue3
    this.yarnInstall(['vue@next', 'vue-router@next', 'vuex@next'], {
      dev: false
    })
    // Install Webpack
    this.yarnInstall(
      ['webpack@^4.44.2', 'webpack-cli@^3.3.11', 'webpack-dev-server', 'webpack-merge'],
      { dev: true }
    )
    // Install Webpack plugins
    this.yarnInstall(
      [
        'html-webpack-plugin',
        'clean-webpack-plugin',
        'terser-webpack-plugin',
        'optimize-css-assets-webpack-plugin'
      ],
      { dev: true }
    )
    // Install loaders
    this.yarnInstall(
      [
        '@vue/compiler-sfc',
        'vue-loader-v16',
        'vue-template-compiler',
        'file-loader',
        'image-webpack-loader',
        'style-loader',
        'css-loader',
        'sass-loader',
        'sass',
        'fibers',
        'postcss',
        'postcss-loader',
        'autoprefixer',
        'cssnano'
      ],
      { dev: true }
    )
  }
}
