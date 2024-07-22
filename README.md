# Componente 4 - Front-end para aplicação DubVideos
**Para executar o projeto com mais facilidade, você pode também seguir as instruções contidas no repositório do [Projeto Dub Videos](https://github.com/juliano-lopes/dub-videos-project) para poder subir todos os componentes utilizando docker-compose**.  
APIs do projeto:
* [Main DubVideos API](https://github.com/juliano-lopes/main-dub-videos-api)
* [Transcription API](https://github.com/juliano-lopes/transcription-api)
* [Text To Speech API](https://github.com/juliano-lopes/text-to-speech-api)

## DubVideos: Sua Solução Completa de Dublagem de Vídeos com Inteligência Artificial!  
Cansado de barreiras linguísticas que impedem você de aproveitar ao máximo seus vídeos favoritos? Apresentamos o DubVideos, a revolucionária aplicação que transforma qualquer vídeo em uma experiência multilíngue com apenas alguns cliques, utilizando o poder da inteligência artificial!
### Funcionalidades Inovadoras:  
* Dublagem Automática com IA: Selecione o idioma de destino e deixe o DubVideos fazer o resto. Transcrição, tradução e conversão de texto em fala, todas impulsionadas por inteligência artificial, se unem para criar uma nova dublagem perfeita para o seu vídeo.  
* Suporte a Diversos Idiomas: Quebre as barreiras da comunicação com uma ampla gama de idiomas disponíveis.  
* Fácil de Usar: Interface simples e intuitiva permite que qualquer pessoa, desde iniciantes até profissionais experientes, utilize o DubVideos com facilidade.  
### A aplicação DubVideos é Ideal para:
* Criadores de conteúdo que desejam alcançar um público global.  
* Empresas que precisam traduzir materiais de treinamento ou marketing para diferentes idiomas.  
* Estudantes que desejam aprender novos idiomas de forma imersiva.  
* Qualquer pessoa que queira assistir a vídeos em sua língua nativa ou em outro idioma de sua preferência.  
Experimente o DubVideos hoje mesmo e libere o potencial ilimitado da comunicação global, impulsionada pela inteligência artificial!
## Como utilizar
* É preciso ter o docker instalado para subir a aplicação em um container.
* Faça o clone ou baixe o projeto:  
**git clone https://github.com/juliano-lopes/dub-videos-front-end.git**  
* Entre na pasta do projeto:  
**cd dub-videos-front-end**  
* Crie a imagem por meio do Dockerfile:  
docker build -t dub_videos_frontend .  
* Após criar a imagem, execute o comando:  
docker run -it -p 8000:8000 dub_videos_frontend  
* A aplicação estará disponível pela porta local 8000
* Abra o endereço:  
http://localhost:8000   
no navegador.  

 ## Como testar
 Primeiramente certifique-se de estar com a API principal rodando com suas dependências:  
 [Main API Dub Videos](https://github.com/juliano-lopes/main-dub-videos-api)
 * para testar a rota de dublagem via upload de arquivo, [baixe este vídeo](https://drive.google.com/file/d/10UoBIsbx1xSGiYY-CP180pMAxoflLJWI/view?usp=sharing) e defina o idioma de origem para pt-BR e o idioma de destino para en-US;
 * para testar a rota via URL, utilize este link 
https://www.youtube.com/shorts/jzQq0QrLJng  
e defina o idioma de origem como en-US e o idioma de destino como pt-BR.

## Apresentação da Aplicação
* [Assista a o vídeo de aprensentação da aplicação Dub Videos](https://youtu.be/ISk4ukqWnfg)