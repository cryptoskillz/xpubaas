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


function retunXpub(req, res, next) {
    /* 
    TODO

    pass a paramater to get the first free address
    pass a random address

    */

    //check to see if they are passing in a network
    let _network = bitcoin.networks.bitcoin;
    let _address = "";
    if ((req.params.network != undefined) && (req.params.network != "")) {
        //check if they switched to the testnet
        if (req.params.network == "testnet")
            _network = bitcoin.networks.testnet
    }

    //get the bip
    let _bipType = bipType;
    if ((req.params.biptype != undefined) && (req.params.biptype != "")) {
        _bipType = req.params.biptype
    }

    //get the node
    const node = bip32.fromBase58(req.params.xpub, _network)
    //debug
    console.log(req.params)
    console.log(_bipType)
    switch (_bipType) {
        case "44":
            _address = bitcoin.payments.p2pkh({pubkey: node.derive(0).derive(0).publicKey}).address;
            break;
        case "49":
            _address =  bitcoin.payments.p2sh({redeem: bitcoin.payments.p2wpkh({pubkey: node.derive(0).derive(0).publicKey}),}).address;
            break;
        case "84":
            _address = bitcoin.payments.p2wpkh({pubkey: node.derive(0).derive(0).publicKey}).address;
        default:
            // code block
    }
    //return it
    res.send({ "address": _address });
    next();
}

    var server = restify.createServer({ maxParamLength: 500 });
    server.use(restify.plugins.queryParser());
    server.get('/xpub/:xpub/:network/:biptype/', retunXpub);
    server.head('/xpub/:xpub/:network/:biptype/', retunXpub);

    server.listen(PORT, function() {
        console.log('%s listening at %s', server.name, server.url);
    });