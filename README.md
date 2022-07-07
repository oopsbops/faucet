<div align="center">
  <h1> GotaBit Faucet </h1>
</div>

## Build and start 
```
yarn install
yarn build
yarn dev-start
```

Advanced users that want to provide their custom config can start as follows:

```
FAUCET_TOKENS=ugio,uusd  \
FAUCET_ADDRESS_PREFIX=gio \
FAUCET_GAS_PRICE=0.000001ugio \
FAUCET_MNEMONIC="<YOUR MNEMONIC>" \
  ./bin/cosmos-faucet start "http://localhost:26657"
```

## Usage

```
Usage: cosmos-faucet action [arguments...]

Positional arguments per action are listed below. Arguments in parentheses are optional.

help      Shows a help text and exits

version   Prints the version and exits

generate  Generates a random mnemonic, shows derived faucet addresses and exits

start     Starts the faucet
           1  Node base URL, e.g. http://localhost:26657

Environment variables

FAUCET_CONCURRENCY        Number of distributor accounts. Defaults to 5.
FAUCET_PORT               Port of the webserver. Defaults to 8000.
FAUCET_MEMO               Memo for send transactions. Defaults to unset.
FAUCET_GAS_PRICE          Gas price for transactions as a comma separated list.
                          Defaults to "0.025ucosm".
FAUCET_GAS_LIMIT          Gas limit for send transactions. Defaults to 100000.
FAUCET_MNEMONIC           Secret mnemonic that serves as the base secret for the
                          faucet HD accounts
FAUCET_PATH_PATTERN       The pattern of BIP32 paths for the faucet accounts.
                          Must contain one "a" placeholder that is replaced with
                          the account index.
                          Defaults to the Cosmos Hub path "m/44'/118'/0'/0/a".
FAUCET_ADDRESS_PREFIX     The bech32 address prefix. Defaults to "cosmos".
FAUCET_TOKENS             A comma separated list of token denoms, e.g.
                          "uatom" or "ucosm, mstake".
FAUCET_CREDIT_AMOUNT_TKN  Send this amount of TKN to a user requesting TKN. TKN is
                          a placeholder for the token's denom. Defaults to 10000000.
FAUCET_REFILL_FACTOR      Send factor times credit amount on refilling. Defauls to 8.
FAUCET_REFILL_THRESHOLD   Refill when balance gets below factor times credit amount.
                          Defaults to 20.
```

### Working with docker

- Build a faucet

```sh
docker build -t gotabit-faucet .
```

- Version and help

```sh
docker run --rm gotabit-faucet version
docker run --rm gotabit-faucet help
```

- Run faucet locally

```sh
docker run  -d  -p 8000:8000   \
  --name faucet \
  -e FAUCET_MNEMONIC="<YOUR MNEMONIC>" \
  -e FAUCET_TOKENS=ugio,uusd  \
  -e FAUCET_ADDRESS_PREFIX=gio \
  -e FAUCET_GAS_PRICE=0.000001ugio \
  gotabit-faucet  \
  start "http://localhost:26657"
```

### Using the faucet

Now that the faucet has been started up, you can send credit requests to it.
This can be done with a simple http POST request. These commands assume the
faucet is running locally, be sure to change it from `localhost` if your
situation is different.

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"denom":"ugio","address":"ugio1yre6ac7qfgyfgvh58ph0rgw627rhw766y430qq"}' \
  http://localhost:8000/credit
```

### Checking the faucets status

The faucet provides a simple status check in the form of an http GET request. As
above, make sure to adjust the URL as necessary.

```
curl http://localhost:8000/status
```

## License

This is a fork from [cosmjs faucet](https://github.com/cosmos/cosmjs/tree/main/packages/faucet)

This software is licensed under the Apache 2.0 license. 

© 2022 GotaBit Limited
