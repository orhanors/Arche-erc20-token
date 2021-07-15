const ArcheToken = artifacts.require("ArcheToken");
const ArcheTokenCrowdsale = artifacts.require("ArcheTokenCrowdsale");

module.exports = async (deployer) => {
	const accounts = await web3.eth.getAccounts();

	const rate = 500;
	const wallet = accounts[1];
	let token = await ArcheToken.deployed();
	token = token.address;
	deployer.deploy(ArcheTokenCrowdsale, rate, wallet, token);
};
