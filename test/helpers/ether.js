/**
 * Converts ether to wei
 * @param n ether
 * @returns  wei
 */

exports.ether = (n) => {
	return new web3.utils.BN(web3.utils.toWei(n, "ether"));
};

exports.BN = (n) => {
	return new web3.utils.BN(n);
};
