pragma solidity ^0.5.0;

contract Opportunity {
    string title;
    string description;
    string date;
    string location;
    string QRcode;

    uint quantity;

    address owner;
    address[] volunteers;

    mapping (address => bool) QR;
    mapping (address => uint) time;
    mapping (address => bool) confirmed;
    mapping (address => string) endLocation;

    constructor(string memory _title, string memory _description, string memory _location, string memory _QRcode, uint _quantity, address _owner, string memory _date) public {
        title = _title;
        description = _description;
        location = _location;
        QRcode = _QRcode;
        date = _date;
        quantity = _quantity;
        owner = _owner;
    }

    function joinOpportunity() public {
        require(volunteers.length < quantity);
        for (uint i = 0; i < volunteers.length; i++) {
            require(volunteers[i] != msg.sender);
        }
        volunteers.push(msg.sender);
    }

    function verifyQR(address _volunteer) public {
        require(msg.sender == owner);
        QR[_volunteer] = true;
    }

    function record(uint _time, string memory _endLocation) public {
        require(QR[msg.sender]);
        time[msg.sender] = _time;
        endLocation[msg.sender] = _endLocation;
    }

    function approve(address _volunteer) public {
        require(msg.sender == owner);
        require(QR[_volunteer]);
        require(time[_volunteer] != 0);
        confirmed[_volunteer] = true;
    }

    function getVolunteer(address _volunteer) public view returns(bool, uint, bool, string memory) {
        return (QR[_volunteer], time[_volunteer], confirmed[_volunteer], endLocation[_volunteer]);
    }

    function getDetails() public view returns(string memory, string memory, string memory, string memory, uint, address, address[] memory, string memory) {
        return (title, description, location, QRcode, quantity, owner, volunteers, date);
    }
}
