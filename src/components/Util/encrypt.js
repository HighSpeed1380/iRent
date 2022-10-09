var CryptoJS = require("crypto-js");

const KEY = 'nQw7y6QejwGFh/SNrul20Q==';

export const decrypt = (text) => {
    // Separate IV and ciphertext
    var iv = text.substring(0, 32);
    var ciphertext = text.substring(32);

    var bytes  = CryptoJS.AES.decrypt(
        {ciphertext: CryptoJS.enc.Hex.parse(ciphertext)}, 
        CryptoJS.enc.Base64.parse(KEY), 
        {iv: CryptoJS.enc.Hex.parse(iv)});  // pass IV
    
    return bytes.toString(CryptoJS.enc.Utf8); // or Hex as in the posted code
}