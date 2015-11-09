var fs = require('fs')
var ssbc = require('ssb-client')
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')
var createHash = require('crypto').createHash
var schemas = require('ssb-msg-schemas')


function hash () {
  var hasher, hash = createHash('sha256')
  return h = pull.through(function (data) {
    hash.update(data)
  }, function () {
    h.digest = '&' + hash.digest('base64')+'.sha256'
  })
}

function postFile(name, cb) {

  var hasher = hash()

  pull(
    //upload a file. 
    toPull.source(fs.createReadStream(__filename)),
    hasher,
    pull.drain(null, function (err) {
      if(err) throw err
      console.log(
        schemas.post('published a file: ('+name+')['+hasher.digest+']')
      )
    })
//    sbot.blobs.add(function(err) {
//      if(err) throw err
//
//      
//
//      return
//      sbot.publish({
//        type: 'post',
//        text: 'published a file: ('+name+')['+hasher.digest+']',
//        mentions: 
//
//      })
//    })
  )

}



ssbc(function(err, sbot){
  if(err) console.log(err)
  postFile('./sbot.js', function (err) {
    if(err) throw err
  })
})
