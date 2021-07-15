const { ether, BN } = require("./helpers/ether");

const ArcheToken = artifacts.require("ArcheToken");
const ArcheTokenCrowdsale = artifacts.require("ArcheTokenCrowdsale");

contract("ArcheTokenCrowdsale", (accounts) => {
	//Accounts
	const investor1 = accounts[2];
	const investor2 = accounts[3];

	let arche;

	//Token config
	const _name = "Arche Token";
	const _symbol = "ARCHE";
	const _decimals = 18;

	//Crowdsale config
	let crowdsale;
	const _rate = 500; //How many tokens can I get for ETH?
	const _wallet = accounts[1];
	beforeEach(async () => {
		arche = await ArcheToken.new(_name, _symbol, _decimals);
		crowdsale = await ArcheTokenCrowdsale.new(
			_rate,
			_wallet,
			arche.address
		);

		//Adding minter to send transaction
		await arche.addMinter(crowdsale.address);
	});

	describe("crowdsale", () => {
		it("tracks the token", async () => {
			const token = await crowdsale.token();
			assert.strictEqual(token, arche.address);
		});

		it("tracks the rate", async () => {
			const rate = await crowdsale.rate();
			assert.strictEqual(rate.toNumber(), _rate);
		});

		it("tracks the wallet", async () => {
			const wallet = await crowdsale.wallet();
			assert.strictEqual(_wallet, wallet);
		});
	});

	describe("accepting payments", () => {
		it("mints the token after purchase", async () => {
			const originalTotalSupply = await arche.totalSupply();

			await crowdsale.sendTransaction({
				value: ether("1"),
				from: investor1,
			});
			const newTotalSupply = await arche.totalSupply();

			assert.ok(BigInt(newTotalSupply) > BigInt(originalTotalSupply));
		});
		it("should accept payments", async () => {
			const value = ether("1");
			const purchaser = investor2;
			try {
				//Buy tokens for yourself
				await crowdsale.sendTransaction({ value, from: investor1 });

				//Buy tokens for another people
				await crowdsale.buyTokens(investor1, {
					value,
					from: purchaser,
				});
				assert(true);
			} catch (error) {
				assert(false);
			}
		});
	});
});
