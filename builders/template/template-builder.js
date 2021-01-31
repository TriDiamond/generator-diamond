const j = require('jscodeshift')
const fs = require('fs')

module.exports = class TemplateBuilder {
  constructor() {}

  toAst(source) {
    return j(source)
  }

  checkFileExist(file) {
    try {
      if (fs.existsSync(file)) {
        return true
      }
      return false
    } catch (err) {
      throw new Error(err)
    }
  }
}
