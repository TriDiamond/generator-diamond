'use strict'
const GeneratorBase = require('../generator-base')
const chalk = require('chalk')
const ApiBuilder = require('../../builders/template/api-builder')

module.exports = class addApi extends GeneratorBase {
  constructor(args, opts) {
    super(args, opts)
    // params:
    // [apiName]:[action]
    // action: init | add
    this.argument('params', { type: Array, required: true })
    this.projectType = super._getConfig('project-type')
  }

  initializing() {
    const apiInfo = this.options.params[0] ? this.options.params[0].split(':') : [null, null]
    this.apiName = apiInfo[0] ? apiInfo[0] : 'ExampleApi'
    this.generationAction = apiInfo[1] ? apiInfo[1] : 'init'

    const functionInfo = this.options.params[1] ? this.options.params[1].split(':') : [null, null]
    this.methodName = functionInfo[0] ? functionInfo[0] : 'getApi'
    this.methodType = functionInfo[1] ? functionInfo[1] : 'get'

    this.apiBuilder = new ApiBuilder(this.destinationPath(), this.apiName, this.projectType)
  }

  _addingFunction() {
    this.apiBuilder.addFunction(this.methodType, this.methodName, this.projectType)
  }

  _generateDefaultTemplate() {
    this.apiBuilder
      .addFunction('GET', `get${this.apiName}`, this.projectType)
      .addFunction('POST', `create${this.apiName}`, this.projectType)
      .addFunction('PUT', `save${this.apiName}`, this.projectType)
      .addFunction('DELETE', `delete${this.apiName}`, this.projectType)
  }

  writing() {
    // Adding function
    if (this.generationAction === 'add') {
      this._addingFunction()
    } else if (this.generationAction === 'default') {
      this._generateDefaultTemplate()
    }

    this.apiBuilder.write()
    this.log(`${chalk.green('✔ Generation completed\n')}`)
  }
}
