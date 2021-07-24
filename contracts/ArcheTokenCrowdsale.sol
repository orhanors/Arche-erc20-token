pragma solidity >=0.5.5;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/distribution/RefundablePostDeliveryCrowdsale.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArcheTokenCrowdsale is Crowdsale,MintedCrowdsale,CappedCrowdsale,TimedCrowdsale,RefundableCrowdsale,RefundablePostDeliveryCrowdsale {
    
    uint public investorMinCap = 2000000000000000; //0.002 ETH 
    uint public investorHardCap = 5000000000000000000; //5 ETH
    
    mapping(address => uint) public contributions;
    constructor(uint _rate,address payable _wallet, ERC20 _token, uint256 _cap,uint256 _openingTime,uint256 _closingTime,uint256 _goal) 
    Crowdsale(_rate,_wallet,_token) 
    CappedCrowdsale(_cap)
    TimedCrowdsale(_openingTime,_closingTime)
    RefundableCrowdsale(_goal)
    RefundablePostDeliveryCrowdsale()
    public{
        require(_goal <= _cap,"ArcheCrowdsale: Goal should be less than cap");
    }
    
    function getUserContribution(address _beneficiary) public view returns(uint) {
        return contributions[_beneficiary];
    }
    function  _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal view{
        super._preValidatePurchase(_beneficiary,_weiAmount);
        uint existingContribution = contributions[_beneficiary];
        uint newContribution = existingContribution.add(_weiAmount);
        
        require(newContribution >= investorMinCap && newContribution <= investorHardCap,"Cap Error: Min or max");
        
    }

    function _updatePurchasingState(address _beneficiary, uint256 _weiAmount) internal{
        super._updatePurchasingState(_beneficiary,_weiAmount);
        contributions[_beneficiary] = contributions[_beneficiary].add(_weiAmount);
    }
    
    
}