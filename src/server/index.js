const fs = require('fs')
const path = require('path')

const CSSPATH = path.join(__dirname, '../../build/lantern.css')
const JSPATH = path.join(__dirname, '../../build/lantern.js')

const cssStr = fs.readFileSync(CSSPATH, 'utf8')
const jsStr = fs.readFileSync(JSPATH, 'utf8')

function lanternMiddleware (getRegistry, opts) {
  return (req, res, next) => {
    const registry = getRegistry(req, res, next)
    const metadata = JSON.stringify(registry.getMetadata())

    res.status(200).send(`<!DOCTYPE html>
      <head>
        <title>${opts.title || 'Diogenes lantern'}</title>
        <meta charset="utf-8">
        <style>${cssStr}</style>
      </head>
      <body>
        <div>
          <div class="lantern-header">${opts.title || 'Diogenes lantern'}</div>
          <div class="lantern-graph" id="lantern-graph"></div>
          <div class="lantern-help" id="lantern-help"></div>
        </div>
        <script>${jsStr}</script>
        <script>
          var lantern = getLantern()
          lantern.render(${metadata})
        </script>
      </body>`)
  }
}

module.exports = lanternMiddleware
