const TemplateBuilder = require('./template-builder')
const j = require('jscodeshift')
const fs = require('fs')
const chalk = require('chalk')

const DEFAULT_TEMPLATE = `import request from '@/utils/request'`
const API_RELATIVE_PATH = 'src/api'

module.exports = class ApiTemplate extends TemplateBuilder {
  constructor(path, name, language) {
    super()
    this.needRewrite = false
    this.language = language ? language : 'js'
    this.apiFile = `${path}/${API_RELATIVE_PATH}/${name}.${this.language}`
    this.apiName = name

    // Read from existing source
    if (super.checkFileExist(this.apiFile)) {
      const data = fs.readFileSync(this.apiFile, {
        encoding: 'utf8',
        flag: 'r'
      })
      this.source = data
      // Convert template into AST
      this.ast = super.toAst(this.source)
    } else {
      this.template = 'default'
    }
  }

  set template(source) {
    source = source === 'default' ? DEFAULT_TEMPLATE : source
    this.source = source
    // Convert template into AST
    this.ast = super.toAst(this.source)
  }

  get template() {
    return this.source
  }

  _getApiFunctions() {
    this.ast = super.toAst(this.source)
    return this.ast.find(j.ExportNamedDeclaration)
  }

  _getImports() {
    return this.ast.find(j.ImportDeclaration)
  }

  _generateNewFunction(template) {
    const apiFunctions = this._getApiFunctions()

    if (apiFunctions.size() === 0) {
      const imports = this._getImports()
      super.toAst(imports.at(imports.size() - 1).get()).insertAfter(template)
    } else {
      super.toAst(apiFunctions.at(apiFunctions.size() - 1).get()).insertAfter(template)
    }

    this.source = this.ast.toSource()
    this.needRewrite = true
  }

  addFunction(type, name, path) {
    let template = ''
    let dataType = this.language === 'ts' ? ': object' : ''
    path = '/path/to/api'
    type = type.toUpperCase()

    switch (type) {
      case 'POST':
        template = `export function ${name}(data${dataType}) {
  return request({
    url: '${path}',
    method: 'post',
    data
  })
}`
        break

      case 'GET':
        template = `export function ${name}() {
  return request({
    url: '${path}',
    method: 'get'
  })
}`
        break

      case 'PUT':
        template = `export function ${name}() {
  return request({
    url: '${path}',
    method: 'put'
  })
}`
        break

      case 'DELETE':
        template = `export function ${name}() {
  return request({
    url: '${path}',
    method: 'delete'
  })
}`
        break

      default:
        throw new Error(`Invalid API type: [${type}]`)
    }

    this._generateNewFunction(template)

    return this
  }

  write() {
    if (this.needRewrite) {
      // Writing source into file
      fs.writeFileSync(this.apiFile, this.ast.toSource(), { encoding: 'utf8', flag: 'w' })
    }
  }
}
