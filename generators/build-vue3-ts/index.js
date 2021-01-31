'use strict'
const GeneratorBase = require('../generator-base')
const chalk = require('chalk')
const astUtils = require('../../utils/ast-utils')
const fs = require('fs')
const yosay = require('yosay')

module.exports = class extends GeneratorBase {
  constructor(args, opts) {
    super(args, opts)
  }

  initializing() {
    super._storeConfig('project-type', 'ts')
  }

  async prompting() {
    await super.askForPackageInfo()
    await super.askForAddons()
    this.props = this.config.get('props')
  }

  _configuring() {
    return {
      async initPkgJson(generator) {
        const appname = generator.props.name

        generator.log(`${chalk.cyan('❖ Generating default package.json...\n')}`)

        const pkgJson = {
          name: `${appname}`,
          version: `${generator.props.version}`,
          description: `${generator.props.description}`,
          author: `${generator.props.author}`,
          license: `${generator.props.license}`,
          scripts: {
            serve: 'vue-cli-service serve',
            'build:prod': 'vue-cli-service build',
            'build:stage': 'vue-cli-service build --mode staging',
            preview: 'node build/index.js --preview',
            'test:unit': 'vue-cli-service test:unit',
            lint: 'vue-cli-service lint'
          }
        }

        // Extend or create package.json file in destination path
        await generator.fs.extendJSON(generator.destinationPath('package.json'), pkgJson)

        generator.log(`${chalk.green('✔ Generation completed\n')}`)
      }
    }
  }

  configuring() {
    const configurations = this._configuring()
    // Generation package.json
    configurations.initPkgJson(this)
  }

  _writing() {
    return {
      async copyTemplate(generator) {
        // Copy all default templates into destination folder
        generator.log(
          `${chalk.cyan('❖ Coping all default templates into destination folder...\n')}`
        )

        // `public/index.html` Template variables.
        generator.props.webpackConfig = {
          name: `%= webpackConfig.name %`
        }
        generator.props.BASE_URL = `%= BASE_URL %`

        await generator.fs.copyTpl(
          `${generator.templatePath()}/default/**/!(_|.DS)`,
          generator.destinationPath(),
          generator.props,
          {},
          { globOptions: { ignore: '.DS_Store', dot: true } }
        )

        generator.log(`${chalk.green('✔ Template copy completed\n')}`)
      },
      async compileSVG(generator) {
        const addonPath = `${generator.templatePath()}/addons/svg-addon`
        // Copying SVG Component
        await generator.fs.copyTpl(
          `${addonPath}/src/components/SvgIcon/**/!(_)`,
          `${generator.destinationPath()}/src/components/SvgIcon`
        )

        // Copying SVG `icon` folder
        await generator.fs.copyTpl(
          `${addonPath}/src/icons/**/!(_)`,
          `${generator.destinationPath()}/src/icons`
        )
      },
      async compileAPI(generator) {
        const addonPath = `${generator.templatePath()}/addons/api-addon`
        // Copying `api` folders and files
        await generator.fs.copyTpl(
          `${addonPath}/src/api/**/!(_)`,
          `${generator.destinationPath()}/src/api`
        )
        // Copying api `utils` folders and files
        await generator.fs.copyTpl(
          `${addonPath}/src/utils/**/!(_)`,
          `${generator.destinationPath()}/src/utils`
        )
      },
      compileAuth(generator) {
        // todo:: WIP
      }
    }
  }

  writing() {
    const writings = this._writing()
    // Copy Vue3 default template folder and files.
    writings.copyTemplate(this)
    // Installing SVG addon
    if (super._checkAddon('svg')) writings.compileSVG(this)
    // Installing API addon
    if (super._checkAddon('api')) writings.compileAPI(this)
    // Installing Auth addon
    if (super._checkAddon('auth')) writings.compileAuth(this)
  }

  _install() {
    return {
      coreDependencies(generator) {
        // Install core dependencies.
        generator.yarnInstall(
          [
            'core.js',
            'vue@next',
            'vue-router@next',
            'vuex@next',
            'normalize.css',
            'nprogress',
            'vue-class-component@next'
          ],
          {
            dev: false
          }
        )
      },
      devDependencies(generator) {
        // Install all dev dependencies.
        generator.yarnInstall(
          [
            '@types/chai',
            '@types/mocha',
            '@types/nprogress',
            '@typescript-eslint/eslint-plugin',
            '@typescript-eslint/parser',
            '@vue/cli-plugin-babel',
            '@vue/cli-plugin-eslint',
            '@vue/cli-plugin-router',
            '@vue/cli-plugin-typescript',
            '@vue/cli-plugin-unit-mocha',
            '@vue/cli-plugin-vuex',
            '@vue/cli-service',
            '@vue/compiler-sfc',
            '@vue/eslint-config-prettier',
            '@vue/eslint-config-typescript',
            '@vue/test-utils',
            'chai',
            'eslint',
            'eslint-plugin-prettier',
            'eslint-plugin-vue',
            'node-sass',
            'prettier',
            'sass-loader',
            'typescript@next'
          ],
          {
            dev: true
          }
        )
      },
      svgDependencies(generator) {
        // Install SVG and svg-loader
        generator.yarnInstall(['svg-sprite-loader', 'svgo'], { dev: true })
      },
      axiosDependencies(generator) {
        // Install axios
        generator.yarnInstall(['axios', 'js-cookie'], { dev: false })
        generator.yarnInstall(['@types/js-cookie'], { dev: true })
      }
    }
  }

  install() {
    const installations = this._install()
    this.log(`${chalk.cyan('❖ Installing dependencies...\n')}`)

    installations.coreDependencies(this)
    installations.devDependencies(this)
    // Installing SVG dependencies
    if (super._checkAddon('svg')) installations.svgDependencies(this)
    // Installing Axios dependencies
    if (super._checkAddon('api')) installations.axiosDependencies(this)
  }

  _end() {
    return {
      instructions(generator) {
        generator.log(
          chalk.magenta(
            ' _______________________________________________________________________________________________________________\n'
          )
        )
        generator.log(`${chalk.green.bold('✔ Project scaffolding completed!\n')}`)
        generator.log(`${chalk.magenta('Use following command to start a server:\n')}`)
        generator.log(`${chalk.green('yarn')} serve`)
      },
      svgInjection(generator) {
        // Require files been written
        // Therefore this process is putted at the end.

        // Adding Icon import
        const mainJs = `${generator.destinationPath()}/src/main.ts`
        let mainJsData = fs.readFileSync(mainJs)
        mainJsData = mainJsData.toString()

        // addAfterImportFor
        mainJsData = astUtils.addAfterImportFor(
          mainJsData,
          `import { registerSvgIcon } from '@/icons'`
        )

        // addGlobalComponent
        mainJsData = astUtils.addGlobalComponent(mainJsData, 'registerSvgIcon')
        fs.writeFileSync(mainJs, mainJsData, {
          encoding: 'utf8',
          flag: 'w'
        })

        // Injecting svg-loader into vue config
        const vueConfigFile = `${generator.destinationPath()}/vue.config.js`
        let vueConfigFileData = fs.readFileSync(vueConfigFile)
        vueConfigFileData = vueConfigFileData.toString()
        vueConfigFileData = astUtils.addSvgLoader(vueConfigFileData)
        fs.writeFileSync(vueConfigFile, vueConfigFileData, {
          encoding: 'utf8',
          flag: 'w'
        })
      }
    }
  }

  end() {
    const endings = this._end()
    this.log(`${chalk.green.bold('✔ Dependencies installation completed\n')}`)
    // Injecting SVG codes
    if (super._checkAddon('svg')) endings.svgInjection(this)
    // Ending instructions
    endings.instructions(this)
  }
}
