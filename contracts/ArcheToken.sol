pragma solidity >=0.5.5;


import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";

contract ArcheToken is ERC20Detailed,ERC20Pausable,ERC20Mintable{
    
    constructor(string memory _name, string memory _symbol,uint8 _decimals) 
    ERC20Detailed(_name,_symbol,_decimals)
    public
    {

    }
}