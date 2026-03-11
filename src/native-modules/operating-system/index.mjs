// https://nodejs.org/docs/v24.14.0/api/os.html
import {
  platform,
  arch,
  version,
  homedir,
  hostname,
  uptime,
  loadavg,
  totalmem,
  freemem,
  cpus,
  networkInterfaces,
  tmpdir,
  userInfo
} from 'node:os'

console.log('System Information:')
console.log('Platform:', platform())
console.log('Architecture:', arch())
console.log('Version:', version())
console.log('Home Directory:', homedir())
console.log('Hostname:', hostname())
console.log('Uptime:', uptime())
console.log('Load Average:', loadavg())
console.log('Total Memory:', totalmem() / 1024 / 1024 / 1024, 'GB')
console.log('Free Memory:', freemem() / 1024 / 1024 / 1024, 'GB')
console.log('CPUs:', cpus().length)
console.log('Network Interfaces:', Object.keys(networkInterfaces()).join(', '))
console.log('Temporary Directory:', tmpdir())
console.log('User Info:', userInfo())
console.log('Uptime:', uptime() / 60 / 60, 'hours')
