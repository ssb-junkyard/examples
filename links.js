

var ssbc = require('ssb-client')
var pull = require('pull-stream')
var through = require('pull-through')

var marked = require('ssb-marked')
function noop(){}
var onLink = noop
var extractor = new marked.Renderer()

extractor.link = function (href, _, text) {
  onLink({label: text, target: href, embed: false})
}

extractor.image = function (href, _, text) {
  onLink({label: text, target: href, embed: true})
}

function links (s, _onLink) {
  if('string' !== typeof s) return
  onLink = _onLink
  try {
    marked(s, {renderer: extractor})
  } catch(err) {
    console.log(JSON.stringify(s))
    throw err
  }
  onLink = noop
}

ssbc(function (err, sbot) {
  pull(
    sbot.createLogStream({keys: false}),
    pull.filter(function (data) {
      if(data.sync) return
      return data.content.type === 'post'
    }),
    through(function (data) {
      return links(data.content.text, this.queue)
    }),
    pull.log()
  )
})



