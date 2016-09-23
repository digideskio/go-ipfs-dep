var path = require('path')
var goenv = require('go-platform')
var pkg  = require('./../package.json')
var version = pkg.goIpfsVersion || pkg.version
var distHost = require('./../package.json').distHost || 'https://ipfs.io/'
var request = require('request')
var gunzip = require('gunzip-maybe')
var tarFS = require('tar-fs')

module.exports = function (targetOS, callback) {
  checkPlatform(goenv) // make sure we can do this.

  // use the specified OS or use the one we're on atm
  const TARGET_OS = targetOS || goenv.GOOS

  // hacky hack hack to work around unpublishability
  // version = version.replace(/-[0-9]+/, '')

  var filename = 'ipfs_' + version + '_' + TARGET_OS + '-' + goenv.GOARCH + '.tar.gz'
  var url = distHost + '/go-ipfs/' + version + '/go-' + filename

  var installPath = path.resolve(__dirname, '..')

  request
    .get(url)
    .pipe(gunzip())
    .pipe(
        tarFS
          .extract(installPath)
          .on('finish', callback)
        )

  function checkPlatform (goenv) {
    switch (goenv.GOOS) {
      case 'darwin':
      case 'linux':
      case 'freebsd':
        break
      default:
        throw new Error('no binary available for os:' + goenv.GOOS)
    }

    switch (goenv.GOARCH) {
      case 'amd64':
      case '386':
      case 'arm':
        break

      default:
        throw new Error('no binary available for arch: ' + goenv.GOARCH)
    }
  }
}
