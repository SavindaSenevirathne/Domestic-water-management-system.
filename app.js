/*Http server*/
var express = require("express");
var app = express();
var http = require('http').Server(app);
var path = __dirname + '/';
var io = require('socket.io')(http);
var SerialPort = require('serialport');
var prompt = require('prompt');
var bodyParser = require('body-parser');
var myip = require('quick-local-ip');
var net = require('net');
var sys = require('sys');
var exec = require('child_process').exec;
var sleep = require('sleep');

const NE = require('node-exceptions');

app.use(bodyParser.urlencoded({ extended: true })); 

var info="";
var res="";

var FLAG_1 = '0';
var FLAG_2 = '0';
var FLAG_3 = '0';
var FLAG_4 = '0';
var FLAG_5 = '0';
var FLAG_6 = '0';

var FLAG_USB = '1';

var USB  = '';
var PORT = '';
var port = '';

var IDPIN ='';
var NUMBER = '';
// function getinputs() {
//   prompt.start();
//   prompt.get(['username', 'email'], function (err, result) {
//       console.log('Command-line input received:');
//       console.log('  username: ' + result.username);
//       console.log('  email: ' + result.email);
//   });
// }

// console.log(myip.getLocalIP4());

// if (process.argv[2] == null) {
//   console.log('\nERROR : you did not enter the usb port.\n   node app.js <Arduino port> <server port>')
//   process.exit();
// };

// PORT = process.argv[2];
if (process.argv[2] == null) {
  PORT = '4000';
  console.log('\nWARNING : you did not enter the server port\n    node app.js <server port>\n.    default server port is 4000.\n\n')
}

// USB = process.argv[2];
// console.log('Arduino port          : '+USB)
// console.log('Server listening port : '+PORT)

io.on('connection', function(socket){
  console.log('User connected');
  socket.on('message', function(msg){
    console.log('message: ' + msg);

    if (msg == 'OFF') {
      // client.write(IDPIN+'/'+NUMBER+'/OFF\n');
    };
    if (msg == 'ON') {
      // client.write(IDPIN+'/'+NUMBER+'/ON\n');
    };
    if (msg == 'ON/OFF') {
      // client.write(IDPIN+'/'+NUMBER+'/ON/OFF\n');
    };
    if (msg == 'Disable') {
      // client.write(IDPIN+'/'+NUMBER+'/Disable\n');
    };

    if((FLAG_1 == '0') && (msg == '1')){
      FLAG_1 = '1';
      port.write('1');
    }else if((FLAG_1 == '1') && (msg == '1')){
      FLAG_1 = '0';
      port.write('7');
    }

    if((FLAG_2 == '0') && (msg == '2')){
      FLAG_2 = '1';
      port.write('2');
    }else if((FLAG_2 == '1') && (msg == '2')){
      FLAG_2 = '0';
      port.write('8');
    }

    if((FLAG_3 == '0') && (msg == '3')){
      FLAG_3 = '1';
      port.write('3');
    }else if((FLAG_3 == '1') && (msg == '3')){
      FLAG_3 = '0';
      port.write('9');
    }

    if((FLAG_4 == '0') && (msg == '4')){
      FLAG_4 = '1';
      port.write('4');
    }else if((FLAG_4 == '1') && (msg == '4')){
      FLAG_1 = '0';
      port.write('10');
    }

    if((FLAG_5 == '0') && (msg == '5')){
      FLAG_5 = '1';
      port.write('5');
    }else if((FLAG_5 == '1') && (msg == '5')){
      FLAG_5 = '0';
      port.write('11');
    }

    if((FLAG_6 == '0') && (msg == '6')){
      FLAG_6 = '1';
      port.write('6');
    }else if((FLAG_6 == '1') && (msg == '6')){
      FLAG_6 = '0';
      port.write('12');
    }else{
      try {
        if(msg.substring(0,3) == '/de'){
          Arduino(msg);
        }
        if(msg.substring(0,3) == 'COM'){
          Arduino(msg);
        }
      } catch (e) {
        console.log(e.status) // equals 500 
        console.log(e.name) // equals MyCustomError 
        console.log(e.message) // Something bad happened 
        console.log(e.stack) // Error stack with correct reference to filepath and linenum 
        console.log(e.toString()) // MyCustomError: Something bad happened 
      }
    }

    // console.log(msg.substring(0,3));
    
    
  });
  socket.on('number', function(msg){
    // console.log('message13: ' + msg);
    NUMBER = msg;
    console.log('Number  : '+NUMBER);
  });
  socket.on('IDPIN', function(msg){
    // console.log('message13: ' + msg);
    IDPIN = msg;
    console.log('IDPIN  : '+IDPIN);
  });


});

function Arduino(USB) {
  // console.log(USB);
  // USB = "/dev/ttyACM0";
  // USB = USB.toString('utf8');
  port = new SerialPort(USB, {
          baudrate: 9600,
          bufferSize: 1 ,
          rtscts: true ,
        });

  port.on('data', function (data) {
    var data_R = data.toString('utf8');
    if (data_R == 'D' | data_R == 'A'){
      io.emit('data', res);
      // console.log(res);
      id = res.substr(0, 4);
      if (id == "DO 6") {
        state = parseInt(res.substr(6,6),10);
        // console.log(state);
        if (state == "1") {
          console.log("SHUTDOWN");
          sleep.sleep(120);
          child = exec("poweroff", function (error, stdout, stderr) {
            sys.print('stdout: ' + stdout);
            sys.print('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
            }
          });
        };
      };
      res = '';
    }
    res = res.concat(data_R);
    // console.log(res);
  });
}

// Arduino();
/*Create http server*/
app.get('/', function(req, res){
  // console.log(res)
  io.emit('data', 'res');
  res.sendFile(__dirname + '/index.html');
});

http.listen(PORT, function(){
  console.log('--------------------------------------------------------------');
  console.log('-------------------------Loading Server-----------------------');
  console.log('--------------------------------------------------------------\n');
  console.log('Server IP : '+myip.getLocalIP4()+'  Port : '+PORT);

});

// var client = new net.Socket();
// client.connect(26000, '127.0.0.1', function() {
//   console.log('Connected');
//   // client.write('Hello, server! Love, Client.\n');
// });

// setTimeout(main, 10000);