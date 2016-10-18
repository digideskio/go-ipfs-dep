#!/usr/bin/env node
'use strict'

// first param is the target OS
require('./')(process.argv[2], function (err) {
  if (err) {
    throw err
  }

  console.log('finished downloading')
})
