var fs = require('fs')
var ssbc = require('ssb-client')
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')
var crypto = require('crypto')

ssbc(function(err, sbot){
  if(err) console.log(err)

  sbot.whoami(function(er, me){
  
    var hasher = createHash()

    pull(
      toPull.source(fs.createReadStream(__dirname + '/post_msg_w_blob.js')),
      hasher,
      sbot.blobs.add(function(err){
        console.log(err, hasher.digest)
        var text = 'I published to a decentralized, secure social network with [this code](' + hasher.digest + ')!'
        sbot.publish({type: 'post', text: text, mentions: {
          link: hasher.digest,
          name: 'index.js'
        }}, function(err){
          if(err) console.log(err)
        })
      })
    )
  })
})

function createHash(){

  var hash = crypto.createHash('sha256'), hasher

  return hasher = pull.through(function(data){
    hash.update(data)
  }, function(){
    hasher.digest = '&' + hash.digest('base64') + '.sha256'
  })

}
