const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8745"))
const solc = require('solc');
for (var i = 0; i < web3.eth.accounts.length; i++) {
  acct[i] = web3.eth.accounts[i]
}

var contract = `pragma solidity ^0.4.15;

contract NotarizeTx {

  //State variables
  mapping (bytes32 => bytes32) private proofs;
  address public BSG_NODE;
  struct Tx {
    address buyer;
    address seller;
    bytes32 id;
    string date;
    uint value;
    bytes32 hash;
    string status;
    string shipping;
  }

  Tx _tx;
  event NotaryEvt(bytes32 _hash, bytes32 _id);

  /*
    Contract constructor takes _user as client Ethereum address
   */
 constructor(address _buyer, address _seller, bytes32 _id, string _date, uint _value, bytes32 _hash, string _status, string _shipping) public {
    _tx.buyer = _buyer;
    _tx.seller = _seller;
    _tx.id = _id;
    _tx.date = _date;
    _tx.value = _value;
    _tx.hash = _hash;
    _tx.status = _status;
    _tx.shipping = _shipping;
    proofs[_hash] = _id;
    BSG_NODE = msg.sender;
  }
  /**
  *
  *
   */
  function updateStatus(string _status, bytes32 _hash, bytes32 _id) public {
    if (_id != _tx.id)
      revert();

    if (msg.sender == _tx.buyer || msg.sender == BSG_NODE) {
      _tx.status = _status;
      _tx.hash = _hash;
      proofs[_hash] = _id;
    emit  NotaryEvt(_hash, _tx.id);
    } else {
      revert();
    }
  }
  /**
  *
   */
  function updateShipping(string _shipping, bytes32 _hash, bytes32 _id) public {
    if (_id != _tx.id)
      revert();

    if (msg.sender == _tx.buyer || msg.sender == BSG_NODE) {
      _tx.status = _shipping;
      _tx.hash = _hash;
      proofs[_hash] = _tx.id;
      emit NotaryEvt(_hash, _tx.id);
    } else {
      revert();
    }
  }
}`

var compile = (contract) => solc.compile(contract)

async function getData (contract) {
  return {
    abi: await JSON.parse(compile(contract).contracts[":NotarizeTx"].interface),
    bytecode: await compile(contract).contracts[":NotarizeTx"].bytecode
  }
async function createContract(contract) {
  return await web3.eth.contract(getData.abi(compile(contract)))
}
async function deploy(contract, buyer, seller, id, date, value, hash, status, shipping) {
  return await createContract(getData.abi(compile(contract))).new( buyer, seller, id, date, value, hash, status, shipping, {
    data: getData.bytecode,
    gas: 3000000,
  }, (err, contract) => {if(err)console.log(err);})
}
deploy(contract, acct[0], acct[1], "sksj3642ams6odnsoc32549102xfasf0", "2/4/18", 1, "sksj3642ams6odnsoc32549102xfasf1", "purchased", "da")
  .then(
    function (res) {
      console.log(res);
    },
    function (err) {
      console.log("Error: "+err)
    }
  )
// var abi = JSON.parse(compiled.contracts.NotarizeTx.interface)
// console.log(abi);
