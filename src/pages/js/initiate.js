/*
 * @Author: your name
 * @Date: 2020-11-26 19:38:27
 * @LastEditTime: 2020-12-08 00:25:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\src\pages\js\update.js
 */
const { desktopCapturer } = require('electron');

const video = document.querySelector('#move');
const startBtn = document.querySelector('.start');
const pauseBtn = document.querySelector('.pause');
const stopBtn = document.querySelector('.stop');

// 连接远程服务器
var client = new WebSocket('ws://192.168.30.1:8088');

	// 当客户端连接成功之后就会触发open事件
client.onopen = ()=>{
    console.log("客户端连接成功");
}

client.onmessage = function(ev){
  console.log('my:', ev);
}

desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
  for (const source of sources) {
    if (source.name === "Entire Screen") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          // {
          // 	mandatory: {
          // 		chromeMediaSource: 'desktop'
          // 	}
          // },
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
              maxWidth: window.screen.width,
		      maxHeight: window.screen.height,
              minHeight: 500,
              maxHeight: 500
            }
          }
        })
        handleStream(stream)
      } catch (e) {
        handleError(e)
      }
      return
    }
  }
})

function handleStream (stream) {
  video.srcObject = stream
  video.onloadedmetadata = (e) => video.play();
  createRecorder(stream);
}

function handleError (e) {
  console.log(e)
}



function createRecorder(stream){
	let recorder = new MediaRecorder(stream, {
		mimeType: 'video/webm;codecs=vp8'
	});
	startBtn.onclick = ()=>{
		recorder.start(1000);
  }
  pauseBtn.onclick = ()=>{
    
    if(recorder.state === 'paused'){
      recorder.resume();
    } 
    else if(recorder.state === 'recording'){
      recorder.pause();
    }
    console.log(recorder)
  }
	stopBtn.onclick = ()=>{
		recorder.stop();
		// playVideo();
	}
	recorder.ondataavailable = event =>{
    client.send(event.data);
	}
	recorder.onerror = e =>{
		console.log(e);
  }
  recorder.onresume = e=>{
    console.log("恢复录制了");
  }
  recorder.onpause = e=>{
    console.log("暂停录制")
  }
  recorder.onstart = e=>{
    console.log("开始录制")
  }
}



async function sourceopen(e){
	URL.revokeObjectURL(video2.src);
    var mime = 'video/webm;codecs=vp8';
    sourceBuffer = mediaSource.addSourceBuffer(mime);
	for(let i = 0; i<chunks.length; i++){
		await new Promise((resolve, reject)=>{
	    	setTimeout(()=>{
	    		if(i == 1 || i == 2){
	    			return resolve();
	    		}
		    	chunks[i].arrayBuffer().then(res=>{
		    	sourceBuffer.appendBuffer(res);
		    		console.log('第'+i+ '段')
		    		resolve();
		    	})
	    	}, 500)
		})
	}
}
