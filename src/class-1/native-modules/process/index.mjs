console.log(process.argv)

// process.exit(1)

process.on('exit', () => {
  // Clean resources
})

console.log(process.cwd())

// Platform
console.log(process.env.NODE_ENV)
