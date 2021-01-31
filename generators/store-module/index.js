'use strict'
const GeneratorBase = require('../generator-base')
const chalk = require('chalk')
const StoreModuleBuilder = require('../../builders/template/store-module-builder')

module.exports = class addStoreModule extends GeneratorBase {
  constructor(args, opts) {
    super(args, opts)
    // params:
    // First param => [moduleName]:[action]
    // action:
    //    action : adding action
    //    mutation: adding mutation
    // Second param => action or mutation name
    // Example => order:action getOrder
    this.argument('params', { type: Array, required: true })
    this.option('mutation')
    this.projectType = super._getConfig('project-type')
  }

  initializing() {
    let moduleInfo = this.options.params[0] ? this.options.params[0].split(':') : [null, null]
    this.storeName = moduleInfo[0] ? moduleInfo[0] : 'ExampleModule'
    this.generationAction = moduleInfo[1] ? moduleInfo[1] : 'init'
    this.actionName = this.options.params[1] ? this.options.params[1] : 'example'
    this.storeModuleBuilder = new StoreModuleBuilder(
      this.destinationPath(),
      this.storeName,
      this.projectType,
      {
        mutation: this.options.mutation ? true : false
      }
    )
  }

  writing() {
    if (this.generationAction === 'action') {
      this.storeModuleBuilder.addAction(this.actionName)
    }
    this.storeModuleBuilder.write()
  }
}
