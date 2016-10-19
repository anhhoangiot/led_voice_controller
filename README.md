# Raspberry Pi - Getting Started

Bài viết này sẽ hướng dẫn cụ thể từng bước để tạo ra một hệ thống điều khiển led bằng giọng nói bằng Raspberry Pi. 
Mời mọi người xem qua demo sau để hình dung qua hệ thống này sẽ làm được những gì.

[![IMAGE ALT TEXT HERE](http://img.youtube.com/vi/01L53YswXTA/0.jpg)](http://www.youtube.com/watch?v=01L53YswXTA)

![alt image](https://ih0.redbubble.net/image.262610461.9685/raf,750x1000,075,t,101010:01c5ca27c6.jpg)

Trông có vẻ ngầu nhưng thật ra hệ thống này cực kỳ đơn giản, chỉ có chưa tới 200 dòng code. Ta có thể chia hệ thống thành các bước như sau để implement từng bước một:
1. Điều khiển led bằng Pi.
2. Nhận diện giọng nói bằng điện thoại và send command đến Pi để điều khiển đèn.
3. Bật đèn và cập nhật tín hiệu trên dashboard.

## Điều khiển led bằng Pi

### Cài đặt Raspberry Pi

#### Yêu cầu:

1. Raspberry Pi (bản nào cũng có thể)
![pi 3](http://k2.arduino.vn/img/2016/07/16/0/2689_88211213-1468654906-0-pi-3.jpg)
2. Micro sd card (thẻ 32gb giờ cũng khá rẻ, khoảng 250k-400k)
![sd card](https://www.sandisk.com/content/dam/sandisk-main/en_us/portal-assets/product-images/retail-products/microSD_SDHC_Class4_32GB-retina.png.thumb.319.319.png)
3. Đầu đọc thẻ micro sd (mua ở cửa hàng đồ điện tử giá từ 10k-20k hoặc cũng có thể đặt trên lazada cũng khá rẻ)
![reader](http://www.surfaceforums.net/attachments/kingston-8gb-microsd-mobility-kit-jpg.52/)

#### Cài đặt Raspberry Pi

1. Vì bài viết hướng đến đối tượng lần đầu dùng Pi nên mình sẽ dùng NOOBS - New Out Of the Box Software. Bạn có thể download NOOBS từ link [này](https://www.raspberrypi.org/downloads/noobs/), dung lượng khoảng 1.1 GB.

2. Trong lúc đợi download thì chúng ta sẽ chuẩn bị thẻ SD để cài đặt. Lưu ý nếu bạn đang có 1 thẻ sd hoàn toàn mới thì bạn có thể skip bước chuẩn bị này. Nếu không, hãy vào link [này](https://www.raspberrypi.org/learning/noobs-install/windows/) và thực hiện đúng các bước trong hướng dẫn.

3. Bây giờ thì bạn đã download xong NOOBS, chúng ta sẽ unzip file vừa down về được và copy toàn bộ các file đã giải nén vào thể sd. Đến đây bạn đã hoàn thành 2/3 chặng đường cài đặt Pi rồi.

4. Sau khi các file đã copy vào thẻ sd, ta sẽ cắm thẻ sd vào Pi, kết nối với màn hình, bàn phím, chuột và cắm điện.

5. Sau khi pi khởi động và boot từ thẻ sd, chọn Raspbian ở màn hình install và click install
![install](https://www.raspberrypi.org/learning/noobs-install/images/install.png)
6. Sẽ mất khoảng 15 phút để hoàn thành việc cài đặt và Pi của bạn sẽ sẵn sàng để sử dụng.

### Lập trình thành phần điều khiển led trên Pi và gửi kết quả lên dashboard

Lưu ý phần này sẽ sử dụng ngôn ngữ python, nếu bạn chưa học hoặc không quen thuộc lắm với python thi cũng đừng lo vì phần code khá dễ hiểu. Ngoài ra bạn cũng có thể đọc [learnpythonthehardway](https://learnpythonthehardway.org/book/) để biết các kiến thức lập trình với python.

Import các thư viện cần thiết.
``` python
import sys
from thread import *
import socket
import urllib2
import json
import RPi.GPIO
```
Khởi tạo 1 socket để nhận lệnh điều khiển đèn.
``` python
HOST = ''
PORT = 8888 

ledControlSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

print 'Socket created!'

try:
    ledControlSocket.bind((HOST, PORT))
except socket.error as message:
    print 'Bind failed. Error Code : ' + str(message[0]) + ' Message ' + message[1]
    
print 'Socket bind complete!'

ledControlSocket.listen(10)

print 'Socket now listening!'

GPIO.setmode(GPIO.BCM)
GPIO.setwarning(False)
// Set điều khiển led ở pin 18
GPIO.setup(18, GPIO.OUT)
print 'Setup led on pin 18'

while True:
    connection, address = ledControlSocket.accept()
    print 'Connected with ' + address[0] + ':' + str(address[1])
    
start_new_thread(receiveCommandThread, (connection,))
ledControlSocket.close()
```
Tạo một hàm để nhận các lệnh được truyền qua socket:
``` python
def receiveCommandThread(connection):
    while True:
        try:
            command = connection.recv(1024)
            if not command:
                break;
            print 'Received command: ' + command
            processReceivedCommand(command);
        except Exception, e:
            print 'Connection error'
            break;
    connection.close()
```
Tạo hàm để xử lý command đã nhận được:
```python
def processReceivedCommand(command):
    if command:
        if command == '1':
            print 'Turning light on'
            GPIO.output(18, GPIO.HIGH)
        else:
            print 'Turning light off'
            GPIO.output(18, GPIO.LOW)
```
File cuối cùng sẽ như sau:
```python
import sys
from thread import *
import socket
import urllib2
import json
import RPi.GPIO as GPIO

HOST = ''
PORT = 8888 

def receiveCommandThread(connection):
    while True:
        try:
            command = connection.recv(1024)
            if not command:
                break;
            print 'Received command: ' + command
            processReceivedCommand(command);
        except Exception, e:
            print 'Connection error'
            break;
    connection.close()
    
def processReceivedCommand(command):
    if command:
        if command == '1':
            print 'Turning light on'
            GPIO.output(18, GPIO.HIGH)
        else:
            print 'Turning light off'
            GPIO.output(18, GPIO.LOW)

ledControlSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

print 'Socket created!'

try:
    ledControlSocket.bind((HOST, PORT))
except socket.error as message:
    print 'Bind failed. Error Code : ' + str(message[0]) + ' Message ' + message[1]
    
print 'Socket bind complete!'

ledControlSocket.listen(10)

print 'Socket now listening!'

GPIO.setmode(GPIO.BCM)
GPIO.setwarning(False)
// Set điều khiển led ở pin 18
GPIO.setup(18, GPIO.OUT)
print 'Setup led on pin 18'

while True:
    connection, address = ledControlSocket.accept()
    print 'Connected with ' + address[0] + ':' + str(address[1])
    
start_new_thread(receiveCommandThread, (connection,))
ledControlSocket.close()
```
Save file thành led_controller.py và copy vào Pi qua cổng usb.

### Setup mạch và led

![board](https://projects.drogon.net/wp-content/uploads/2012/06/1led_bb1.jpg)

### Tạo web app sử dụng speech to text api của Google

#### Yêu cầu:
1. Máy bạn phải cài nodejs. Nodejs có thể down về từ [đây](https://nodejs.org/en/download/)

#### Cấu trúc thư mục:
```
|--index.html
|--bundles
|  |--encoder.js
|  |--libflac.js
|  |--speech.google.js
|  |--style.js
|  |--style.css
|--server.js
|--package.json
|--GOOGLE_APPLICATION_CREDENTIALS
|--tmp
```

#### Tạo web application nhận diện giọng nói và truyền command đến Pi
1. Để có thể sử dụng được Google Speech Api, bạn phải đăng ký tài khoản Google Cloud tại [đây](https://cloud.google.com/speech/). 
3. Sau khi đăng ký, tạo một project mới đặt tên là SpeechControl.
4. Tiếp theo, vào [link này](https://console.cloud.google.com/apis/credentials), trong create credentials chọn service account key. Sau khi tạo thành công, trình duyệt sẽ tự download file credentials này về. Bạn hãy lưu vào thư mục project vừa tạo.
5. Tiếp theo chúng ta sẽ setup depedencies cho project. Mở file package.json và gõ vào những dòng sau:
```json
{
  "name": "speechjs",
  "version": "1.0.0",
  "description": "HTTP server use Google speech api to control led",
  "main": "server.js",
  "dependencies": {
    "async": "^1.5.2",
    "body-parser": "^1.15.2",
    "express": "^4.14.0",
    "google-auto-auth": "^0.2.4",
    "google-proto-files": "^0.3.0",
    "googleapis": "^12.0.0",
    "grpc": "^0.15.0"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "speech"
  ],
  "author": "",
  "license": "MIT"
}
```
6.Tiếp theo, bạn mở terminal hoặc command line và gõ lệnh sau:
```
npm íntall
```
7.Mở file server.js, tại đây ta sẽ tạo một server để gửi file âm thanh đến service của google, xử lý kết quả nhận được và gửi command đến Pi để điều khiển led.
```javascript
var path = require('path');
var net = require('net');
var socket = new net.Socket();
var google = require('googleapis');
var async = require('async');
var fs = require('fs');
var speech = google.speech('v1beta1').speech;

var isConnectionOpen = false;
var LIGHT_CONTROLLER = {
    TURN_ON: '1',
    TURN_OFF: '0'
};

// Thiết lập credentials cho google api
// Lưu ý rằng thay 'Voicecontrol-10407cđf0cd.json' bằng tên file credentials bạn tải về ở bước thứ 4
process.env['GOOGLE_APPLICATION_CREDENTIALS'] = 'Voice control-10407cddf0cd.json';
// Setup static resources
app.use('/bundles', express.static(path.join(__dirname + '/bundles')));

// Thiết lập default route đến file index.htm
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.htm'));
});

// Thiết lập route để xử lý file giọng gửi đến server
app.post('/', function(request, response) {
    var buffer = Buffer.alloc(0);
    request.on('readable', function() {
        var chunk = request.read();
        if (chunk != null) {
            buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
        }
    });
    request.on('end', function() {
        convertSpeechToText(buffer, processSpeech);
    });
    response.send('POST message received');
});
// Hàm này sẽ thực hiện authenticate các request đến google api bằng file credential
function authenticateWithGoogleAPI(callback) {
    google.auth.getApplicationDefault(function(error, authsocket) {
        if (error) {
            return callback(error);
        }
        if (authsocket.createScopedRequired && authsocket.createScopedRequired()) {
            authsocket = authsocket.createScoped([
                'https://www.googleapis.com/auth/cloud-platform'
            ]);
        }

        return callback(null, authsocket);
    });
}

function prepareRequest(buffer, callback) {
    console.log('Got audio file!');
    // Lưu ý rằng chúng ta phải convert buffer về thành string base64 trước khi gửi lên google service
    var encoded = buffer.toString('base64');
    var payload = {
        config: {
            encoding: 'FLAC',
            sampleRate: 44100,
            languageCode: 'vi-VN'
        },
        audio: {
            content: encoded
        }
    };
    return callback(null, payload);
}

function convertSpeechToText(buffer, callback) {
    var requestPayload;
    async.waterfall([
        function(callback) {
            prepareRequest(buffer, callback);
        },
        function(payload, callback) {
            requestPayload = payload;
            authenticateWithGoogleAPI(callback);
        },
        function sendRequest(authsocket, callback) {
            console.log('Analyzing speech...');
            speech.syncrecognize({
                auth: authsocket,
                resource: requestPayload
            }, function(error, result) {
                if (error) {
                    return callback(error);
                }
                if (result.results[0] &&
                    result.results[0].alternatives[0]) {
                    var text = result.results[0].alternatives[0].transcript;
                    console.log('Received speech-to-text: ', text);
                    callback(text);
                }
            });
        }
    ], callback);
}

// Hàm này sẽ xử lý text trả về bởi google và gửi đến Pi
function processSpeech(receivedSpeech) {
    if (receivedSpeech.toLowerCase().indexOf('bật đèn') > -1) {
        console.log('Turning light on...');
        writeToSocket(LIGHT_CONTROLLER.TURN_ON);
    } else if (receivedSpeech.toLowerCase().indexOf('tắt đèn') > -1) {
        console.log('Turning light off...');
        writeToSocket(LIGHT_CONTROLLER.TURN_OFF);
    }
}

function writeToSocket(signal) {
    if (isConnectionOpen) {
        socket.write(signal);
    } else {
        console.log('Connection is not open! Cannot send signal');
    }
}
// Start app server
app.listen(8080);
console.log('Server is running at port: 8080');

socket.connect(8888, '127.0.0.1', function() {
    console.log('Connection established');
    isConnectionOpen = true;
});

socket.on('error', function(error) {
    console.log('Error while connecting to pi', error.code);
    isConnectionOpen = false;
    socket.setTimeout(2000, function() {
        console.log('Reconnecting...');
        socket.connect(8888, '127.0.0.1');
    });
});

socket.on('data', function(data) {
    isConnectionOpen = true;
    console.log('Pi sent: ' + data);
})

socket.on('close', function() {
    console.log('Connection closed');
    isConnectionOpen = false;
})

```
8.Tiếp theo là setup giao diện cho trang web. Để thêm phần sinh động thì mình sẽ sử dụng svg và javascript để tạo animation cho giao diện. Tuy nhiên để bài viết được tập trung vào phần chính bạn sẽ không phải edit lại các file này.
9.Mở file speech.google.js và sửa lại nội dung như sau:
```javascript
var recording = false;
var stream = null;
var encoder = null;
var recorder = null;
var audioInput = null;

var defaultConfig = {
    samplerate: 44100,
    compression: 5,
    outputFile: 'audio.flac',
    bufferSize: 4096
};

var flacdata = {
    bps: 16,
    channels: 1,
    compression: 5
};

function startRecording() {
    if (!recording) {
        console.log('Start recording...')
        // Google service chỉ nhận file âm thanh định dạng raw hoặc flac
        // vì vậy ta sẽ phải encode lại âm thanh thu được về định dạng flac.
        encoder = new Worker('bundles/encoder.js');
        encoder.postMessage({
            cmd: 'init',
            config: {
                samplerate: defaultConfig.samplerate,
                bps: flacdata.bps,
                channels: flacdata.channels,
                compression: defaultConfig.compression
            }
        });

        encoder.onmessage = function(event) {
            console.log(event);
            if (event.data.cmd === 'end') {
                $.ajax({
                    url: '/',
                    method: 'POST',
                    processData: false,
                    dataType: false,
                    data: event.data.buf
                }).done(function(response) {
                    console.log(response);
                    encoder.terminate();
                    encoder = null;
                });
            } else if (event.data.cmd === 'debug') {
                console.log(event.data);
            } else {
                console.log('Unknown event from worker: ' + event.data);
            }
        }

        var onRecordSuccess = function(localMediaStream) {
            console.log('Recording in progress...');
            recording = true;
            stream = localMediaStream;

            var AudioContext = window.AudioContext ||
                window.webkitAudioContext ||
                window.mozAudioContext ||
                window.msAudioContext;

            var context = new AudioContext();
            var sampleRate = defaultConfig.samplerate;
            audioInput = context.createMediaStreamSource(stream);

            var bufferSize = defaultConfig.bufferSize;
            if (audioInput.context.createJavaScriptNode) {
                recorder = context.createJavaScriptNode(bufferSize, 1, 1);
            } else if (audioInput.context.createScriptProcessor) {
                recorder = context.createScriptProcessor(bufferSize, 1, 1);
            } else {
                console.log('Browser does not support!');
            }

            recorder.onaudioprocess = function(event) {
                if (!recording) {
                    return;
                }
                var leftChannel = event.inputBuffer.getChannelData(0);
                encoder.postMessage({
                    cmd: 'encode',
                    buf: leftChannel
                });
            }
            audioInput.connect(recorder);
            recorder.connect(context.destination);
        }

        var onRecordFail = function(error) {
            console.log('GetUserMedia: ', error);
        }

        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
        navigator.getUserMedia({ video: false, audio: true }, onRecordSuccess, onRecordFail);

    }
}

function stopRecording() {
    if (!recording) {
        return;
    }
    console.log('Recording done...');
    recording = false;
    encoder.postMessage({
        cmd: 'finish'
    });
    audioInput.disconnect();
    recorder.disconnect();
    audioInput = null;
    recorder = null;
}
```

11.Lưu ý rằng để app chạy được tốt bạn nên dùng firefox vì chrome từ một vài bản gần đây đã thay đổi lại getUserMedia nên có thể phần thu âm sẽ không hoạt động được.

12.Bước cuối cùng là chạy thử toàn bộ hệ thống. Bạn boot vào Pi, vào thư mục đã copy file led_controller.py và chạy dòng lệnh sau:
```
python led_controller.py
```
Ở trên máy tính, bạn gõ vào terminal hoặc cmd dòng sau:
```
node server
```
Cuối cùng thì bạn có thể truy cập vào địa chỉ của máy local port 8888 và chạy thử hệ thống vừa tao.

## Lời kết

Như vậy là bạn đã hoàn thành bài tutorial về điều khiển led bằng giọng nói thông qua Raspberry Pi. Bạn có thể đào sâu hơn bằng cách thử điều khiển các vật dụng khác thay vì led (ổ cắm chẳng hạn)