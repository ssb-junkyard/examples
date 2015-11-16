
var fs = require('fs')
var ssbc = require('ssb-client')
var pull = require('pull-stream')
var paramap = require('pull-paramap')
var related = false
//scan 

function asyncTimer (name) {
  var total = 0, count = 0
  return function (fn) {
    return function () {
      var start = Date.now()
      var args = [].slice.call(arguments)
      var cb = args.pop()
      args.push(function (err, value) {
        
      })
      fn.apply(this, args)
    }
  }
}

var Stats = require('statistics')

var y = Stats()
var n = Stats()

ssbc(function (err, sbot) {
  if(err) throw err
  var start = Date.now()
  var c = 0
  pull(
    sbot.createUserStream({
      reverse: true,
      id: process.argv[2]}),
    pull.filter(function (data) {
      c++
      return (
        data.value.content.type === 'post'
      && !data.value.content.root
      )
    }),
    pull.take(30),
    ( related
    ? paramap(function (data, cb) {
        sbot.relatedMessages({id: data.key, count: true}, cb)
      }, 16)
    :
//      pull(
//        paramap(function (data, cb) {
//          var start = Date.now()
//          pull(
//            sbot.links({dest: data.key, rel: 'root'}),
//            pull.collect(function (err, links) {
//              (links.length ? y : n).value(Date.now() - start)
//              data.replies = links
//              cb(null, data)
//            })
//          )
//        }, 16),
//        paramap(function (data, cb) {
//          var start = Date.now()
//          pull(
//            sbot.links({dest: data.key, rel: 'vote'}),
//            pull.collect(function (err, links) {
//              (links.length ? y : n).value(Date.now() - start)
//              data.votes = links
//              cb(null, data)
//            })
//          )
//        }, 16)
        paramap(function (data, cb) {
          var start = Date.now()
          pull(
            sbot.links({dest: data.key, rel: 'vote'}),
            pull.collect(function (err, links) {
              (links.length ? y : n).value(Date.now() - start)
              data.votes = links.filter(function (e) {
                return e.rel = 'vote'
              })
              data.replies = links.filter(function (e) {
                return e.rel = 'root'
              })
              cb(null, data)
            })
          )
        }, 16)
//      )
    ),
    pull.collect(function (err, ary) {
      if(err) throw err
      console.log('output'),
      console.log(JSON.stringify(ary, null, 2))
      console.log('found, scanned, elapsed (ms)')
      console.log([ary.length, c, Date.now() - start].join(', '))
      console.log(y.toJSON(), n.toJSON())
      sbot.close(true)
    })
  )
})
