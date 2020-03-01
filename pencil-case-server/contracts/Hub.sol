pragma solidity ^0.5.0;
import "./Ownership.sol";
import "./Opportunity.sol";

contract Hub is Ownership {
    address[] public deployedOpportunities;

    function createOpportunity(string memory _title, string memory _description, string memory _location, string memory _QRcode, uint _quantity, string memory _date) public {
        address newOpportunity = address(new Opportunity(_title, _description, _location, _QRcode, _quantity, msg.sender, _date));
        deployedOpportunities.push(newOpportunity);
    }

    function returnOpportunities() public view returns(address[] memory) {
        return deployedOpportunities;
    }
}
