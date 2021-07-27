x_to_time_emotions = []
x_to_time_volume = []

function argmax (dictionary) {
    max_arg = -1;
    key_arg = -1; 
    for (var key in dictionary) {
        if (dictionary[key] > max_arg) {
            max_arg = dictionary[key];
            key_arg = key;
        }
    }
    return key_arg;
}

function line (ctx, x1, y1, x2, y2, lineWidth=3, strokeStyle="black") {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle
    ctx.stroke();
    ctx.closePath();
}

function click_emotion (canvas, event, anaysis_div) {
    let rect = canvas.getBoundingClientRect();
    let x = (event.clientX - rect.left) * (1280 / canvas.offsetWidth);
    let key_dictionary = Object.keys(x_to_time_emotions) // this is where we hold the x-coord. 
    for (var i = 0; i < key_dictionary.length - 1; i++) {
        if (key_dictionary[i] < x && x <= key_dictionary[i+1]) {
            var elements = anaysis_div.getElementsByClassName("vidAnalysis")   
            for (var j = 0; j < elements.length; j++) {
                elements[j].currentTime = x_to_time_emotions[key_dictionary[i]];
            }
            break
        }
    }
}

function click_volume (canvas, event, analysisDiv) {
    let rect = canvas.getBoundingClientRect();
    let x = (event.clientX - rect.left) * (1280 / canvas.offsetWidth);
    var elements = analysisDiv.getElementsByClassName("vidAnalysis")   
    for (var j = 0; j < elements.length; j++) {
        elements[j].currentTime = x / 1280 * vid_duration[j];
    }
}



function showAnalysis (document, video_srcs, volume, emotions, names) {
    let key_text = ""
  
    // initalize analysis div 
    const analysis_div = document.createElement("div");
    analysis_div.className = "analysisDiv";
    analysis_div.style.width = "70%";
    analysis_div.style.height = "100%";
    analysis_div.style.position = "absolute";
    analysis_div.style.top = "300px";
  
    // *************************************************************************
    // ********************************* Video *********************************
    // *************************************************************************
    for (var links in video_srcs) {
      var vid = document.createElement("video");  
      vid.src = video_srcs[links];
      vid.id = video_srcs[links];
      vid.className = "vidAnalysis"
      vid.style.width = "75%"; 
      vid.style.height = "60%";
      vid.controls = true;
      vid.style.position = "relative";
      vid.style.left = "50%";
      vid.style.transform = "translateX(-50%)";
      analysis_div.appendChild(vid)
    }
    analysis_div.appendChild(document.createElement("br"))
    analysis_div.appendChild(document.createElement("br"))
  
    // *************************************************************************
    // ******************************* GRAPH VOLUME ****************************
    // *************************************************************************
    let graph = document.createElement("div")
    graph.style.width = 100+ "%"
    graph.style.height = 50 + "%"
    graph.style.backgroundColor = "gray"
    graph.style.fontSize = "25px";
    graph.style.borderRadius = "10px";
    graph.style.position = "relative"; 
    var text = document.createElement("p")
    text.innerHTML = "Volume"
    text.style.position = "absolute";
    text.style.margin = "0px";
    text.style.left = "10px" 
    text.style.top = "10px"
    text.style.fontSize = "25px"
    text.style.zIndex = "1"
    graph.appendChild(text)
    // initialize canvas inside of graph
    const canvas = document.createElement("canvas")
    canvas.style.width = "96%";
    canvas.style.height = "90%";
    canvas.style.position = "absolute";
    canvas.style.left = "15px"
    canvas.style.bottom = "5px"
    canvas.style.backgroundColor = "gray"
    canvas.style.fontSize = "20px";
    canvas.height = "720";
    canvas.width = "1280";
    const ctx = canvas.getContext("2d")

    // mouse
    canvas.addEventListener("mousedown", function(e) {
        click_volume(canvas, e, analysis_div);
    });
  
    for (var person in volume) {
      const random_color = "hsl(" + Math.random() * 360 + ", 100%, 50%)"
      key_text += "<div style='background-color: " + random_color + "; color: white; padding: 10px;'>" + person + "</div>"
      let max = 1;
      let list_of_elements = 0
      for (let i = 0; i < Object.keys(volume[person]).length; i++) {
        list_of_elements += 1;
      }
      // draw the graph
      ctx.beginPath();
      ctx.moveTo(0, (canvas.height)-10)
  
      let i = 0
      for (var element in volume[person]) {
        let x = (i / (list_of_elements-1)) * (canvas.width);
        let y = (volume[person][element] / max) * ((canvas.height)-10);
        ctx.lineTo(x, (canvas.height-10) - y)
        i += 1;
      }
      ctx.lineWidth = 5
      ctx.strokeStyle = random_color
      ctx.stroke();
      ctx.closePath();
    }
    graph.appendChild(canvas)
    // show key
    let key = document.createElement("div")
    key.innerHTML = key_text
    key.style.width = "20%"
    key.style.height = "fit-content"
    key.style.borderBottom = "5px solid black"
    key.style.fontSize = "15px"
    key.style.position = "absolute"
    key.style.right = "15px"
    key.style.top = "15px"  
  
    graph.appendChild(key)
    analysis_div.appendChild(graph)
    analysis_div.appendChild(document.createElement("br"))
    analysis_div.appendChild(document.createElement("br"))
  
    // *************************************************************************
    // ******************************* GRAPH EMOTIONS **************************
    // *************************************************************************
    
    let graphEmo = document.createElement("div")
    graphEmo.style.width = 100+ "%"
    graphEmo.style.height = 50 + "%"
    graphEmo.style.backgroundColor = "gray"
    graphEmo.style.fontSize = "25px";
    graphEmo.style.borderRadius = "10px";
    graphEmo.style.position = "relative"; 
    var text = document.createElement("p")
    text.innerHTML = "Emotions"
    text.style.position = "absolute";
    text.style.margin = "0px";
    text.style.left = "10px" 
    text.style.top = "10px"
    text.style.fontSize = "25px"
    text.style.zIndex = "1"
    graphEmo.appendChild(text)
    // initialize canvas inside of graph
    const canvasEmo = document.createElement("canvas")
    canvasEmo.style.width = "96%";
    canvasEmo.style.height = "90%";
    canvasEmo.style.position = "absolute";
    canvasEmo.style.left = "0px"
    canvasEmo.style.bottom = "5px"
    canvasEmo.style.backgroundColor = "gray"
    canvasEmo.style.fontSize = "20px";
    canvasEmo.height = "720";
    canvasEmo.width = "1280";
    let ctxEmo = canvasEmo.getContext("2d")
    key_text = ""
    // setup labels

    ctxEmo.font = "25px serif";
    ctxEmo.fillText("Angry", 10, 0.9 * (canvasEmo.height - 10) - 5, 40);
    line(ctxEmo, 0, 0.9 * (canvasEmo.height - 10), 70, 0.9 * (canvasEmo.height - 10))
    ctxEmo.fillText("Disgusted", 10, 0.8 * (canvasEmo.height - 10) - 5, 50);
    line(ctxEmo, 0, 0.8 * (canvasEmo.height - 10), 70, 0.8 * (canvasEmo.height - 10))
    ctxEmo.fillText("Fearful", 10, 0.7 * (canvasEmo.height - 10) - 5, 45);
    line(ctxEmo, 0, 0.7 * (canvasEmo.height - 10), 70, 0.7 * (canvasEmo.height - 10))
    ctxEmo.fillText("Sad", 10, 0.6 * (canvasEmo.height - 10) - 5, 30);
    line(ctxEmo, 0, 0.6 * (canvasEmo.height - 10), 70, 0.6 * (canvasEmo.height - 10))
    ctxEmo.fillText("Neutral", 10, 0.5 * (canvasEmo.height - 10) - 5, 45);
    line(ctxEmo, 0, 0.5 * (canvasEmo.height - 10), 70, 0.5 * (canvasEmo.height - 10))
    ctxEmo.fillText("Happy", 10, 0.4 * (canvasEmo.height - 10) - 5, 40);
    line(ctxEmo, 0, 0.4 * (canvasEmo.height - 10), 70, 0.4 * (canvasEmo.height - 10))
    ctxEmo.fillText("Surprised", 10, 0.3 * (canvasEmo.height - 10) - 5, 50);
    line(ctxEmo, 0, 0.3 * (canvasEmo.height - 10), 70, 0.3 * (canvasEmo.height - 10))

    for (var person in emotions) {
      const random_color = "hsl(" + Math.random() * 360 + ", 100%, 50%)"
      key_text += "<div style='background-color: " + random_color + "; color: white; padding: 10px;'>" + person + "</div>"
      let max_x = Object.keys(emotions[person])
      max_x = max_x[max_x.length-1]
      // draw the graph
      ctxEmo.beginPath();
      let i = 0
      for (var element in emotions[person]) {
        let x = (element / max_x) * ((canvasEmo.width)-10);
        let y = 0;
        if (emotions[person][element] == "angry") {
            y = 0.1 * (canvasEmo.height - 10);
        } else if (emotions[person][element] == "disgusted") {
            y = 0.2 * (canvasEmo.height - 10);
        } else if (emotions[person][element] == "fearful") {
            y = 0.3 * (canvasEmo.height - 10);
        } else if (emotions[person][element] == "sad") {
            y = 0.4 * (canvasEmo.height - 10);
        } else if (emotions[person][element] == "neutral") {
            y = 0.5 * (canvasEmo.height - 10);
        } else if (emotions[person][element] == "happy") {
            y = 0.6 * (canvasEmo.height - 10);
        } else if (emotions[person][element] == "surprised") {
            y = 0.7 * (canvasEmo.height - 10);
        }
        x_to_time_emotions[x] = element
        if (i == 0) {
            ctxEmo.moveTo(x+10, (canvasEmo.height-10) - y)
        } else {
            ctxEmo.lineTo(x+10, (canvasEmo.height-10) - y)
        }
        i += 1;
      }
      ctxEmo.lineWidth = 5
      ctxEmo.strokeStyle = random_color
      ctxEmo.stroke();
      ctxEmo.closePath();
    }
    graphEmo.appendChild(canvasEmo)
    // show key
    keyEmo = document.createElement("div")
    keyEmo.innerHTML = key_text
    keyEmo.style.width = "20%"
    keyEmo.style.height = "fit-content"
    keyEmo.style.borderBottom = "5px solid black"
    keyEmo.style.fontSize = "15px"
    keyEmo.style.position = "absolute"
    keyEmo.style.right = "15px"
    keyEmo.style.top = "15px"  
    graphEmo.appendChild(keyEmo)
    analysis_div.appendChild(graphEmo)
    analysis_div.appendChild(document.createElement("br"))
    analysis_div.appendChild(document.createElement("br"))
    
    // mouse
    canvasEmo.addEventListener("mousedown", function(e) {
        click_emotion(canvasEmo, e, analysis_div, names);
    });

    document.body.appendChild(analysis_div)
  
    // // fill emotion array with empty values
    // for (let i = 0; i < names.length; i++) {
    //   emotions[names[i]] = {}
    // }
  
    // // fill volume array with empty values
    // for (let i = 0; i < names.length; i++) {
    //   volume[names[i]] = {}
    // }
    // video_srcs = []
    // names = []    
    // x_to_time_emotions = []
    // x_to_time_volume = []

    
  }