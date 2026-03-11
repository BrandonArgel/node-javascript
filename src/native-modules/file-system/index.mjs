import fs from 'node:fs'

fs.readFile('./file.txt', 'utf-8', (err, data) => {
  if (err) throw err
  console.log(data)
})

// Sync
// const stats = fs.statSync("./file.txt");

// console.log(
//   stats.isFile(),
//   stats.isDirectory(),
//   stats.isSymbolicLink(),
//   stats.isBlockDevice(),
//   stats.isCharacterDevice(),
//   stats.isFIFO(),
//   stats.isSocket(),
//   stats.size,
//   stats.birthtime,
//   stats.mtime,
//   stats.ctime,
//   stats.atime,
//   stats.dev,
//   stats.ino,
//   stats.mode,
//   stats.nlink,
//   stats.uid,
//   stats.gid,
// );

// List
const folder = process.argv[2] ?? '.'

fs.readdir(folder, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err)
    return
  }
  files.forEach((file) => {
    console.log(file)
  })
})
