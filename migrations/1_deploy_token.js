const ArcheToken = artifacts.require("ArcheToken");

module.exports = function (deployer) {
	const name = "Arche Token";
	const symbol = "ARCHE";
	const decimals = 18;
	deployer.deploy(ArcheToken, name, symbol, decimals);
};
