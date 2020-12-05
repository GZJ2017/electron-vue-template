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
	let recorder = new MediaRecorder(stream);
	startBtn.onclick = ()=>{
		recorder.start(1000);
	}
	stopBtn.onclick = ()=>{
		recorder.stop();
		playVideo();
	}
	recorder.ondataavailable = event =>{
		chunks.push(event.data);
		event.data.arrayBuffer().then(res=>console.log(res));
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
    // var mediaSource = e.target;
    sourceBuffer = mediaSource.addSourceBuffer(mime);
    console.log(sourceBuffer);
	for(let i = 0; i<chunks.length; i++){
		await new Promise((resolve, reject)=>{
	    	setTimeout(()=>{
		    	sourceBuffer.appendBuffer(chunks[i]);
		    	// chunks[i].arrayBuffer().then(res=>{
		    	// 	console.log(11111)
		    	// 	resolve();
		    	// })
	    	}, 1500)
		})
	}
}