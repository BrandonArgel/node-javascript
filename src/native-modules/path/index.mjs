import path from 'node:path'

// Separator bar depending Operative System
console.log(path.sep)

// Join routes
const filePath = path.join('content', 'subfolder', 'test.txt')
console.log(filePath)

const base = path.basename('/tmp/brand-secret-files/password.txt')
console.log(base)

const filename = path.basename('/tmp/brand-secret-files/password.txt', '.txt')
console.log(filename)

const extension = path.extname('my.super.image.jpg')
console.log(extension)
