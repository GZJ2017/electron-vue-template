const args = process.argv.splice(2);
let params = Object.fromEntries(args.map(ele=>ele.split('=')))

module.exports = {
	params
}