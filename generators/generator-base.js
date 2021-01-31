'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const _ = require('lodash')

module.exports = class GeneratorBase extends Generator {
  _displayLogo() {
    // Have Yeoman greet the user.
    this.log('\n')
    this.log(`${chalk.magenta.bold('Welcome to the frontend generator:\n')}`)
    this.log(`${chalk.cyan('██████╗ ')}${chalk.cyan('██╗ █████╗ ███╗   ███╗ ██████╗ ███╗   ██╗██████╗ ')}`); // prettier-ignore
    this.log(`${chalk.cyan('██╔══██╗')}${chalk.cyan('██║██╔══██╗████╗ ████║██╔═══██╗████╗  ██║██╔══██╗')}`); // prettier-ignore
    this.log(`${chalk.cyan('██║  ██║')}${chalk.cyan('██║███████║██╔████╔██║██║   ██║██╔██╗ ██║██║  ██║')}`); // prettier-ignore
    this.log(`${chalk.cyan('██║  ██║')}${chalk.cyan('██║██╔══██║██║╚██╔╝██║██║   ██║██║╚██╗██║██║  ██║')}`); // prettier-ignore
    this.log(`${chalk.cyan('██████╔╝')}${chalk.cyan('██║██║  ██║██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██████╔╝')}`); // prettier-ignore
    this.log(`${chalk.cyan('╚═════╝ ')}${chalk.cyan('╚═╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝ \n')}`); // prettier-ignore
    this.log(`${chalk.magenta.bold("Made by TriDiamond (三钻)｜https://tridiamond.tech\n")}`); // prettier-ignore

    this.log(
      chalk.magenta(
        ' _______________________________________________________________________________________________________________\n'
      )
    )
  }

  async askForPackageInfo() {
    // Change application name to dash linking.
    this.appname = this.appname.replace(/\s+/g, '-')

    const answers = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: `Your project ${chalk.magenta('name')}`,
        default: this.appname // Default to current folder name
      },
      {
        type: 'input',
        name: 'description',
        message: `Your project's ${chalk.magenta('description')}`
      },
      {
        type: 'input',
        name: 'version',
        message: `Your project's ${chalk.magenta('version')}`,
        default: '0.1.0'
      },
      {
        type: 'input',
        name: 'author',
        message: `Your project's ${chalk.magenta('author')}`,
        store: true
      },
      {
        type: 'list',
        name: 'license',
        message: `Your project's ${chalk.magenta('license')}`,
        choices: ['MIT']
      }
    ])

    this._storeConfig('props', answers)
    return new Promise((resolve, reject) => {
      resolve(answers)
    })
  }

  async askForAddons() {
    const addons = [
      { name: 'svg-loader', value: 'svg' },
      { name: 'axios-api', value: 'api' },
      { name: 'auth', value: 'auth' }
    ]

    const answers = await this.prompt([
      {
        type: 'checkbox',
        name: 'addons',
        message: `Choose the ${chalk.magenta('addons')} you need`,
        choices: addons
      }
    ])

    this._storeConfig('props', answers)
    return new Promise((resolve, reject) => {
      resolve(answers.addons)
    })
  }

  /**
   * Storing local config data
   * @param {String} key
   * @param {Object} props
   */
  _storeConfig(key, props) {
    const config = this.config.get(key)

    if (config && typeof config === 'object') {
      props = _.merge(config, props)
    }

    this.config.set(key, props)
    this.config.save()
  }

  /**
   * Get local stored data config by key
   * @param {String} key
   */
  _getConfig(key) {
    return this.config.get(key)
  }

  /**
   * Check if addon is required
   * @param {String} addon
   * @returns {Boolean}
   */
  _checkAddon(addon) {
    const props = this.config.get('props')
    if (!props) return false
    if (_.indexOf(props.addons, addon) >= 0) return true
    return false
  }
}
