# xpubaas
generate a Bitcoin address from an xpub address using a REST API


Using this simple REST API to generate a bitcoin address from an xpub makes it easy to integrate into e-commerce gateways etc.  And yes I know it is Xpub is 
not secure, I do not want to hear it.

## usage

http://127.0.0.1:5001/xpub/xpub6CatWdiZiodmUeTDp8LT5or8nmbKNcuyvz7WyksVFkKB4RHwCD3XyuvPEbvqAQY3rAPshWcMLoP2fMFMKHPJ4ZeZXYVUhLv1VMrjPC7PW6V/bitcoin/44/1/1000/100/0/

paramter 1 = xpub key

paramter 2 = bitcoin / testnet (network) defaults to mainnet

paramater 3 = 44,49,84 (address type) defaults to 84

paramater 4 = 0 / 1 boolean (loop until we get an address with a 0 balance) defaults to 1

paramater 5 = start address defaults to 0

paramater 6 = max number of addresses to check defaults to 1000

paramater 7 = 0 / 1 boolean (get a random address between paramter 5 and 6 if paramater 4 is 1 then it will use this as the start for the loop) 

## todo

return an array of addresses

endpoint to show the state of an address


