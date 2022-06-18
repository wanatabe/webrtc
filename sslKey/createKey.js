const mkcert = require('mkcert')
const getAddress = require('../getIp')
const fs = require('fs')
const path = require('path')

const ip = getAddress()

async function createKey() {
  const ca = await mkcert.createCA({
    organization: 'FSY',
    countryCode: 'ChengDu',
    state: 'SiChuan',
    locality: 'WuHou',
    validityDays: 365
  })

  // then create a tls certificate
  const cert = await mkcert.createCert({
    domains: ['127.0.0.1', 'localhost', ip],
    validityDays: 365,
    caKey: ca.key,
    caCert: ca.cert
  })

  fs.writeFileSync(path.resolve(__dirname, "./test.key"), cert.key)
  fs.writeFileSync(path.resolve(__dirname, './test.crt'), cert.cert)
}

createKey()
