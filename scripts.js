const urls = { url: "http://127.0.0.1:5000/dubbing-video-url", file: "http://127.0.0.1:5000/dubbing-video-file", dubbings: "http://127.0.0.1:5000/dubbings" }
const btn = document.getElementById("btn-dub");
const videoArea = document.getElementById("video-area");
const videoSources = document.querySelectorAll('input[name="video-source"]');
let dubbings = [];

/*
  --------------------------------------------------------------------------------------
  Função para colocar um vídeo no servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postVideo = async (videoSource, original_language, target_language) => {
  const formData = new FormData();
  let video;
  let url;
  let options;

  formData.append('original_language', original_language);
  formData.append('target_language', target_language);

  if (videoSource.type == "file") {
    url = urls.file;
    video = videoSource.files[0];
    formData.append('file', video);

    options = {
      method: 'POST',
      body: formData
    };


  } else if (videoSource.type == "url") {
    url = urls.url;
    video = videoSource.value;
    formData.append('url', video);
    options = {
      method: 'POST',
      body: formData
    };


  } else {
    alert("Entrada de vídeo inválida.");
    return;
  }

  btn.disabled = true;
  videoArea.getAttribute("data-video-status") ? videoArea.removeAttribute("data-video-status") : null;

  let value = 0;
  let progressInterval = setInterval(() => {
    progressBar(++value, progressInterval);
  }, 5000);

  dynamicMsg("Baixando e dublando vídeo, isso pode levar alguns minutos... Por favor, aguarde.");
  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      progressInterval = null;
      btn.disabled = false;
      dynamicMsg("Video dublado com sucesso");
      cleanDynamicMsg();
      console.log("dados: " + data);
      if (data.message) {
        msg.textContent = data.message;
        return;
      }
      createVideoPlayer(data);
      videoArea.setAttribute("data-video-status", "loaded");
      getDubbings();
    })
    .catch((error) => {
      btn.disabled = false;
      console.error('Error:', error);
      dynamicMsg("Ocorreu um erro ao tentar dublar o vídeo.");
      cleanDynamicMsg();

    });
}


/*
  --------------------------------------------------------------------------------------
  Função para dublar um novo vídeo 
  --------------------------------------------------------------------------------------
*/
const sendVideo = () => {
  let videoSource = document.querySelector('input[type="radio"]:checked');
  videoSource = document.getElementById(videoSource.id + "-video");

  let original_language = document.getElementById("original_language");
  original_language = original_language.options[original_language.selectedIndex].value;
  let target_language = document.getElementById("target_language");
  target_language = target_language.options[target_language.selectedIndex].value;
  if (videoSource.value === '') {
    alert("Insira um vídeo para ser dublado!");
  } else {
    postVideo(videoSource, original_language, target_language);
  }
}

/*
--------------------------------------------------------------------------------------
função para buscar todas as dublagens cadastradas no sistema e colocá-las em uma lista.
--------------------------------------------------------------------------------------
*/
const getDubbings = () => {
  const videoList = document.getElementById("video-list");
  let list = `<div class="row">
  <img src="img/headset.svg" alt="">
  <h2 class="heading">Dublagens cadastradas</h2>
    </div>
  <ul>`;

  fetch(urls.dubbings)
    .then((data) => data.json())
    .then((data) => {
      if (data && data.dubbings && data.dubbings.length > 0) {
        dubbings = data.dubbings;
        console.log(`${data.dubbings.length} dublagens retornadas`);
        data.dubbings.forEach((dubbing) => {
          list += `<li><a onclick="watchDubbing(event, ${dubbing.id});" href="#video-${dubbing.id}">Assistir ${dubbing.video_title}</a></li>`;
        });
      } else {
        console.log("Erro ao obter lista  vídeos dublados.");
        list += `<li>Nenhum vídeo foi cadastrado ainda.</li>`;
      }
      list += `</ul>`;
      videoList.classList.remove("loading");
      videoList.innerHTML = list;

    }).catch((error) => {
      list += `<li>Não foi possível carregar a lista de vídeos cadastrados.</li>`;
      list += `</ul>`;
      videoList.innerHTML = list;
    });
}

/*
--------------------------------------------------------------------------------------
função para converter um vídeo de base64 para formato de midia para ser inserido no HTML
--------------------------------------------------------------------------------------
*/
const getVideoSourceFromBase64 = (video_in_base64) => {
  const videoData = atob(video_in_base64);
  const arrayBuffer = new ArrayBuffer(videoData.length);
  const intArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < videoData.length; i++) {
    intArray[i] = videoData.charCodeAt(i);
  }
  const videoBlob = new Blob([arrayBuffer], { type: "video/mp4" });
  const videoFile = URL.createObjectURL(videoBlob);
  return videoFile;

}
const createVideoPlayer = (dubbing) => {
  let video = document.createElement("video");
  video.src = getVideoSourceFromBase64(dubbing.dubbed_video);
  video.setAttribute("controls", "controls");
  video.setAttribute("width", "100%");
  let h2 = document.createElement("h2");
  h2.textContent = "Assista ao vídeo (" + dubbing.video_title + ") dublado";
  h2.id = "video-" + dubbing.id;
  h2.setAttribute("tabindex", "-1");
  h2.classList.add("heading");
  videoArea.textContent = "";
  videoArea.appendChild(h2);
  videoArea.appendChild(video);
  setTimeout(() => {
    h2.focus();
  }, 1000);

}
const watchDubbing = (event, videoId) => {
  event.preventDefault();
  const dubbing = dubbings.find((dubbing) => dubbing.id === videoId);
  dynamicMsg("Carregando vídeo, aguarde...");
  createVideoPlayer(dubbing);

  cleanDynamicMsg();
}

const dynamicMsg = (msg) => {
  let msgArea = document.getElementById("msg");
  msgArea.classList.add("msg-area");
  msgArea.innerHTML = msg;
}

const cleanDynamicMsg = () => {
  let msgArea = document.getElementById("msg");
  setTimeout(() => {
    msgArea.classList.remove("msg-area");
    msgArea.innerHTML = "";
  }, 1000);

}
const progressBar = (value, progressInterval) => {
  const limitValue = 100;
  let p;
  p = document.querySelector("#progress progress");
  if (!p) {
    p = document.createElement("progress");
    p.setAttribute("max", limitValue);
    document.querySelector("#progress").appendChild(p);
  }
  let status = document.querySelector('section[data-video-status="loaded"]');
  if (status) {
    if (value < 100) {
      for (let i = value; i <= limitValue; i++) {
        p.value = i;
      }
    } else {
      p.value = limitValue;
    }
    clearInterval(progressInterval);
    progressInterval = null;
  } else {
    if (value >= 95) {
      value = 95;
      p.value = value;
    } else {
      p.value = value;
    }
  }
}

btn.addEventListener("click", sendVideo);
const createVideoSource = (id) => {
  let source = {
    "source-file": function () {
      let input = document.createElement("input");
      input.type = "file";
      input.name = "video-file";
      input.id = id + "-video";
      let label = document.createElement("label");
      label.setAttribute("for", input.id);
      label.textContent = "Selecionar video: ";
      let div = document.createElement("div");
      div.appendChild(label);
      div.appendChild(input);
      return div;
    },
    "source-url": function () {
      let input = document.createElement("input");
      input.type = "url";
      input.name = "video-url";
      input.id = id + "-video";
      let label = document.createElement("label");
      label.setAttribute("for", input.id);
      label.textContent = "URL do YouTube: ";
      let div = document.createElement("div");
      div.appendChild(label);
      div.appendChild(input);
      return div;

    }

  };
  return source[id]();
}

videoSources.forEach((radio) => {
  radio.addEventListener("click", (e) => {
    let source = createVideoSource(e.target.id);

    let sourceArea = document.getElementById("source-area");
    sourceArea.textContent = "";
    sourceArea.appendChild(source);

  });
});
getDubbings();