'use strict'
const GeneratorBase = require('../generator-base')
const chalk = require('chalk')

const APPLICATION_CONVERTOR = {
  'Vue 3 (JavaScript)': 'build-vue3-js',
  'Vue 3 (TypeScript)': 'build-vue3-ts'
}

module.exports = class DiamondGenerator extends GeneratorBase {
  init() {
    // Change application name to dash linking.
    this.appname = this.appname.replace(/\s+/g, '-')
    // Display Diamond toolchain logo.
    this._displayLogo()
  }

  async chooseType() {
    // Application types
    const applicationTypeChoices = ['Vue 3 (JavaScript)', 'Vue 3 (TypeScript)']

    const answers = await this.prompt([
      {
        type: 'list',
        name: 'applicationType',
        message: `Which ${chalk.cyan('type')} of framework would you like to create?`,
        choices: applicationTypeChoices,
        default: applicationTypeChoices[0]
      }
    ])

    this.applicationType = answers.applicationType
  }

  runGenerator() {
    const generator = `diamond:${APPLICATION_CONVERTOR[this.applicationType]}`

    this.composeWith(generator, true)
  }
}
