var pull = require('pull-stream')
var crypto = require('crypto')

//get these hashes for @wanderer, which where broken.

var bad = {
  "@hGd3sjghbrkVaFEMUrXV11m2oyKLfLqJQcadvapH02w=.ed25519": 45,
  "@lzMHSo63Do77Fg4qdDrcIk6yJ+HWQs6YH+fD217S6+s=.ed25519": 463,
  "@6ilZq3kN0F+dXFHAPjAwMm87JEb/VdB+LC9eIMW3sa0=.ed25519": 290,
  "@uikkwUQU4dcd/ZrHU7JstnkTgncxQB2A8PDLHV9wDAs=.ed25519": 649,
  "@hxGxqPrplLjRG2vtjQL87abX4QKqeLgCwQpS730nNwE=.ed25519": 3332,
  "@f/6sQ6d2CMxRUhLpspgGIulDxDCwYD7DzFzPNr7u5AU=.ed25519": 730,
  "@p13zSAiOpguI9nsawkGijsnMfWmFd5rlUNpzekEE+vI=.ed25519": 1235,
  "@iL6NzQoOLFP18pCpprkbY80DMtiG4JFFtVSVUaoGsOQ=.ed25519": 864
}


function hash2 (data) {
  return crypto.createHash('sha256')
    .update(new Buffer(data, 'utf8'))
    .digest('base64') + '.sha256'
}

require('ssb-client')(function (err, sbot) {
  if(err) throw err
  var feeds = Object.keys(bad)

  pull(
    pull.values(feeds),
    pull.asyncMap(function (feed, cb) {
      pull(
        sbot.createHistoryStream({id: feed, sequence: bad[feed], limit: 1}),
        pull.find(null, cb)
      )
    }),
    pull.map(function (e) {
      return '%'+hash2(JSON.stringify(e.value, null, 2))
    }),
    pull.drain(console.log, sbot.close)
  )

})
