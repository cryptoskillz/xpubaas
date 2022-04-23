# xpubaas
generate a Bitcoin address from an xpub address from a REST API


Using this simple REST API to generate a bitcoin address from an xpub makes it easy to integrate into e-commerce gateways etc.  And yes I know it is Xpub is 
not secure, I do not want to hear it.

## usage

http://127.0.0.1:5001/xpub/xpub6CatWdiZiodmUeTDp8LT5or8nmbKNcuyvz7WyksVFkKB4RHwCD3XyuvPEbvqAQY3rAPshWcMLoP2fMFMKHPJ4ZeZXYVUhLv1VMrjPC7PW6V/bitcoin/84/

paramter 1 = xpub key
paramter 2 = bitcoin / testnet (network)
paramater 3 = 44,49,84 (address type)

## todo

return the first clean (balance of 0)
return a random address
return an array of addresses
