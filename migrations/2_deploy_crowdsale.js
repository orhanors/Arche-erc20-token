const ArcheToken = artifacts.require("ArcheToken");
const ArcheTokenCrowdsale = artifacts.require("ArcheTokenCrowdsale");

module.exports = (deployer) => {
	deployer.then(async () => {
		const accounts = await web3.eth.getAccounts();

		const rate = 500;
		const wallet = accounts[1];
		let token = await ArcheToken.deployed();
		token = token.address;
		let cap = new web3.utils.BN(web3.utils.toWei("100", "ether"));
		return deployer.deploy(ArcheTokenCrowdsale, rate, wallet, token, cap);
	});
};
