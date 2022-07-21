/**
 *  @author James Muhoro Mucheru
 *  file containing helper functions
 * 
 */

// file dependencies
const crypto = require("crypto");
const User = require("./models/User");
const qr = require("qrcode");
const path = require("path");
const fs = require("fs");



// helpers conatiner
const helpers = {
    /**
     * function hashes user passwords
     * @param {String} str 
     * @returns String
     */
    hashPassword: function(str) {
        if(str.length < 1) return;
        const hashingSecret = "I love Arsenal";
        const hash = crypto.createHmac('sha256', str)
                            .update(hashingSecret)
                            .digest('hex');
        
        return hash;
    },
    /**
     * function that whether email provide by user is uniques
     * @param {String} email 
     */
    isEmailUnique: async function(email) {
        if(email.length < 1) return;
        let isEmailUnique = true;
        const users = await User.find();
        users.forEach(
            user => {
                if(user.email === email) isEmailUnique = false;
            }
        );

        return isEmailUnique;
    },
    /**
     * 
     * function that verifies login details by the user and checks whether they match
     */
    verifyCredentials: async function(email, password) {
        const user = await User.findOne({email});
        if(user && this.hashPassword(password) === user.password) return user;
        return null;
    },
    shuffleCharacters: function(str) {
        let shuffleWord = "";
        str = str.split("");

        for(let i = str.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            [str[i], str[j]] = [str[j], str[i]];
        }
        return str.join("");
    },
    generateUserCode: function(email) {
        const str = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";

        //generate code
        const code = this.shuffleCharacters(str).slice(0, 4).toUpperCase() + this.shuffleCharacters(numbers).slice(0, 2);

        return code;
    },
    generateSerialNumber: async function(code) {
        const str = "abcdefghijklmnopqrstuvwxyz"
        const numbers = "0123456789";
        
        // generate serial number
        const serialNumber = 
        code + ":" + this.shuffleCharacters(numbers).slice(0, 5) + this.shuffleCharacters(str).slice(0, 2).toLowerCase();

        return serialNumber;
    },
    matchLastHolder: function(track, lastHoder) {
        let keys = [];
        for( let key in track) {keys.push(key)};
        const key = (keys.length).toString();
        if(track[key] === lastHoder) return true;
        else return false;
    },
    /** 
     * 
     * function to generate a qrcode
     * 
     */
    generateQuikResponseCode: function(serial, email, brand) {
        if(serial.length < 1) return;
        
        const url = "http://localhost/verify?serial="+serial;
        const parentDir = path.join(__dirname, "../public/qrcodes/"+email);
        const dir = path.join(__dirname, "../public/qrcodes/"+email+"/"+brand);
        
        if(!fs.existsSync(parentDir)) fs.mkdirSync(parentDir);
        
        if(!fs.existsSync(dir)) fs.mkdirSync(dir);
        

        const qrPath = dir + "/" + serial.replace(":", "") + ".png";
        const webQrPath = "http://localhost:3000/" + "qrcodes/" + email + "/" + brand + "/" + serial.replace(":", "") + ".png"

        qr.toDataURL(url, async function(err, src) {
            if(err) console.log("an error has occured");
            const imageData = src.replace(/^data:image\/png;base64,/, "");
            

            fs.writeFile(qrPath, imageData, 'base64', function(err) {
                if(err) console.log(err);
            });
        });

        return webQrPath;
    }
} 

module.exports = helpers;