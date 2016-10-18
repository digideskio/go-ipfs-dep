'use strict'

const goenv = require('go-platform')
const request = require('request')
const gunzip = require('gunzip-maybe')
const path = require('path')
const tarFS = require('tar-fs')
const unzip = require('unzip')

const pkg = require('./../package.json')
const version = pkg.goIpfsVersion || 'v' + version.replace(/-[0-9]+/, '')
const checkPlatform = require('./checkPlatform')

module.exports = function (targetOS, callback) {
  if (typeof targetOS === 'function') {
    callback = targetOS
    targetOS = undefined
  }

  const TARGET_OS = targetOS || goenv.GOARCH
  callback = callback || noop

  // make sure we can do this.
  if (!checkPlatform.isSupportedArchitecture(TARGET_OS)) {
    return callback(new Error('no binary available for arch: ' + TARGET_OS))
  }

  const isWindows = checkPlatform.isWindows(goenv.GOOS)

  const fileExtension = isWindows ? '.zip' : '.tar.gz'
  const fileName = 'ipfs_' + version + '_' + goenv.GOOS + '-' + goenv.GOARCH + fileExtension
  const url = 'http://dist.ipfs.io/go-ipfs/' + version + '/go-' + fileName
  const installPath = path.resolve(__dirname, '..')
  const fileStream = request.get(url)

  console.log('downloading %s to %s', url, installPath)

  if (isWindows) {
    fileStream
      .pipe(unzip.Extract({ path: installPath }))
      .once('error', callback)
      .once('close', callback)
  } else {
    fileStream
      .pipe(gunzip())
      .pipe(tarFS.extract(installPath))
      .once('error', callback)
      .once('finish', callback)
  }
}

function noop () {}
