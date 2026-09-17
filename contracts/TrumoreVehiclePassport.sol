// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract TrumoreVehiclePassport is AccessControl {
    bytes32 public constant ATTESTER_ROLE = keccak256("ATTESTER_ROLE");

    struct PassportAttestation {
        bytes32 passportHash;
        uint64 reportVersion;
        uint64 issuedAt;
        bool active;
    }

    mapping(bytes32 => PassportAttestation) public passports;

    event PassportAttested(bytes32 indexed vehicleId, bytes32 indexed passportHash, uint64 reportVersion, uint64 issuedAt);
    event PassportRevoked(bytes32 indexed vehicleId, uint64 reportVersion);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ATTESTER_ROLE, msg.sender);
    }

    function attestPassport(bytes32 vehicleId, bytes32 passportHash, uint64 reportVersion) external onlyRole(ATTESTER_ROLE) {
        require(vehicleId != bytes32(0), "Passport: zero vehicle id");
        require(passportHash != bytes32(0), "Passport: zero hash");
        require(reportVersion > 0, "Passport: zero version");
        PassportAttestation storage current = passports[vehicleId];
        require(reportVersion > current.reportVersion, "Passport: version not newer");
        uint64 issuedAt = uint64(block.timestamp);
        current.passportHash = passportHash;
        current.reportVersion = reportVersion;
        current.issuedAt = issuedAt;
        current.active = true;
        emit PassportAttested(vehicleId, passportHash, reportVersion, issuedAt);
    }

    function verifyPassport(bytes32 vehicleId, bytes32 passportHash) external view returns (bool) {
        PassportAttestation memory passport = passports[vehicleId];
        return passport.active && passport.passportHash == passportHash;
    }

    function revokePassport(bytes32 vehicleId) external onlyRole(ATTESTER_ROLE) {
        PassportAttestation storage passport = passports[vehicleId];
        require(passport.active, "Passport: not active");
        passport.active = false;
        emit PassportRevoked(vehicleId, passport.reportVersion);
    }
}
