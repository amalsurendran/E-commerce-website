require('dotenv').config()

const Db =  () =>{
    const mongoose = require('mongoose');
    
    mongoose.set('strictQuery', false);
    mongoose.connect("mongodb+srv://amalsurendran270:mongodb1234@lensfocus.4fugcsq.mongodb.net/?retryWrites=true&w=majority");
    
}
const bcrypt = require('bcrypt')


const sessionSecret = process.env.sessionSecret



 const accountSid= "AC25205a5f6722a9a4135bd3b411db1db2";
 const authToken = "8f3ff97106e6aa9a3cc4945f06d047f1";
const securepassword = async (password) => {
    try {
        const passwoedHash = await bcrypt.hash(password, 10);
        return passwoedHash;
    } catch (error) {
        console.log(error.message);
    }
}

const key_id = process.env.keyid
const key_secret =process.env.keysecret

module.exports ={
    Db,
    sessionSecret,
    accountSid,
    authToken,
    securepassword,
    key_id,
    key_secret,
   

}