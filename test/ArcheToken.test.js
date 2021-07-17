const ArcheToken = artifacts.require("ArcheToken");

contract("ArcheToken", (accounts) => {
	const name = "Arche Token";
	const symbol = "ARCHE";
	const decimals = 18;
	let arche;

	beforeEach(async () => {
		//"new" deploys the new contract everytime
		arche = await ArcheToken.new(name, symbol, decimals);
	});

	describe("token attributes", () => {
		it("has correct name", async () => {
			const _name = await arche.name();

			assert.strictEqual(name, _name);
		});

		it("has correct symbol", async () => {
			const _symbol = await arche.symbol();
			assert.strictEqual(symbol, _symbol);
		});
	});
});
