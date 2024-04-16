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
    createProgressBar(++value, progressInterval);
  }, 5000);

  dynamicMsg("Dublando vídeo, isso pode levar alguns minutos... Por favor, aguarde.");
  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      btn.disabled = false;
      console.log("dados: ", data);
      if (data.message) {
        dynamicMsg(data.message);
        removeProgressBar(value, progressInterval);
        return;
      }
      dynamicMsg("Video dublado com sucesso");
      cleanDynamicMsg();
      removeProgressBar(value, progressInterval);

      createVideoPlayer(data);
      getDubbings();
    })
    .catch((error) => {
      btn.disabled = false;
      removeProgressBar(value, progressInterval);
      console.error('Error:', error);
      dynamicMsg("Ocorreu um erro ao tentar dublar o vídeo.");

    });
}


/*
  --------------------------------------------------------------------------------------
  Função para dublar um novo vídeo 
  --------------------------------------------------------------------------------------
*/
const sendVideo = () => {
  let videoSource = document.querySelector('input[type="radio"]:checked');
  videoSource = videoSource ? document.getElementById(videoSource.id + "-video") : null;

  let original_language = document.getElementById("original_language");
  original_language = original_language.options[original_language.selectedIndex].value;
  let target_language = document.getElementById("target_language");
  target_language = target_language.options[target_language.selectedIndex].value;
  if (!videoSource || videoSource.value === '') {
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
  <h2 class="heading" tabindex="-1">Dublagens cadastradas</h2>
    </div>
  <ul>`;

  fetch(urls.dubbings)
    .then((data) => data.json())
    .then((data) => {
      if (data && data.dubbings && data.dubbings.length > 0) {
        dubbings = data.dubbings;
        console.log(`${data.dubbings.length} dublagens retornadas`);
        data.dubbings.forEach((dubbing) => {
          list += `<li data-dubbing-id="video-${dubbing.id}"><a onclick="watchDubbing(event, ${dubbing.id});" href="#video-${dubbing.id}">Assistir ${dubbing.video_title}</a></li>`;
        });
      } else {
        console.log("Erro ao obter lista  vídeos dublados.", data);
        list += `<li>Nenhum vídeo foi cadastrado ainda.</li>`;
      }
      list += `</ul>`;
      videoList.classList.remove("loading");
      videoList.innerHTML = list;

    }).catch((error) => {
      console.log(`Não foi possível carregar a lista de vídeos cadastrados:`, error);
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

/*
--------------------------------------------------------------------------------------
função para criar área de player com título  e video, utilizando tag video do HTML5.
-------------------------------------------------------------------------------------- 
*/
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
  let button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "Apagar vídeo " + dubbing.video_title);
  let delSpan = document.createElement("span");
  delSpan.classList.add("img-delete");
  let span = document.createElement("span");
  span.textContent = " Apagar vídeo";
  button.appendChild(delSpan);
  button.appendChild(span);
  button.onclick = () => confirm("Deseja realmente apagar o vídeo '" + dubbing.video_title + "'?") ? deleteDubbing(dubbing.id) : false;
  videoArea.textContent = "";
  videoArea.appendChild(h2);
  videoArea.appendChild(button);
  videoArea.appendChild(video);
  setTimeout(() => {
    h2.focus();
  }, 1000);

}

/*
--------------------------------------------------------------------------------------
função para assistir um vídeo selecionado na lista de vídeos cadastrados, que é chamada quando um link é ativado.
--------------------------------------------------------------------------------------
*/
const watchDubbing = (event, videoId) => {
  event.preventDefault();
  const dubbing = dubbings.find((dubbing) => dubbing.id === videoId);
  dynamicMsg("Carregando vídeo, aguarde...");
  createVideoPlayer(dubbing);

  cleanDynamicMsg();
}

/*
--------------------------------------------------------------------------------------
função para inserir mensagens dinâmicas informativas na aplicação.
--------------------------------------------------------------------------------------
*/
const dynamicMsg = (msg) => {
  let msgArea = document.getElementById("msg");
  msgArea.classList.add("msg-area");
  msgArea.innerHTML = msg;
}

/*
--------------------------------------------------------------------------------------
função para limpar a mensagem dinâmica que foi inserida.
--------------------------------------------------------------------------------------
*/
const cleanDynamicMsg = () => {
  let msgArea = document.getElementById("msg");
  setTimeout(() => {
    msgArea.classList.remove("msg-area");
    msgArea.innerHTML = "";
  }, 1000);
}

/*
--------------------------------------------------------------------------------------
função que cria uma barra de progresso para que o usuário perceba que a dublagem do vídeo está em andamento.
--------------------------------------------------------------------------------------
*/
const createProgressBar = (value) => {
  const limitValue = 100;
  let p;
  p = document.querySelector("#progress progress");
  if (!p) {
    p = document.createElement("progress");
    p.setAttribute("max", limitValue);
    document.querySelector("#progress").appendChild(p);
  }

  if (value >= 95) {
    value = 95;
    p.value = value;
  } else {
    p.value = value;
  }

}

/*
--------------------------------------------------------------------------------------
função que remove barra de progresso após dublagem do vídeo.
--------------------------------------------------------------------------------------
*/
const removeProgressBar = (value, progressInterval) => {
  clearInterval(progressInterval);
  const progressBar = document.querySelector("#progress progress");

  if (!progressBar) {
    return;
  }

  const maxValue = 100;
  for (let i = value; i <= maxValue; i++) {
    progressBar.value = i;
  }
  setTimeout(() => {
    progressBar.parentElement.textContent = "";
  }, 1000);
}

/*
--------------------------------------------------------------------------------------
função para criar a entrada de fonte que o vídeo será carregado (via url ou upload de arquivo).
--------------------------------------------------------------------------------------
*/
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

/*
--------------------------------------------------------------------------------------
função para apagar vídeo dublado da base de dados via id.
*/
const deleteDubbing = (dubbing_id) => {
  formData = new FormData();
  formData.append("id", dubbing_id);
  let options = {
    method: "DELETE",
    body: formData
  };
  fetch(urls.dubbings, options)
    .then((data) => data.json())
    .then((data) => {
      if (data && data.id) {
        alert("Vídeo apagado com sucesso.");
        const videoListItem = document.querySelector(`li[data-dubbing-id="video-${data.id}"]`);
        videoListItem ? videoListItem.parentElement.removeChild(videoListItem) : null;
        const videoListItems = document.querySelectorAll("#video-list ul li");

        if ( videoListItems.length == 0) {
          getDubbings();
        }

        videoArea.textContent = "";
        setTimeout(() => {
          const videoList = document.querySelector("#video-list");
          videoList.setAttribute("tabindex", "-1");
          const videoListHeading = videoList.querySelector("h2");
          videoListHeading ? videoListHeading.focus() : videoList.focus();
        }, 1500);

      } else {
        alert("Não foi possível apagar o vídeo.");
      }
    }).catch((error) => {
      alert("Não foi possível apagar o vídeo.");
      console.log("Erro ao apagar dublagem: " + error);
    });
}
/*
--------------------------------------------------------------------------------------
atrela a função de dublagem ao botão.
--------------------------------------------------------------------------------------
*/
btn.addEventListener("click", sendVideo);

/*
--------------------------------------------------------------------------------------
atrela a criação de entrada de fonte de acordo com a opção do usuário.
--------------------------------------------------------------------------------------
*/
videoSources.forEach((radio) => {
  radio.addEventListener("click", (e) => {
    let source = createVideoSource(e.target.id);

    let sourceArea = document.getElementById("source-area");
    sourceArea.textContent = "";
    sourceArea.appendChild(source);

  });
});

/*
--------------------------------------------------------------------------------------
Chama a função para que a lista de vídeos dublados seja carregada assim que a página for aberta.
--------------------------------------------------------------------------------------
*/
getDubbings();