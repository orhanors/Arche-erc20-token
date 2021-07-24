const { ether, BN } = require("./helpers/ether");
const {
	latest,
	duration,
	increase,
	increaseTo,
	advanceBlock,
} = require("./helpers/time");
const BigNumber = web3.utils.BN;

const ArcheToken = artifacts.require("ArcheToken");
const ArcheTokenCrowdsale = artifacts.require("ArcheTokenCrowdsale");

require("chai")
	.use(require("chai-as-promised"))
	.use(require("chai-bignumber")(BigNumber))
	.should();

contract("ArcheTokenCrowdsale", async (accounts) => {
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
	const _cap = ether("100"); //We'll accept 100 ETH for the crowdsale
	const _goal = ether("20"); // Minimum goal... If the goal is not reached, the users can "claimRefund" to get their Ether back.

	const _investorMinCap = ether("0.002");
	const _investorHardCap = ether("5");
	let _openingTime;
	let _closingTime;
	let _afterClosingTime;

	beforeEach(async () => {
		_openingTime = (await latest()).add(duration.weeks(1));
		_closingTime = _openingTime.add(duration.weeks(1));
		_afterClosingTime = _closingTime.add(duration.seconds(1));

		arche = await ArcheToken.new(_name, _symbol, _decimals);

		crowdsale = await ArcheTokenCrowdsale.new(
			_rate,
			_wallet,
			arche.address,
			_cap,
			_openingTime,
			_closingTime,
			_goal
		);

		//Adding minter to send transaction
		await arche.addMinter(crowdsale.address);

		//Advance blockchain time to crowdsale start

		await increaseTo(_openingTime);
	});

	describe("crowdsale", () => {
		it("tracks the token", async () => {
			const token = await crowdsale.token();

			assert.strictEqual(token, arche.address);
		});

		it("tracks the rate", async () => {
			const rate = await crowdsale.rate();
			// rate.should.be.bignumber.equal(_rate);
			assert(rate instanceof BigNumber);
			assert.strictEqual(rate.toNumber(), _rate);
		});

		it("tracks the wallet", async () => {
			const wallet = await crowdsale.wallet();
			assert.strictEqual(_wallet, wallet);
		});
	});
	describe("minted crowdsale", async () => {
		it("mints the token after purchase", async () => {
			const originalTotalSupply = await arche.totalSupply();

			await crowdsale.sendTransaction({
				value: ether("1"),
				from: investor1,
			});
			const newTotalSupply = await arche.totalSupply();

			assert.ok(BigInt(newTotalSupply) > BigInt(originalTotalSupply));
		});
	});

	describe("capped crowdsale", () => {
		it("tracks the cap", async () => {
			const cap = await crowdsale.cap();
			assert(cap instanceof BigNumber);
		});
	});

	describe("timed crowdsale", () => {
		it("rejects transactions before the opening time", async () => {
			const isOpen = await crowdsale.isOpen();
			assert.ok(isOpen, false);

			const newOpeningTime = (await latest()).add(duration.weeks(1));
			await increaseTo(newOpeningTime.sub(duration.seconds(1)));

			try {
				await crowdsale.sendTransaction({ value, from: investor1 });
				assert(false);
			} catch (error) {
				assert(error);
			}
		});

		it("rejects transactions after the closing time", async () => {
			await increaseTo(_afterClosingTime);
			const isOpen = crowdsale.isOpen();
			const hasClosed = crowdsale.hasClosed();

			assert.ok(isOpen, false);
			assert.ok(hasClosed, true);
		});
	});

	describe("refundable crowdsale", () => {
		beforeEach(async () => {
			await crowdsale.buyTokens(investor1, {
				from: investor1,
				value: ether("1"),
			});
		});

		describe("during crowdsale", () => {
			it("prevents investor from claiming refund", async () => {
				try {
					//This should throw "not finalized error"
					await crowdsale.claimRefund(investor1);
					assert(false);
				} catch (error) {
					assert(error);
				}
			});
		});
	});
	describe("accepting payments", () => {
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

	describe("buyTokens()", () => {
		it("accepts payments in the range of min and max", async () => {
			const value = _investorHardCap - 1;
			try {
				await crowdsale.buyTokens(investor2, {
					from: investor2,
					value,
				});

				const contributedValue = await crowdsale.getUserContribution(
					investor2
				);

				assert.strictEqual(BigInt(value), BigInt(contributedValue));
			} catch (error) {
				assert(false);
			}
		});

		it("accepts payments that is less than min amount if the investor already met min cap ", async () => {
			const investor = accounts[5];
			try {
				//Valid transaction
				let value1 = ether("1");

				await crowdsale.buyTokens(investor, {
					from: investor,
					value: value1,
				});
				//Valid transaction since the investor already met the minimum contribution
				let value2 = _investorMinCap - 50; //wei
				await crowdsale.buyTokens(investor, {
					from: investor2,
					value: value2,
				});
				assert(true);
			} catch (error) {
				console.log("ERRRR::", error);
				assert(false);
			}
		});

		it("rejects the transaction when the contribution is less than min amount", async () => {
			const value = _investorMinCap - 1;
			try {
				await crowdsale.buyTokens(investor1, {
					value,
					from: investor2,
				});
				assert(false);
			} catch (error) {
				assert(error);
			}
		});

		it("rejects the transaction when the contribution is more than hard cap", async () => {
			const value = _investorHardCap + 1;
			try {
				await crowdsale.buyTokens(investor1, {
					value,
					from: investor2,
				});
				assert(false);
			} catch (error) {
				assert(error);
			}
		});

		it("rejects the transaction when the total contribution is more than hard cap", async () => {
			const investor = accounts[6];
			try {
				//Valid transaction
				let value1 = ether("3");

				await crowdsale.buyTokens(investor, {
					from: investor,
					value: value1,
				});

				//Invalid because total contribution exceeds the hard cap
				let value2 = ether("4");
				await crowdsale.buyTokens(investor, {
					from: investor2,
					value: value2,
				});
				assert(false);
			} catch (error) {
				assert(error);
			}
		});
	});
});
