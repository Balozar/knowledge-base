{
"title"       : "Import a V2 JSON file / private key?",
"sort"        : "14",
"category"    : "Importing / Exporting from MEW",
"description" : "Importing / Exporting from MEW"
}

---%
These random V2 JSON files always make things complex. We apologies in advance.

You need to convert it to the standard V3 ("Keystore" / "UTC") file. The easiest way is using geth.

[Download the appropriate version of the geth based on your operating system.](https://github.com/ethereum/go-ethereum/releases)

Once you download it, extract the zip. Also copy your V2 JSON file into the same folder.

_(Really explicit instructions for PC and Mac are here: [https://ethereum.stackexchange.com/questions/465/how-to-import-a-plain-private-key-into-geth-or-mist](https://ethereum.stackexchange.com/questions/465/how-to-import-a-plain-private-key-into-geth-or-mist))_

Now you have to open a command line window and type in the following command:

**`geth account import nameofyourwalletfile`**

This will import your file into geth and convert it to the latest (V3) keystore file. Now you need to go find it in one of the following locations:

*   Mac: `~/Library/Ethereum`
*   Linux: `~/.ethereum`
*   Windows: `%APPDATA%\Ethereum`

Copy that file, and select it on https://www.myetherwallet.com and you are good to go!

Moving foward, use this file. Keep a backup of it, and the old file just in case.
