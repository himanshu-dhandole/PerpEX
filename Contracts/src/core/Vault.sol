// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vault is Ownable(msg.sender) {
    struct Userdata {
        uint deposited;
        uint locked;
        uint available;
    }
    mapping(address => Userdata) userdata;

    uint totalLocked;
    uint totalDeposited;
    uint utilizataonRate;
    uint maxUtilization = 8000; // 80%

    address positionManager;
    IERC20 public vUSDT;

    event deposited (address indexed _user , uint _amount) ;
    event withdrawn (address indexed _user , uint _amount) ;
    event locked (address indexed _user , uint _amount) ;
    event unlocked (address indexed _user , uint _amount) ;
    event transferedCollateral(address indexed _from , address indexed _to , uint _amount) ;

    constructor(address _vUSDTaddress) {
        vUSDT = IERC20(_vUSDTaddress);
    }

    modifier _onlyPositionManager() {
        require(msg.sender == positionManager, "not accessible");
        _;
    }

    function setPositionManager(address _positionManager) public onlyOwner {
        positionManager = _positionManager;
    }

    function deposit(uint _amount) external {
        require(_amount > 0, "amount canno be ZERO");
        require(vUSDT.allowance(msg.sender, address(this)) >= _amount , "allowance not found");
        require(vUSDT.transferFrom(msg.sender, address(this), _amount));  
        userdata[msg.sender].available += _amount ;
        userdata[msg.sender].deposited += _amount ;
        totalDeposited += _amount ;
        
        emit deposited(msg.sender, _amount);
    }

    function withdrawl(uint _amount) external {
        require(_amount > 0, "cannot withdraw ZERO");
        require(userdata[msg.sender].available >= _amount , "not enough amount");
        require(vUSDT.transfer(msg.sender, _amount), "transfer failed");
        userdata[msg.sender].available -= _amount ;
        userdata[msg.sender].deposited -= _amount ;
        totalDeposited -= _amount ;
        emit withdrawn(msg.sender, _amount);
    }
    function lockCollateral(address _user , uint _amount) external _onlyPositionManager{
        require(_amount > 0, "cannot withdraw ZERO");
        require(userdata[_user].available >= _amount , "not enough funds");
        require((((totalLocked + _amount)*10000) / totalDeposited)>= maxUtilization);
        userdata[_user].available -= _amount ;
        userdata[_user].locked += _amount ;
        totalLocked += _amount ;
        utilizataonRate = ( totalLocked * 10000 ) / totalDeposited ;
        emit locked(_user, _amount);
    }

    function unlockCollateral(address _user ,uint _amount) external _onlyPositionManager{
        require(_amount > 0, "cannot withdraw ZERO");
        require(userdata[_user].locked >= _amount , "not enough locked funds");
        userdata[_user].locked -= _amount ;
        userdata[_user].available += _amount ;
        totalLocked -= _amount ;
        emit unlocked(_user, _amount);
    }

    function transferCollateral (address _from , address _to , uint _amount) external _onlyPositionManager {
        require(_amount > 0, "cannot transfer ZERO");
        require(userdata[_from].locked >= _amount , "not enough locked funds");
        userdata[_from].locked -= _amount ;
        userdata[_to].available += _amount ;
        totalLocked -= _amount ;
        emit transferedCollateral(_from, _to, _amount);
    }

    function getUserColletral  () external view returns (Userdata memory) {
        return userdata[msg.sender] ;
    }

    function getUtilizationRate () public view returns (uint){
        return utilizataonRate ;
    }

    function getTotalLiqudity () external view returns (uint) {
        return totalDeposited;
    }
}