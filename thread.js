
var pull = require('pull-stream')
var cat = require('pull-cat')
var paramap = require('pull-paramap')
var msgId = process.argv[2]
if(!msgId) {
  console.error('usage: node thread.js {message_id}')
  process.exit(1)
}

//this was an experiment to find the fastest way to load a thread.

require('ssb-client') (function (err, sbot) {
  if(err) throw err

  console.log('okay')
  sbot.get(msgId, function (err, value) {
    if(err) throw err
    console.log(value)
    var root = value.content.root || msgId

    pull(
      cat([pull.once({key: root}), sbot.links({dest: root})]),
      pull.unique('key'),
      paramap(function (data, cb) {
        if(data.key === msgId)
          data.target = true
        sbot.get(data.key, function (err, value) {
          data.value = value
          cb(null, data)
        })
      }),
      pull.sort
      pull.drain(console.log, function () {
        sbot.close(true)
      })
    )
  })

})

