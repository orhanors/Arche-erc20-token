pragma solidity ^0.8.4;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ArcheToken is ERC20 {
    
    constructor(string memory name_, string memory symbol_) 
    ERC20(name_,symbol_)
    {

    }
}