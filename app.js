// console.log("hello-World")
const invoke = require('./invoke')
const query = require('./query')
const express = require('express')
const request = require('request');
const cors = require('cors');
const fast2sms = require('fast-two-sms')
const json_data = require('./sample.json')
const data_set = require('./backennd-api')
require('dotenv').config();
app = express();
// To make or access to another origin
app.use(cors());
// request.body comes undefinend to overcome that we use tha below code
app.use(express.json())
app.use(express.urlencoded({extended:false}))
const PORT = 4000;
let data = {}
let otp =  [{ }]

const send_data = async(arr)=>{
     console.log(arr);
     let otp_ =  Math.floor(100000 + Math.random() * 900000) 
     console.log(otp_);
     otp.push({ otp: otp_, voter:arr.voter})
     let response =  await  fast2sms.sendMessage({authorization : process.env.API_KEY , message : otp_  ,  numbers : [arr.phone]} )
     console.log(response);
     return(arr)
}
app.post('/Validateuser',async(req,res)=>{
    flag = false
    json_data.forEach((arr)=>{
            if(arr.adh == req.body.Aadhar && arr.voter==req.body.Voter){   
                  arr.auth = true
                  flag = true
                  data.name = arr.name
                  data.Aadhar = arr.adh
                  data.Voter =arr.voter
                   send_data(arr).then(arr=>{res.send(arr)})
                  } 
            })

        if(flag == false){
            res.send(false)
        }
})
console.log(otp);
app.post('/otp',(req,res)=>{
    otp.forEach(arr=>{
        if(arr.voter ==req.body.voter && arr.otp == req.body.otp)
         res.send("matched")
    })
})
app.post('/castVote',(req,res)=>{
    let  key_flag = false;
    let double_vote_flag = false;
    let name = req.body.name
    let Aadhar = req.body.Aadhar;
    let key = req.body.key;
    let voter = req.body.voter;
    let candidate = req.body.candidate;
    console.log(key,voter,candidate);
    json_data.forEach((arr)=>{      
        if(arr.voter == voter && arr.key == key){
            key_flag = true;
        }})
    // checking..... fabric sdk
    data_set.data_voted.forEach(arr=>{ if(arr.key==key) double_vote_flag = true;  })
    if(key_flag == true && double_vote_flag==false){
            //  query.main('Tallyvote',key).then(res=>{
                 
            //  })
            let voter = new data_set.Voted(key,candidate)
   
            invoke.main('castBallot',key,Aadhar,req.body.voter,true,name,candidate);
            console.log(voter);
            console.log("Vote successfully Added!....");
           res.send('Vote successfully Added!....')
    }
    else { 
        if(key_flag==false){ res.send("Your sceret key is Invalid")  }
        else if(key_flag==true && double_vote_flag==true){
            res.send('Double voting is not allowed')
            console.log("you have already polled your Vote ")
        }}
})
app.post('/checkmyvote',(req,res)=>{
    query.main('Tallyvote',req.body.key).then(res_data=>{
        res.send(res_data)
        console.log(res_data);
    })
})
app.get('/results',async(req,res)=>{
    
  let response = await data_set.TallyVotes()
  res.send(response)
  console.log(response)
})

app.get('/face_verification', function(req, res) {
    var options = { 
        method: 'POST', 
        uri: 'http://127.0.0.1:5000/open_me', 
        body: data, 
        json: true // Automatically stringifies the body to JSON 
    };
     request(options,function (error, response, body) {
            console.error('error:', error); // Print the error
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the data received
            res.send(body); //Display the response on the website
          });
});
app.listen(PORT, function (){ 
    console.log(`Listening on Port ${PORT}`);
});  