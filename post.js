
var ssbc = require('ssb-client')

ssbc(function (err, sbot) {
  //
  sbot.publish({type: 'post', text: "Hello, World."}, function (err, msg) {
    if(err) throw err
    console.log(msg)
  })
})

