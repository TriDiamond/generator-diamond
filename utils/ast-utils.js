const j = require('jscodeshift')
// const addImports = require('jscodeshift-add-imports')

module.exports = {
  addAfterImportFor,
  addSvgLoader,
  addGlobalComponent
}

/**
 * Adding code into chainWebpack
 * @param {String} source
 * @param {String} input
 * @param {Number} position
 * @returns {String}
 */
function _addChainWebpack(source, input, position = 0) {
  const root = j(source)
  const chainWebpack = root.find(j.Identifier, { name: 'chainWebpack' })
  const target = chainWebpack.get().parentPath.__childCache.value.value.body.body[position]
  root
    .find(j.ExpressionStatement, {
      start: target.start,
      end: target.end
    })
    .insertAfter(input)
  return root.toSource()
}

/**
 * Adding an import at the last import declaration
 * @param {String} source
 * @param {String} input
 * @returns {String}
 */
function addAfterImportFor(source, input) {
  const root = j(source)
  const imports = root.find(j.ImportDeclaration)
  const n = imports.length

  if (n) {
    j(imports.at(n - 1).get()).insertAfter(input) // after the imports
  } else {
    root.get().node.program.body.unshift(input) // beginning of file
  }

  return root.toSource()
}

/**
 * Adding svg loader in chainWebpack()
 * @param {String} source
 * @returns {String}
 */
function addSvgLoader(source) {
  return _addChainWebpack(
    source,
    `// set svg-sprite-loader
config.module.rule("svg").exclude.add(resolve("src/icons")).end();
config.module
  .rule("icons")
  .test(/\\.svg$/)
  .include.add(resolve("src/icons"))
  .end()
  .use("svg-sprite-loader")
  .loader("svg-sprite-loader")
  .options({
    symbolId: "icon-[name]",
  })
  .end();`,
    1
  )
}

/**
 * Adding global component
 * @param {String} source
 * @returns {String}
 */
function addGlobalComponent(source, component) {
  let root = j(source)
  const node = root.find(j.VariableDeclaration)
  j(node.get()).insertAfter(`${component}(app)`)

  return root.toSource()
}
