// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract FixieProxyAdmin is ProxyAdmin {
    constructor(address owner) ProxyAdmin(owner) {}
}
