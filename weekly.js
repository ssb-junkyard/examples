var fs = require('fs')
var ssbc = require('ssb-client')
var pull = require('pull-stream')
var paramap = require('pull-paramap')
var Window = require('pull-window')


var NOW = Date.now()
var DAY = 1000*60*60*24
var WEEK = DAY*7

function zero (sample) {
  return {sample: sample, users: {}, interactions: 0}
}

//generate a nice graph from this using
// npm install line-graph
// node weekly.js | line-graph --width 600 --height 400 --title 'users per week' > users-per-week.png

ssbc(function (err, sbot) {
  var current = 0, _cb, sample = 0
  var acc = zero()

  console.log('Sample, Users, Interactions')

  var range = WEEK

  pull(
    sbot.createLogStream({meta: true}),

    Window(function (data, cb) {
      if(!data.timestamp) throw new Error('weird')
      var before = data.timestamp
      if(before > current + range) {
        _cb && _cb(null, acc)
        while(before > current + range) current += range
        _cb = cb
        acc = zero(sample)
        sample ++
        return function (end, data) {
          if(end) return _cb && _cb(null, acc)
          acc.interactions ++
          acc.users[data.value.author] = true
        }
      }
    }, function (_, acc) {
      acc.users = Object.keys(acc.users).length
      return acc
    }),

    pull.drain(function (data) {
      console.log([data.sample, data.users].join(', '))
    }, function () {
      sbot.close(true)
    })
  )


})
