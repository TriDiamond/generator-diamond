const TemplateBuilder = require('./template-builder')
const j = require('jscodeshift')
const fs = require('fs')
const STORE_FILE = 'src/store/index'

const DEFAULT_TEMPLATE_JS = `const state = {}

const mutations = {}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

`

let DEFAULT_TEMPLATE_TS = `import { defineStore } from 'pinia'

const state = () => ({})

const getters = {}

const actions = {}

export const use%_NAME_%Store = defineStore({
  id: '%_ID_%',
  state,
  getters,
  actions
})

`

let MODULE_RELATIVE_PATH = 'src/store/modules'

module.exports = class StoreModuleTemplate extends TemplateBuilder {
  constructor(path, name, language, options) {
    super()
    this.moduleName = name.toLowerCase()
    this.language = language ? language : 'js'
    this.destinationPath = path

    // Fill in TS template
    if (this.language === 'ts') {
      DEFAULT_TEMPLATE_TS = DEFAULT_TEMPLATE_TS.replace(
        '%_NAME_%',
        this.moduleName.charAt(0).toUpperCase() + this.moduleName.slice(1)
      )
      DEFAULT_TEMPLATE_TS = DEFAULT_TEMPLATE_TS.replace('%_ID_%', this.moduleName)
      MODULE_RELATIVE_PATH = 'src/stores'
    }

    this.moduleFile = `${this.destinationPath}/${MODULE_RELATIVE_PATH}/${this.moduleName}.${this.language}`
    this.isNewModule = false
    this.requireMutation = options.mutation ? options.mutation : null

    // Read from existing source
    if (super.checkFileExist(this.moduleFile)) {
      this.source = fs.readFileSync(this.moduleFile, {
        encoding: 'utf8',
        flag: 'r'
      })
      // Convert template into AST
      this.ast = super.toAst(this.source)
    } else {
      this.isNewModule = true
      this.template = 'default'
    }
  }

  set template(source) {
    const defaultTemplate = this.language === 'js' ? DEFAULT_TEMPLATE_JS : DEFAULT_TEMPLATE_TS
    this.source = source === 'default' ? defaultTemplate : source
    // // Convert template into AST
    this.ast = super.toAst(this.source)
  }

  get template() {
    return this.source
  }

  _getModuleProperty(index) {
    const source = this.ast
      .find(j.VariableDeclaration, { kind: 'const' })
      .at(index)
      .get().value.declarations[0].init

    if (source.properties.length > 0) return source.properties
    else return source
  }

  _getStateContent() {
    return this._getModuleProperty(0)
  }

  _getMutationContent() {
    return this._getModuleProperty(1)
  }

  _getActionContent() {
    return this._getModuleProperty(2)
  }

  _addObjectProperty(source, input) {
    const n = source.length

    if (n) {
      const last = source[n - 1]
      const lastNode = this.ast.find(j.Property, {
        type: last.type,
        start: last.start,
        end: last.end
      })
      j(lastNode.get()).insertAfter(input)
    } else {
      const objectExp = this.ast.find(j.ObjectExpression, {
        type: source.type,
        start: source.start,
        end: source.end
      })
      j(objectExp.get()).replaceWith(`{ ${input} }`)
    }

    return this.ast.toSource()
  }

  _getImports(source) {
    const ast = j(source)
  }

  addState(input) {
    this._addObjectProperty(this._getStateContent(), input)
    return this
  }

  addMutation(input) {
    this._addObjectProperty(this._getMutationContent(), input)
    return this
  }

  addAction(name) {
    let mutation = ''
    const mutationName = name.replace(/[A-Z]/g, letter => `_${letter.toUpperCase()}`).toUpperCase()
    if (this.requireMutation) {
      mutation = `\rcommit('${mutationName}', data)\r`
    }

    this._addObjectProperty(this._getActionContent(), `\r${name}({ commit }, data) {${mutation}}\r`)
    return this
  }

  injectNewModule(type) {
    const storeFile = `${this.destinationPath}/${STORE_FILE}.${this.language}`
    const data = fs.readFileSync(storeFile, {
      encoding: 'utf8',
      flag: 'r'
    })

    const root = j(data)
    const buildProperty = name => {
      const property = j.property('init', j.identifier(name), j.identifier(name))
      property.shorthand = true
      return property
    }

    const buildModule = properties => {
      return j.property('init', j.identifier('modules'), j.objectExpression(properties))
    }

    const modulesProperties = []

    root
      .find(j.Property)
      .filter(property => {
        return property.value.key.name === 'modules'
      })
      .replaceWith(property => {
        for (module of property.value.value.properties) {
          modulesProperties.push(module.value.name)
        }
        modulesProperties.push(type)

        const newProperties = []
        for (property of modulesProperties) {
          newProperties.push(buildProperty(property))
        }
        return buildModule(newProperties)
      })

    const imports = root.find(j.ImportDeclaration)
    j(imports.at(imports.size() - 1).get()).insertBefore(
      `import ${this.moduleName} from './modules/${this.moduleName}'`
    )

    fs.writeFileSync(storeFile, root.toSource(), { encoding: 'utf8', flag: 'w' })
  }

  write() {
    if (this.language === 'js' && this.isNewModule) {
      this.injectNewModule(this.moduleName)
    }
    fs.writeFileSync(this.moduleFile, this.ast.toSource(), { encoding: 'utf8', flag: 'w' })
  }
}
