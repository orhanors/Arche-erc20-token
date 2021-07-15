pragma solidity >=0.5.5;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArcheTokenCrowdsale is Crowdsale,MintedCrowdsale {
    constructor(uint _rate,address payable _wallet, ERC20 _token) 
    Crowdsale(_rate,_wallet,_token) 
    public{

    } 
}