var pull = require('pull-stream')
var crypto = require('crypto')
var ssbc = require('ssb-client')

function hash1 (data) {
  return crypto.createHash('sha256')
    .update(data, 'binary')
    .digest('base64')+'.sha256'
}

function hash2 (data) {
  return crypto.createHash('sha256')
    .update(new Buffer(data, 'utf8'))
    .digest('base64') + '.sha256'
}

var ssbHash = require('ssb-keys').hash

ssbc(function (err, sbot) {
  var authors = {}
  var good = 0, bad = 0
  var to_delete = []
  pull(
    sbot.createLogStream(),
    pull.drain(function (msg) {
      var data = JSON.stringify(msg.value, null, 2)
      if(ssbHash(data) !== hash2(data)) {
        if('%'+hash1(data) !== msg.key) {
          authors[msg.value.author] = msg.value.sequence
          to_delete.push(msg.key)
        }
        bad ++
      }
      else
        good ++
    }, function (err) {
      console.log(JSON.stringify(authors, null, 2))
      console.error('delete')
      console.log(JSON.stringify(to_delete, null, 2))
      console.error(good, bad)
      sbot.close()
    })
  )
})



