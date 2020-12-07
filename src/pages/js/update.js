const { desktopCapturer } = require('electron');

const video = document.querySelector('#move');
const video2 = document.querySelector('#video');
const startBtn = document.querySelector('.start');
const pauseBtn = document.querySelector('.pause');
const stopBtn = document.querySelector('.stop');


let chunks = [];
let sourceBuffer = null;
let mediaSource = new MediaSource();


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
          // }
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
	stopBtn.onclick = ()=>{
		recorder.stop();
		// playVideo();
	}
	recorder.ondataavailable = event =>{
		chunks.push(event.data, event.data.size);
		let s = new Blob([event.data, '{"post": "hello"}']);
		console.log(s);
	}
	recorder.onerror = e =>{
		console.log(e);
	}
}



function playVideo(){
	video2.src = URL.createObjectURL(mediaSource);
	mediaSource.addEventListener('sourceopen', sourceopen);
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