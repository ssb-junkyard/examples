
var fs = require('fs')
var ssbc = require('ssb-client')
var pull = require('pull-stream')
var paramap = require('pull-paramap')
var related = true
//scan 

ssbc(function (err, sbot) {
  if(err) throw err
  var start = Date.now()
  var c = 0
  pull(
    sbot.createUserStream({reverse: true, id: process.argv[2]}),
    pull.filter(function (data) {
      c++
      return (
        data.value.content.type === 'post'
      && !data.value.content.root
      )
    }),
    pull.take(30),
    ( related
    ? pull.asyncMap(function (data, cb) {
        sbot.relatedMessages({id: data.key, count: true}, cb)
      }, 16)
    : pull(
        paramap(function (data, cb) {
          pull(
            sbot.links({dest: data.key, rel: 'root'}),
            pull.collect(function (err, links) {
              data.replies = links
              cb(null, data)
            })
          )
        }, 16),
        paramap(function (data, cb) {
          pull(
            sbot.links({dest: data.key, rel: 'vote'}),
            pull.collect(function (err, links) {
              data.votes = links
              cb(null, data)
            })
          )
        }, 16)
      )
    ),
    pull.collect(function (err, ary) {
      if(err) throw err
      console.log('output'),
      console.log(ary)
      console.log('found, scanned, elapsed (ms)')
      console.log([ary.length, c, Date.now() - start].join(', '))
      sbot.close(true)
    })
  )
})
