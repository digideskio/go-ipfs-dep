/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')

const download = require('../src')
const targetDir = path.resolve(__dirname, '../go-ipfs')

function cleanup (done) {
  try {
    fs.statSync(targetDir)
  } catch (err) {
    return done()
  }

  rimraf(targetDir, done)
}

describe('go-ipfs-dep', () => {
  beforeEach(cleanup)
  afterEach(cleanup)

  it('downloads ipfs', (done) => {
    download((err) => {
      expect(err).to.not.exist

      fs.stat(targetDir, (err, stats) => {
        expect(err).to.not.exist
        expect(stats).to.exist
        done()
      })
    })
  })
})
