const { latest, duration } = require("../test/helpers/time");

const ArcheToken = artifacts.require("ArcheToken");
const ArcheTokenCrowdsale = artifacts.require("ArcheTokenCrowdsale");

module.exports = (deployer) => {
	deployer.then(async () => {
		let goal = new web3.utils.BN(web3.utils.toWei("20", "ether"));
		let cap = new web3.utils.BN(web3.utils.toWei("100", "ether"));
		let token = await ArcheToken.deployed();
		token = token.address;
		const rate = 500;
		const latestBlockTime = await latest();
		const openingTime = latestBlockTime + duration.weeks(1);
		const closingTime = openingTime + duration.weeks(1);

		const accounts = await web3.eth.getAccounts();
		const wallet = accounts[1];
		return deployer.deploy(
			ArcheTokenCrowdsale,
			rate,
			wallet,
			token,
			cap,
			openingTime,
			closingTime,
			goal
		);
	});
};
