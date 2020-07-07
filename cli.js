#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yargs = require('yargs')

const imagemin = require('imagemin')
// const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant');

const resolve = (filepath) => {
	return path.resolve(process.cwd(), filepath)
}

const options = require('yargs')
	.command('-i=[filepath] -o=[dirpath]', '压缩图片')
	.option('input', {
    alias: 'i',
    type: 'string',
    description: '压缩图片路径，支持 glob patterns, 如 images/*.{png}'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    // default: '${name}-optimized',
    description: '输出文件路径，如 build/images, 默认输出到同级目录 ${name}-optimized 文件夹中'
  })
	.argv;

function Minimage(originPath, originSize, optimizedSize) {
	this.filename = originPath.match(/[^/]*.(jpg|png)/)[0]
  this.originSize = originSize
  this.optimizedSize = optimizedSize
  this.sourceSavedSize = originSize - optimizedSize
  this.savedSize = (this.sourceSavedSize / 1024).toFixed(2) + 'KB'
  this.percent = (this.sourceSavedSize / originSize * 100).toFixed(2) + '%'
}

function profile (title, table) {
	console.log('>>', title)
	console.table(profileTable)
	console.log('\n')
}

const profileTable = []

;(() => {
	const destination = options.output ? resolve(options.output) : resolve(options.input + '-optimized')

  imagemin([resolve(options.input + '/*.png')], {
    destination,
    plugins: [
      // imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8]
      })
    ]
  })
  .then(files => {
  	files.forEach((x, index) => {
	  	const optimizedSize = fs.statSync(x.sourcePath).size
	  	const data = new Minimage(x.sourcePath, optimizedSize, x.data.length)
	  	profileTable.push(data)
		  // console.log('Images optimized. Destination files: ', x.destinationPath)
	  	return x.destinationPath
	  })
		profile(options.input, profileTable)
  })
  .catch(console.error)

})()
