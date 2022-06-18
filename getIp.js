const os = require('os')

function getAddress() {
	let ifaces = os.networkInterfaces()

	for (let dev in ifaces) {
		let iface = ifaces[dev]
		if (!iface) continue

		for (let i = 0; i < iface.length; i++) {
			let { family, address, internal } = iface[i]

			if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
				return address
			}
		}
	}
}

module.exports = getAddress