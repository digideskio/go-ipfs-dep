'use strict'

var checkPlatform = require('./checkPlatform')
var goenv = require('go-platform')
var pkg = require('./../package.json')
var version = pkg.goIpfsVersion || pkg.version
var request = require('request')
var gunzip = require('gunzip-maybe')
var path = require('path')
var tarFS = require('tar-fs')
var unzip = require('unzip')

module.exports = function (callback, targetOS) {
  callback = callback || noop
  const TARGET_OS = targetOS || goenv.GOOS

  // make sure we can do this.
  if (!checkPlatform.isSupportedArchitecture(goenv.GOARCH)) {
    throw new Error('no binary available for arch: ' + goenv.GOARCH)
  }

  const isWindows = checkPlatform.isWindows(TARGET_OS)

  // hacky hack hack to work around unpublishability
  version = version.replace(/-[0-9]+/, '')

  const fileExtension = isWindows ? '.zip' : '.tar.gz'
  const fileName = 'ipfs_v' + version + '_' + goenv.GOOS + '-' + goenv.GOARCH + fileExtension
  const url = 'http://dist.ipfs.io/go-ipfs/v' + version + '/go-' + fileName
  const installPath = path.resolve(__dirname, '..')
  const fileStream = request.get(url)

  if (isWindows) {
    fileStream.pipe(
      unzip.Extract({ path: installPath })
      .on('close', callback))
  } else {
    fileStream.pipe(gunzip())
    .pipe(
      tarFS
        .extract(installPath)
        .on('finish', callback)
    )
  }
}

function noop () {}
