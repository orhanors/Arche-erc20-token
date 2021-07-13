const ArcheToken = artifacts.require("ArcheToken");

module.exports = function (deployer) {
	const name = "Arche Token";
	const symbol = "ARCHE";
	deployer.deploy(ArcheToken, name, symbol);
};
