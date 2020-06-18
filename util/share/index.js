import path from 'path'
import { readFile, readFileSync, writeFile, writeFileSync } from 'fs'

export const DEFAULT_SEP = '/'

/**
 * @param {string} input
 * @param {string=} [sep=DEFAULT_SEP]
 * @return {string}
 */
export function normalize(input, sep = DEFAULT_SEP) {
  const _input = path.normalize(input)
  return _input.split(path.sep).join(sep)
}

/**
 * given localPath, return string to form matching RegExp
 * @param {string} localPath
 * @returns {string}
 */
function generateLocalPathStr(localPath) {
  const pathArr = localPath.split(DEFAULT_SEP)
  const len = pathArr.length
  return pathArr
    .map((part, index) => {
      part = escapeDot(part)
      if (index === len - 1) {
        return `${part}`
      } else {
        return `\\.*(${part})?`
      }
    })
    .join(`\\${DEFAULT_SEP}?`)
}

/**
 * @param {string} input
 */
function escapeDot(input) {
  if (input.includes('.')) {
    return input.replace(/\./g, '\\.')
  }
  return input
}

/**
 * produce RegExp to match local path
 * @param {string} localPath
 * @return {RegExp}
 */
export function generateLocalPathReg(localPath) {
  const content = generateLocalPathStr(localPath)
  const prefix = `([(=+,\\n\\t]\\s*['"]?)`
  // using prefix to strictly match resource reference
  // like src="", url(""), a = "", srcset="xxx.jpg 100w, xxx@2.jpg 200w"
  return new RegExp(`${prefix}${content}`, 'g')
}

// read file
export const read = (location) => readFileSync(location, 'utf-8')
// write file
export const write = (location) => (content) => writeFileSync(location, content)
export const readAsync = (location) =>
  new Promise((resolve, reject) => {
    readFile(location, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
export const writeAsync = (location) => async (content) =>
  new Promise((resolve, reject) => {
    writeFile(location, content, (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
