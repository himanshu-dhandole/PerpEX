// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vault is Ownable {
    // Tracks each user's funds
    struct UserData {
        uint256 locked; // Funds locked in open positions
        uint256 available; // Funds available for withdrawal or trading
    }

    mapping(address => UserData) private userData;

    uint256 public totalLocked; // Total locked across all users
    uint256 public totalDeposited; // Total deposited across all users
    uint256 public utilizationRate; // Percentage of locked to deposited
    uint256 public constant MAX_UTILIZATION = 8000; // 80% cap

    address public positionManager; // Authorized to manage collateral
    IERC20 public immutable vUSDT; // Collateral token (e.g., vUSDT)

    // Events
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event CollateralLocked(address indexed user, uint256 amount);
    event CollateralUnlocked(address indexed user, uint256 amount);
    event CollateralTransferred(address indexed to, uint256 amount);

    constructor(
        address _vUSDTaddress,
        uint256 _initialSupply
    ) Ownable(msg.sender) {
        vUSDT = IERC20(_vUSDTaddress);
        totalDeposited += _initialSupply;
    }

    // Restricts to position manager
    modifier onlyPositionManager() {
        require(msg.sender == positionManager, "Not authorized");
        _;
    }

    // Set the position manager (only once, usually)
    function setPositionManager(address _positionManager) external onlyOwner {
        positionManager = _positionManager;
    }

    // Deposit vUSDT into the vault
    function deposit(uint256 _amount) external {
        require(_amount > 0, "Amount cannot be zero");
        require(
            vUSDT.allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );
        require(
            vUSDT.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        userData[msg.sender].available += _amount;
        totalDeposited += _amount;

        utilizationRate = totalDeposited == 0
            ? 0
            : (totalLocked * 10000) / totalDeposited;

        emit Deposited(msg.sender, _amount);
    }

    // Withdraw vUSDT from the vault
    function withdrawal(uint256 _amount) external {
        require(_amount > 0, "Amount cannot be zero");
        require(
            userData[msg.sender].available >= _amount,
            "Insufficient funds"
        );

        userData[msg.sender].available -= _amount;
        totalDeposited -= _amount;

        utilizationRate = totalDeposited == 0
            ? 0
            : (totalLocked * 10000) / totalDeposited;

        require(vUSDT.transfer(msg.sender, _amount), "Transfer failed");

        emit Withdrawn(msg.sender, _amount);
    }

    // Lock funds for an open position
    function lockCollateral(
        address _user,
        uint256 _amount
    ) external onlyPositionManager {
        require(_amount > 0, "Amount cannot be zero");
        require(userData[_user].available >= _amount, "Not enough available");

        uint256 newUtilization = totalDeposited == 0
            ? 0
            : ((totalLocked + _amount) * 10000) / totalDeposited;
        require(newUtilization <= MAX_UTILIZATION, "Exceeds max utilization");

        userData[_user].available -= _amount;
        userData[_user].locked += _amount;
        totalLocked += _amount;

        utilizationRate = newUtilization;

        emit CollateralLocked(_user, _amount);
    }

    // Unlock funds after position is closed
    function unlockCollateral(
        address _user,
        uint256 _amount
    ) external onlyPositionManager {
        require(_amount > 0, "Amount cannot be zero");
        require(userData[_user].locked >= _amount, "Insufficient locked funds");

        userData[_user].locked -= _amount;
        userData[_user].available += _amount;
        totalLocked -= _amount;

        utilizationRate = totalDeposited == 0
            ? 0
            : (totalLocked * 10000) / totalDeposited;

        emit CollateralUnlocked(_user, _amount);
    }

    // Transfer locked funds from vault to a user (e.g., after liquidation)
    // function transferCollateral(address _to, uint256 _amount) external onlyPositionManager {
    //     require(_amount > 0, "Amount cannot be zero");
    //     require(totalLocked >= _amount, "Vault lacks locked funds");

    //     userData[_to].available += _amount;
    //     totalLocked -= _amount;

    //     utilizationRate = totalDeposited == 0 ? 0 : (totalLocked * 10000) / totalDeposited;

    //     emit CollateralTransferred(_to, _amount);
    // }

    // Reduce locked collateral when a user is liquidated
    // function absorbLiquidatedCollateral(address _user, uint256 _amount) external onlyPositionManager {
    //     require(_amount > 0, "Amount must be greater than 0");
    //     require(userData[_user].locked >= _amount, "Not enough locked funds");

    //     userData[_user].locked -= _amount;
    //     totalLocked -= _amount;

    //     utilizationRate = totalDeposited == 0 ? 0 : (totalLocked * 10000) / totalDeposited;
    // }

    // Paying out users Profit on a position while closing
    function payOutProfit(
        address _to,
        uint256 _amount
    ) external onlyPositionManager {
        require(_to != address(0), "Invalid user");
        require(_amount > 0, "Amount must be greater than 0");
        require(totalDeposited >= _amount, "Vault lacks funds");

        userData[_to].available += _amount;
        totalDeposited -= _amount;

        utilizationRate = totalDeposited == 0
            ? 0
            : (totalLocked * 10000) / totalDeposited;
    }

    // Absorbing users losses into vaults address
    function absorbLoss(
        address _user,
        uint256 _amount
    ) external onlyPositionManager {
        require(_user != address(0), "Invalid user");
        require(_amount > 0, "Amount must be greater than 0");
        require(
            userData[_user].available >= _amount,
            "Insufficient available funds"
        );

        totalDeposited += _amount;
        userData[_user].available -= _amount;

        utilizationRate = totalDeposited == 0
            ? 0
            : (totalLocked * 10000) / totalDeposited;
    }

    // View user's deposit/available/locked balances
    function getUserCollateral() external view returns (UserData memory) {
        return userData[msg.sender];
    }

    // Get current vault stats
    function getVaultStats()
        external
        view
        returns (
            uint256 _totalDeposited,
            uint256 _totalLocked,
            uint256 _utilizationRate
        )
    {
        return (totalDeposited, totalLocked, utilizationRate);
    }

    // Prevent direct ETH or wrong function calls
    fallback() external {
        revert("Invalid function call");
    }

    receive() external payable {
        revert("ETH not accepted");
    }
}
