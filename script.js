// const video = document.getElementById('video')

var video_srcs = [] 
var names = []
var emotions = {}
var volume = {}
var list_of_emotions = ["angry", "disgusted", "fearful", "happy", "neutral", "sad", "surprised"]
var vid_duration = []

function addPersonClick() {
  const title = document.getElementById("Title");
  const AddPerson = document.getElementById("Add");
  title.style.opacity = 0.5;
  AddPerson.style.opacity = 0.5;
  const list = document.getElementsByClassName("videoDiv");
  for (let i = 0; i < list.length; i++) {
    list[i].style.opacity = 0;
  }
  const anaylzeButton = document.getElementById("Analyze");
  anaylzeButton.style.opacity = 0; // Hide analyze button
  const form = document.getElementById("AddPerson");
  form.style.opacity = 1; 
  form.style.pointerEvents = "all";
}

function submit () {
  // Check if name is not empty
  const name = document.getElementById("name").value;
  const file = document.getElementById("fileName").files[0];
  if (name.length === 0) {
    alert("Name cannot be empty");
    return;
  }
  if (file.size === 0) {
    alert("File cannot be empty");
    return;
  }
  // Check if file is an video
  const fileType = file.type;
  if (fileType !== "video/mp4" && fileType !== "video/webm") {
    alert("File must be an video");
    return;
  }

  // Focus on form and hide everything else.
  const form = document.getElementById("AddPerson");
  form.style.opacity = 0; // Hide form
  form.style.pointerEvents = "none";
  const title = document.getElementById("Title");
  const AddPerson = document.getElementById("Add");
  title.style.opacity = 1;
  AddPerson.style.opacity = 1;
  const list = document.getElementsByClassName("videoDiv");
  for (let i = 0; i < list.length; i++) {
    list[i].style.opacity = 1;
  }
  const anaylzeButton = document.getElementById("Analyze");
  anaylzeButton.style.opacity = 1; // show analyze button
  anaylzeButton.innerHTML = "Analyze!"

  // Create <div> object to display Video and name
  const div = document.createElement("div");
  const index = document.getElementsByClassName("videoDiv").length; 
  div.className = "videoDiv";
  div.style.borderRadius = "10px";
  div.style.width = "30%";
  div.style.height = "50px";
  div.innerHTML = name; 
  div.style.textAlign = "center";
  div.style.backgroundColor = "rgba(7, 230, 255, 0.8)";
  div.style.top = 220 + (100*index) + "px";
  div.style.position = "absolute";
  div.style.paddingTop = "20px";
  
  // Change position of Anaylze button 
  anaylzeButton.style.top = (220 + (100*(index+1))) + "px";
  anaylzeButton.style.pointerEvents = "all";

  // add file URL to video_srcs and name to names
  video_srcs.push(URL.createObjectURL(file));
  names.push(name)

  // append <div> to body
  document.body.appendChild(div);
}

function root_mean_square(ary) {
  var sum_of_squares = ary.reduce(function(s,x) {return (s + x*x)}, 0);
  return Math.sqrt(sum_of_squares / ary.length);
}

function record_buffer (audioBuffer, index, names, volume) {
  const rawData = audioBuffer.getChannelData(0);
  // get video duration
  const duration = audioBuffer.duration;
  vid_duration.push(duration);
  // for every second, get audio
  // Thanks https://dsp.stackexchange.com/questions/2951/loudness-of-pcm-stream/2953#2953
  let samples = []
  for (let i = 0; i < rawData.length; i++) {
    samples.push(rawData[i]);

    const second = Math.floor(i / (audioBuffer.sampleRate / 3));
    if (second % 1 === 0) {
      volume[names[index]][second] = root_mean_square(samples); 
      samples = []
    }
  }
}

function emotionDetection (i) {
  const anaylzeButton = document.getElementById("Analyze");
  const video = document.createElement("video");
  video.src = video_srcs[i];
  video.setAttribute("height" , 0.5 * document.body.clientHeight);
  video.setAttribute("width" , 0.5 * document.body.clientWidth);
  video.style.position = "absolute";
  video.style.top = "300px";
  video.autoplay = true;
  document.body.append(video);
  canvas = null;
  interval = null;
  video.addEventListener("play", () => {
    // expression detection
    anaylzeButton.innerHTML="Analyzing Video " + (i+1) + " of " + video_srcs.length + "..." 
    canvas = faceapi.createCanvasFromMedia(video)
    canvas.style.position = "absolute";
    canvas.style.top = "300px"; 
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize)
    interval = setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      
      // add emotion to emotions array
      if (resizedDetections.length != 0 && names.length != 0) {
        array = resizedDetections[0]["expressions"]
        person_name = names[i]
        emotion_highest = ""
        emotion_value_highest = 0
        for (let i = 0; i < 7; i++) {
          if (array[list_of_emotions[i]] > emotion_value_highest) {
            emotion_highest = list_of_emotions[i]
            emotion_value_highest = array[list_of_emotions[i]]
          }
        }
        emotions[person_name][video.currentTime] = emotion_highest
      }  
    }, 100)
  })
  // delete video once done
  video.addEventListener("ended", () => {
    //remove video elements....
    document.body.removeChild(video);
    document.body.removeChild(canvas);
    clearInterval(interval);

    // setup audio anaylzer 
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const audio = (url, names, volume) => {
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => record_buffer(audioBuffer, i, names, volume))
        .then(function() {
          // go to the next video, if any. Else, show the Anaylsis.
          if (i == video_srcs.length - 1) {
            anaylzeButton.innerHTML="Analysis Done"
            showAnalysis(document, video_srcs, volume, emotions, names) 
          } else {
            emotionDetection(i+1);
          }   
        })
    };
    anaylzeButton.innerHTML="Analyzing Audio..."
    audio(video_srcs[i], names, volume)
  })
}

function analyze () {
  const anaylzeButton = document.getElementById("Analyze");
  // set elements to anayzling mode
  anaylzeButton.innerHTML="Loading models..."
  anaylzeButton.style.top = "220px";
  const list = document.getElementsByClassName("videoDiv");
  const length = list.length;
  for (let i = 0; i < length; i++) {
    // delete <div> object
    document.body.removeChild(list[0]);
  } 

  // fill emotion array with empty values
  for (let i = 0; i < names.length; i++) {
    emotions[names[i]] = {}
  }

  // fill voluem array with empty values
  for (let i = 0; i < names.length; i++) {
    volume[names[i]] = {}
  }
  
  // start detection
  Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]).then(() => {
    emotionDetection(0);
  })
}
