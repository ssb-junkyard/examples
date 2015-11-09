var fs = require('fs')
var ssbc = require('ssb-client')
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')

ssbc(function(err, sbot){
  if(err) console.log(err)

  sbot.whoami(function(er, me){
  
    console.log(er, me)
    
    pull(
      toPull.source(fs.createReadStream(__filename)),
      pull.map(function(e){console.log(e.toString());return e.toString()}),
      sbot.blobs.add(function(err, hash){
        console.log(err, hash)
      })
    )
    //pull(sbot.createHistoryStream(me), pull.drain(function(msg){
    //  console.log(msg)
    //}))
    
  })
})
