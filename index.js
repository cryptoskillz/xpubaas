/*
TODO

add a check balance endpoint 
check the address format is correct based on the network
return an array of addresses
endpoint to show the state of an address

*/

const http = require("http");
const PORT = process.env.PORT || 5001;

//restify for the REST api
var restify = require('restify');
//bitcoin js
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(ecc)
//set the default biptype
const bipType = 44;
const newAddressCheck = 1;
const startAddress = 0;
const numberOfAddresses = 1000
const randomAddress = 0;
var request = require('request');
var iconv = require('iconv');
var ic = new iconv.Iconv('iso-8859-1', 'utf-8');

function fetchBalace(address) {
    return new Promise(function(resolve, reject) {
        /*
        note:   We are calling a 3rd party here which could  also be lying to us, so this is a risk.  We can easily replace
                this call and access a full node or some other means but that would defeat the point of using the Xpub and there is a lot 
                of other software that interfaces with a full node much better than this program ever wil.

                If you would like to replace this with your own node then I suggest you use getumrel or cyphernode


        */
        //call block chain info
        request.get({ url: "https://blockchain.info/q/addressbalance/" + address, encoding: null, }, function(error, res, body) {
            //check if cloudflare has limited us
            if (res.statusCode === 429)
                resolve('n/a')
            //its a good response
            if (!error && res.statusCode == 200) {
                //convert the body toutf8
                var buf = ic.convert(body);
                var utf8String = buf.toString('utf-8');
                //return it
                resolve(utf8String)
            }

        });
    });
}

let resMessage = (res,message) =>{
    res.send(message);
}

async function retunXpub(req, res, next) {
    //check to see if they are passing in a network
    let _network = bitcoin.networks.bitcoin;
    //internal btc address
    let _address = "";
    //inter btc balance
    let _balance = 0;
    //found address  count
    let _addressCount = 0;
    let _node;

    //check if they passed in a network
    if (req.query.network != undefined) 
    {
        //check if they switched to the testnet
        if (req.query.network == "testnet")
            _network = bitcoin.networks.testnet
    }

    //check  for  a xpub
    if (req.query.xpub !=  undefined)
    {
        //get the node
        _node = bip32.fromBase58(req.query.xpub, _network)
    }
    else
    {
        resMessage(res,{ "error": "Xpub required" });
        return;
    }

    //check if there is a bip type specified
    let _bipType = bipType;
    if (req.query.biptype != undefined)  {
        //note we could check if it is one of the accepted types
        _bipType = parseInt(req.query.biptype)
    }

    //check if there is a new addres check flag
    let _newAddressCheck = newAddressCheck;
    if (req.query.newaddresscheck != undefined) {
        _newAddressCheck = req.query.newaddresscheck
    }

    //check if there is a new addres check flag
    let _startAddress = startAddress;
    if (req.query.startaddress != undefined)  {
        _startAddress = parseInt(req.query.startaddress)
    }

    //check if there is a number of addresses flag
    let _numberOfAddresses = numberOfAddresses
    if (req.query.numberofaddresses != undefined)  {
        _numberOfAddresses = parseInt(req.query.numberofaddresses)
    }

    //check if there is a random address
    let _randomAddress = randomAddress
    if (req.query.randomaddress != undefined)  {
        _randomAddress = parseInt(req.query.randomaddress)
    }

    //check if we want a random number
    if (_randomAddress == 1) {
        //get a random number between the start address and the number of addresses and set it to the start address so the check new address check loop works
        _startAddress = Math.floor(Math.random() * (_numberOfAddresses - _startAddress + 1) + _startAddress)
    }

    
    //debug
    //console.log(req.params)
    //console.log(_bipType)
    //console.log(_startAddress)
    //console.log(_newAddressCheck)
    //console.log(_startAddress)
    //console.log(_numberOfAddresses)
    //console.log(_address)
    //console.log(_balance)

    //check the user has not done something dumb
    if (_startAddress >= _numberOfAddresses) {
        resMessage(res,{"error":"Start address is > number of addresses" });
        return;
    }

    if (_newAddressCheck == 1) {
        //loop a 1000 address
        for (i = _startAddress; i <= _numberOfAddresses; i++) {
            //get an address
            if (_bipType == 44)
                _address = bitcoin.payments.p2pkh({ pubkey: _node.derive(0).derive(i).publicKey }).address;
            if (_bipType == 49)
                _address = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: _node.derive(0).derive(i).publicKey }), }).address;
            if (_bipType == 84)
                _address = bitcoin.payments.p2wpkh({ pubkey: _node.derive(0).derive(i).publicKey }).address;
            //get the current balance
            _balance = await fetchBalace(_address);
            //debug
            //console.log(_address)
            //console.log(_balance)
            //check if its free or we have been blocked
            if ((_balance == "n/a") || (_balance == 0)) {
                //set the address count
                _addressCount = i;
                break
            }
            await sleep(1000);

        }
    } else {
        //we dont care if it is been used or not
        if (_bipType == 44)
            _address = bitcoin.payments.p2pkh({ pubkey: _node.derive(0).derive(_startAddress).publicKey }).address;
        if (_bipType == 49)
            _address = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: _node.derive(0).derive(_startAddress).publicKey }), }).address;
        if (_bipType == 84)
            _address = bitcoin.payments.p2wpkh({ pubkey: _node.derive(0).derive(_startAddress).publicKey }).address;
        //get the current balance
        //note: We do not really need to do this  as we do not care about the price as we are going to potentially 
        //      resuse the address but it costs us very little so why not
        _balance = await fetchBalace(_address);
        //this is always going to be the startaddress passed or defaulted to 0
        _addressCount = _startAddress;
    }

    //return it
    //note we could hide the balance paramter if you newaddresscheck = 0;
    resMessage(res,{ "address": _address, "balance": _balance, "derive": _addressCount });
    next();
}

var server = restify.createServer({ maxParamLength: 500 });
server.use(restify.plugins.queryParser());

server.get('/xpub/', retunXpub);
server.head('/xpub/', retunXpub);
server.get('/xpub', retunXpub);
server.head('/xpub', retunXpub);

server.listen(PORT, function() {
    console.log('%s listening at %s', server.name, server.url);
});