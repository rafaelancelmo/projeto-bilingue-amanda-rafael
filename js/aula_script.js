// js/aula_script.js

// VERIFICAÇÃO DE LOGIN - DEVE SER A PRIMEIRA COISA NO SCRIPT
(function() {
    const isLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
    // Páginas de aula estão em /modulos/, login.html está na raiz (../)
    const loginPath = '../login.html'; 

    if (!isLoggedIn) {
        console.log("Usuário não logado, redirecionando de aula_script.js para:", loginPath);
        window.location.href = loginPath;
        // Impede a execução do restante do script se for redirecionar
        throw new Error("Redirecionando para login.");
    }
})();
// FIM DA VERIFICAÇÃO DE LOGIN
document.addEventListener('DOMContentLoaded', function () {
    // Em js/script.js, dentro do DOMContentLoaded
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', function() {
        localStorage.removeItem('isUserLoggedIn');
        localStorage.removeItem('currentUserProjetoBilingue'); // Limpa também o usuário selecionado
        // Determina o caminho para login.html
        let loginPath = 'login.html';
        if (window.location.pathname.includes('/modulos/')) {
            loginPath = '../login.html';
        }
        window.location.href = loginPath;
    });
}

    console.log("Script da página de aula (aula_script.js) carregado!");
    const paginaAulaLayout = document.querySelector('.pagina-aula-mv-layout');
    const aulaId = paginaAulaLayout ? paginaAulaLayout.dataset.aulaId : null;
    let currentUserAula = localStorage.getItem('currentUserProjetoBilingue');

    // --- LÓGICA DAS ABAS ---
    const tabButtons = document.querySelectorAll('.abas-mv-aula .btn-aba-mv');
    const tabPanels = document.querySelectorAll('.abas-mv-aula .painel-aba-mv');

    if (tabButtons.length > 0 && tabPanels.length > 0) {
        const activeTabButtonHTML = document.querySelector('.botoes-abas-mv .btn-aba-mv.active');
        let activePanelHTML = document.querySelector('.paineis-abas-mv .painel-aba-mv.active');

        // Garante que apenas o painel da aba ativa no HTML seja exibido inicialmente
        tabPanels.forEach(panel => {
            if (panel.classList.contains('active')) {
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        });
        
        if (!activePanelHTML && tabButtons.length > 0) { // Se nenhum painel está ativo, ativa o primeiro
            const firstButton = tabButtons[0];
            if (firstButton) {
                firstButton.classList.add('active');
                const firstPanelId = firstButton.getAttribute('data-target');
                activePanelHTML = document.getElementById(firstPanelId);
                if (activePanelHTML) {
                    activePanelHTML.classList.add('active');
                    activePanelHTML.style.display = 'block';
                }
            }
        } else if (activePanelHTML && !activeTabButtonHTML) { // Se painel ativo, mas botão não
             const targetButton = document.querySelector(`.botoes-abas-mv .btn-aba-mv[data-target="${activePanelHTML.id}"]`);
             if(targetButton) targetButton.classList.add('active');
        }

        tabButtons.forEach(button => {
            button.addEventListener('click', function (event) {
                event.preventDefault(); 
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    panel.style.display = 'none'; 
                });
                const targetPanelId = this.getAttribute('data-target');
                const targetPanel = document.getElementById(targetPanelId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.style.display = 'block'; 
                } else {
                    console.error("Painel da aba não encontrado com ID:", targetPanelId, "para o botão:", this);
                }
            });
        });
    }

    // --- LÓGICA DO MODO FOCO ---
    const btnModoFoco = document.getElementById('btn-modo-foco');
    const bodyElement = document.body; 
    if (btnModoFoco && paginaAulaLayout) {
        btnModoFoco.addEventListener('click', function() {
            paginaAulaLayout.classList.toggle('modo-foco-ativado');
            bodyElement.classList.toggle('no-scroll-foco'); 
            this.textContent = paginaAulaLayout.classList.contains('modo-foco-ativado') ? 'Sair do Modo Foco' : 'Modo Foco Vídeo';
        });
    }

    // --- LÓGICA DA ABA DE ANOTAÇÕES ---
    const textareaAnotacoes = document.getElementById(`textarea-anotacoes-${aulaId}`);
    window.carregarAnotacoes = function(currentAulaIdParaAnotacao) {
        currentUserAula = localStorage.getItem('currentUserProjetoBilingue');
        const textAreaAtual = document.getElementById(`textarea-anotacoes-${currentAulaIdParaAnotacao}`);
        if (textAreaAtual && currentUserAula && currentAulaIdParaAnotacao) {
            const storageKeyAnotacoes = `anotacoes_${currentUserAula}_${currentAulaIdParaAnotacao}`;
            const anotacoesSalvas = localStorage.getItem(storageKeyAnotacoes);
            textAreaAtual.value = anotacoesSalvas ? anotacoesSalvas : '';
        } else if (textAreaAtual) {
            textAreaAtual.value = ''; 
        }
    }
    if (textareaAnotacoes && aulaId) {
        if (typeof window.carregarAnotacoes === "function") {
             window.carregarAnotacoes(aulaId); 
        }
        textareaAnotacoes.addEventListener('input', function() {
            if (currentUserAula) {
                const storageKeyAnotacoes = `anotacoes_${currentUserAula}_${aulaId}`;
                localStorage.setItem(storageKeyAnotacoes, this.value);
            }
        });
    }

    // --- LÓGICA PARA SALVAR ÁUDIO NA PLAYLIST ---
    const btnSalvarPlaylist = document.querySelector('.btn-salvar-playlist');

    if (btnSalvarPlaylist && aulaId) { 
        const audioSrcParaSalvar = btnSalvarPlaylist.dataset.audioSrc;
        const audioTitleParaSalvar = btnSalvarPlaylist.dataset.audioTitle || `Áudio da Aula ${aulaId}`;
        
        function atualizarEstadoBotaoPlaylist() {
            currentUserAula = localStorage.getItem('currentUserProjetoBilingue'); // Recarrega para garantir
            if (!currentUserAula) {
                btnSalvarPlaylist.textContent = 'Salvar na Playlist';
                btnSalvarPlaylist.classList.remove('saved');
                btnSalvarPlaylist.disabled = true; 
                btnSalvarPlaylist.title = "Selecione um usuário na página inicial para usar a playlist.";
                return;
            }
            btnSalvarPlaylist.title = ""; 
            btnSalvarPlaylist.disabled = false; 

            const playlistStorageKey = `playlistAudios_${currentUserAula}`;
            let playlistAtual = JSON.parse(localStorage.getItem(playlistStorageKey)) || [];
            
            if (playlistAtual.find(item => item.src === audioSrcParaSalvar)) {
                btnSalvarPlaylist.textContent = 'Salvo na Playlist';
                btnSalvarPlaylist.classList.add('saved');
                btnSalvarPlaylist.disabled = true;
            } else {
                btnSalvarPlaylist.textContent = 'Salvar na Playlist';
                btnSalvarPlaylist.classList.remove('saved');
                btnSalvarPlaylist.disabled = false;
            }
        }
        
        atualizarEstadoBotaoPlaylist(); 

        window.addEventListener('currentUserChanged', function() {
            console.log("Evento currentUserChanged capturado em aula_script.js para atualizar playlist button");
            currentUserAula = localStorage.getItem('currentUserProjetoBilingue');
            atualizarEstadoBotaoPlaylist();
             // Recarrega anotações também, pois a função carregarAnotacoes já existe
            if (typeof window.carregarAnotacoes === "function") {
                window.carregarAnotacoes(aulaId);
            }
        });

        btnSalvarPlaylist.addEventListener('click', function() {
            currentUserAula = localStorage.getItem('currentUserProjetoBilingue'); 
            if (!currentUserAula) {
                alert("Por favor, selecione um usuário na página inicial para usar a playlist.");
                return;
            }
            if (this.classList.contains('saved')) return; 

            const playlistStorageKey = `playlistAudios_${currentUserAula}`;
            let playlistAtual = JSON.parse(localStorage.getItem(playlistStorageKey)) || [];
            
            const existe = playlistAtual.find(item => item.src === audioSrcParaSalvar);
            if (!existe) {
                playlistAtual.push({ 
                    src: audioSrcParaSalvar, 
                    title: audioTitleParaSalvar, 
                    aulaId: aulaId 
                });
                localStorage.setItem(playlistStorageKey, JSON.stringify(playlistAtual));
                this.textContent = 'Salvo na Playlist';
                this.classList.add('saved');
                this.disabled = true;
                alert('Áudio salvo na sua playlist!');
            }
        });
    }

    // --- LÓGICA PARA LEGENDA SINCRONIZADA COM ÁUDIO ---
    const audioPlayer = document.getElementById(`audio-player-${aulaId}`);
    const transcricaoContainer = document.getElementById(`transcricao-audio-${aulaId}`);

    if (audioPlayer && transcricaoContainer && aulaId) {
        let legendasAula = [];
        const transcricaoJackHannafordM1 = [
            { start: 0.0, end: 5.0, textEng: "Jack Hannaford. There was once a farmer and his wife.", textPt: "Jack Hannaford. Existia uma vez um fazendeiro e sua esposa." },
            { start: 5.1, end: 7.8, textEng: "She had been married before,", textPt: "Ela tinha sido casada antes," },
            { start: 7.9, end: 10.0, textEng: "her first husband had died,", textPt: "o primeiro marido dela tinha morrido," },
            { start: 10.1, end: 12.0, textEng: "and now she was married again.", textPt: "e agora ela era casada novamente." },
            { start: 12.5, end: 16.0, textEng: "They lived on a remote farm in the west of England,", textPt: "Eles moravam em uma remota fazenda no oeste da Inglaterra," },
            { start: 16.2, end: 19.0, textEng: "and what a pair of fools they were!", textPt: "e que par de tolos eles eram!" },
            { start: 19.2, end: 22.0, textEng: "Which of them was the most foolish?", textPt: "Qual deles era o mais tolo?" },
            { start: 22.2, end: 25.0, textEng: "Listen to the story and decide for yourself.", textPt: "Escute a história e decida você mesmo." }
        ];
        const transcricaoMod02Aula02 = [
            { start: 0.5, end: 4.5, textEng: "In those days, there also lived an old soldier called Jack Hannaford.", textPt: "Naqueles dias, existia (vivia) também um velho soldado chamado Jack Hannaford." },
            { start: 5.0, end: 7.5, textEng: "His coat was old and he was poor,", textPt: "Seu casaco era velho e ele era pobre," },
            { start: 8.0, end: 11.5, textEng: "but nobody thought that Jack Hannaford was stupid.", textPt: "mas ninguém pensava que Jack Hannaford era estúpido/burro/bobo." },
            { start: 12.0, end: 14.0, textEng: "He was sly like a fox.", textPt: "Ele era astuto/malicioso como uma raposa." },
            { start: 14.5, end: 16.0, textEng: "When he left the army,", textPt: "Quando ele deixou o exército," },
            { start: 16.5, end: 19.0, textEng: "he walked all around the country,", textPt: "ele caminhou por todo o país," },
            { start: 19.5, end: 22.0, textEng: "looking for ways to play his tricks.", textPt: "procurando por maneiras de “jogar seus truques” (fazer suas artimanhas)." },
            { start: 22.5, end: 25.5, textEng: "After he had traveled for some time,", textPt: "Depois que ele tinha viajado por algum tempo," },
            { start: 26.0, end: 29.0, textEng: "he came across the farm belonging to the pair.", textPt: "ele deu de cara com a fazenda que pertencia ao par (ao casal)." },
            { start: 29.5, end: 31.5, textEng: "He knocked on the door of the house,", textPt: "Ele bateu na porta da casa," },
            { start: 32.0, end: 34.5, textEng: "and a moment later, the wife answered.", textPt: "e “um momento depois” (pouco depois) a esposa respondeu." },
            { start: 35.0, end: 38.5, textEng: "She looked him up and down, quite astonished,", textPt: "Ela olhou ele de cima a baixo, muito surpresa," },
            { start: 39.0, end: 43.0, textEng: "because few strangers were able to make the difficult journey to their home.", textPt: "porque poucos desconhecidos eram capazes de fazer a difícil jornada até a casa deles." },
            { start: 43.5, end: 45.5, textEng: "“Where did you come from?” she asked.", textPt: "“De onde você veio?”, ela perguntou." }
        ];
        // TRANSCRIÇÃO PARA M02 AULA 03 (com tempos estimados - AJUSTE FINO NECESSÁRIO POR VOCÊ)
        const transcricaoMod02Aula03 = [
            { start: 0.5, end: 3.8, textEng: "Jack looked up at the pale blue sky,", textPt: "Jack olhou para o céu azul claro," },
            { start: 4.0, end: 7.0, textEng: "and he said, “I came from Heaven.”", textPt: "e ele disse, “eu vim do céu”." },
            { start: 7.3, end: 9.0, textEng: "“My goodness!”, she said.", textPt: "“Meu Deus!”, ela disse." },
            { start: 9.2, end: 11.3, textEng: "“Did you see my husband there?”", textPt: "“Você viu meu marido lá?”" },
            { start: 11.8, end: 15.5, textEng: "The farmer’s wife was talking about her first husband,", textPt: "A esposa do fazendeiro estava falando sobre o primeiro marido dela," },
            { start: 15.7, end: 17.8, textEng: "the man who had died.", textPt: "o homem que tinha morrido." },
            { start: 18.3, end: 23.0, textEng: "“Oh yes, I got to know him well when I was staying in Heaven,” said Jack.", textPt: "“Ah sim, eu conheci ele bem quando eu estava ficando/passando um tempo no céu”, disse Jack." },
            { start: 23.5, end: 25.8, textEng: "“And how is he doing?”, asked the woman.", textPt: "“E como ele está?”, perguntou a mulher." },
            { start: 26.0, end: 28.5, textEng: "“He is fine,” replied the old soldier.", textPt: "“Ele está bem”, respondeu o velho soldado." }
        ];

        // NOVA TRANSCRIÇÃO PARA M02 AULA 04 (com tempos estimados - AJUSTE FINO NECESSÁRIO POR VOCÊ)
const transcricaoMod02Aula04 = [
    { start: 0.5, end: 5.0, textEng: "“He works hard sewing and mending clothes for the saints and angels,", textPt: "“Ele trabalha duro costurando e remendando roupas para as santidades e os anjos," },
    { start: 5.5, end: 9.5, textEng: "but even so, he sometimes doesn’t have enough money to eat.”", textPt: "mas mesmo assim, ele às vezes não tem dinheiro o suficiente para comer.”" },
    { start: 10.0, end: 12.3, textEng: "“And did he send me a message?”, she asked.", textPt: "“E ele me mandou uma mensagem?”, ela perguntou." },
    { start: 12.6, end: 13.8, textEng: "“Yes, he did!", textPt: "“Sim, ele mandou!" },
    { start: 14.0, end: 15.8, textEng: "That is why I’ve come here.", textPt: "É por isso que eu vim aqui." },
    { start: 16.2, end: 19.8, textEng: "He asked me to bring back some money for him,", textPt: "Ele me pediu para trazer de volta um pouco de dinheiro para ele," },
    { start: 20.0, end: 24.0, textEng: "so that he can spend his days in paradise more comfortably.”", textPt: "para que/de modo que ele possa passar seus dias no paraíso mais confortavelmente.”" },
    { start: 24.5, end: 28.5, textEng: "On hearing this, the poor woman’s heart almost broke with pity.", textPt: "Ao ouvir isso, o coração da pobre mulher quase quebrou com/de piedade." }
];

// TRANSCRIÇÃO PARA M02 AULA 05 (com tempos estimados - AJUSTE FINO NECESSÁRIO POR VOCÊ)
const transcricaoMod02Aula05 = [
    { start: 0.5, end: 3.0, textEng: "“I’ll give him anything he wants!”", textPt: "“Eu vou dar a ele qualquer coisa que ele quiser!”" },
    { start: 3.5, end: 6.5, textEng: "“He’s a good man, God bless him,” she said.", textPt: "“Ele é um bom homem, Deus o abençoe”, ela disse." },
    { start: 7.0, end: 8.8, textEng: "Then she went to the chimney", textPt: "Então ela foi até a chaminé" },
    { start: 9.0, end: 12.0, textEng: "where the couple’s savings were kept hidden.", textPt: "onde as economias do casal eram mantidas (ficavam) escondidas." },
    { start: 12.5, end: 16.0, textEng: "She took out two pieces of gold and five pieces of silver,", textPt: "Ela pegou/retirou duas moedas de ouro e cinco moedas de prata," },
    { start: 16.5, end: 19.5, textEng: "which in those days was a lot of money.", textPt: "o que naqueles dias era muito dinheiro." },
    { start: 20.0, end: 22.5, textEng: "She handed everything over to the old soldier", textPt: "Ela entregou tudo para o velho soldado" },
    { start: 23.0, end: 26.5, textEng: "and told him to hurry up and give it to her first husband.", textPt: "e falou para ele se apressar e dar (isso) para seu primeiro marido." },
    { start: 27.0, end: 29.0, textEng: "“I will,” Jack told the woman,", textPt: "“Eu vou”, Jack falou para a mulher," },
    { start: 29.5, end: 31.8, textEng: "“as soon as I return to Heaven.”", textPt: "“assim que eu retornar ao céu”." }
];

// TRANSCRIÇÃO PARA M02 AULA 06 (com tempos estimados - AJUSTE FINO NECESSÁRIO POR VOCÊ)
const transcricaoMod02Aula06 = [
    { start: 0.5, end: 2.8, textEng: "When the farmer came back,", textPt: "Quando o fazendeiro voltou," },
    { start: 3.0, end: 7.5, textEng: "his wife told him all about how a messenger had come from Heaven.", textPt: "a esposa dele contou para ele tudo sobre como um mensageiro tinha vindo do céu." },
    { start: 8.0, end: 14.5, textEng: "She said that the man asked for money for her first husband, who was living and working in Heaven, but who was poor.", textPt: "Ela disse que o homem pediu dinheiro para seu primeiro marido, que estava vivendo (morando) e trabalhando no céu, mas que era pobre." },
    { start: 15.0, end: 17.8, textEng: "“You are a foolish woman!” shouted the farmer.", textPt: "“Você é uma mulher tola!”, gritou o fazendeiro." },
    { start: 18.3, end: 21.0, textEng: "“How could you believe such a silly story?”", textPt: "“Como você pôde acreditar em uma história tão boba?”" },
    { start: 21.5, end: 24.5, textEng: "“Well, you are even more foolish,” said the woman,", textPt: "“Bom, você é ainda mais tolo”, disse a mulher." },
    { start: 25.0, end: 28.0, textEng: "“because you showed me where the money was hidden.”", textPt: "“porque você me mostrou onde o dinheiro estava escondido.”" },
    { start: 28.5, end: 31.5, textEng: "The husband did not agree with what she said,", textPt: "O marido não concordou com o que ela disse," },
    { start: 32.0, end: 34.0, textEng: "but he did not stay to argue.", textPt: "mas ele não ficou para discutir." },
    { start: 34.5, end: 38.5, textEng: "He hurried off on his horse to try to find the old soldier", textPt: "Ele partiu às pressas em seu cavalo para tentar encontrar o velho soldado." }
];

// TRANSCRIÇÃO PARA M02 AULA 07 (com tempos estimados - AJUSTE FINO NECESSÁRIO POR VOCÊ)
const transcricaoMod02Aula07 = [
    { start: 0.5, end: 4.0, textEng: "Jack Hannaford heard the sound of the horse behind him.", textPt: "Jack Hannaford ouviu o som do cavalo atrás dele." },
    { start: 4.5, end: 8.5, textEng: "He knew that the farmer was coming for him and for the money.", textPt: "Ele sabia que o fazendeiro estava vindo atrás dele e do dinheiro." },
    { start: 9.0, end: 11.5, textEng: "Quickly, he came up with a plan.", textPt: "Rapidamente, ele inventou (“bolou”) um plano." },
    { start: 12.0, end: 14.0, textEng: "He knelt by the side of the road,", textPt: "Ele ajoelhou-se ao lado da estrada," },
    { start: 14.5, end: 16.5, textEng: "covered his eyes with one hand,", textPt: "cobriu seus olhos com uma mão," },
    { start: 17.0, end: 20.0, textEng: "and pointed up to the sky with the other.", textPt: "e apontou para o céu com a outra." },
    { start: 20.5, end: 22.8, textEng: "The farmer soon reached him and asked:", textPt: "O fazendeiro logo o alcançou e perguntou:" },
    { start: 23.3, end: 26.0, textEng: "“What are you doing here by the side of the road?”", textPt: "“O que você está fazendo aqui ao lado da estrada?”" },
    { start: 26.5, end: 28.8, textEng: "“Why are you protecting your eyes”", textPt: "“Por que você está protegendo os seus olhos”" },
    { start: 29.0, end: 31.0, textEng: "“and pointing up to the sky?”", textPt: "“e apontando para o céu?”" },
    { start: 31.5, end: 34.5, textEng: "“It is amazing! It is God’s work!” shouted the man.", textPt: "“É incrível! É uma obra de Deus!”, gritou o homem." },
    { start: 35.0, end: 36.5, textEng: "“I see a wonderful thing!”", textPt: "“Eu vejo uma coisa maravilhosa!”" },
    { start: 37.0, end: 39.5, textEng: "“What kind of wonderful thing?” asked the farmer.", textPt: "“Que tipo de coisa maravilhosa?”, perguntou o fazendeiro." },
    { start: 40.0, end: 43.5, textEng: "“A man is walking straight up to Heaven on a rainbow,”", textPt: "“Um homem está andando diretamente para o céu em um arco-íris”," },
    { start: 44.0, end: 46.5, textEng: "“just as if it were a road.”", textPt: "“exatamente como se fosse uma estrada.”" }
];
// TRANSCRIÇÃO PARA M02 AULA 08 (com tempos estimados - AJUSTE FINO NECESSÁRIO POR VOCÊ)
const transcricaoMod02Aula08 = [
    { start: 0.5, end: 2.8, textEng: "The farmer looked at the sky,", textPt: "O fazendeiro olhou para o céu," },
    { start: 3.0, end: 7.5, textEng: "but he could not see the amazing rainbow or the man walking on it.", textPt: "mas ele não conseguiu ver o incrível arco-íris ou o homem andando sobre ele." },
    { start: 8.0, end: 9.8, textEng: "“Here,” said the soldier,", textPt: "“Aqui,”, disse o soldado," },
    { start: 10.0, end: 12.5, textEng: "“kneel down by the side of the road”", textPt: "“ajoelhe-se ao lado da estrada”" },
    { start: 13.0, end: 15.8, textEng: "“and look up at the sky like I’m doing.”", textPt: "“e olhe para o céu como eu estou fazendo.”" },
    { start: 16.3, end: 19.5, textEng: "“I will if you’ll hold my horse,” said the farmer,", textPt: "“Eu vou se você segurar meu cavalo”, disse o fazendeiro," },
    { start: 20.0, end: 22.0, textEng: "and he jumped down from his horse.", textPt: "e ele pulou do seu cavalo." },
    { start: 22.5, end: 25.0, textEng: "As soon as the farmer knelt down,", textPt: "Logo que o fazendeiro ajoelhou-se," },
    { start: 25.5, end: 28.5, textEng: "Jack Hannaford jumped onto the horse and escaped!", textPt: "Jack Hannaford pulou no cavalo e escapou!" },
    { start: 29.0, end: 33.0, textEng: "Now, who do you think was more foolish, the farmer or his wife?", textPt: "Agora, quem você acha que foi mais tolo, o fazendeiro ou sua esposa?" }
];

// Em js/aula_script.js, junto às outras definições de transcrição:

// TRANSCRIÇÃO PARA M03 AULA 01 (com tempos estimados - AJUSTE FINO NECESSÁRIO POR VOCÊ)
const transcricaoMod03Aula01 = [
    { start: 0.5, end: 3.5, textEng: "In the Far East there was a Great King", textPt: "No Extremo Oriente havia um Grande Rei" },
    { start: 3.8, end: 6.0, textEng: "who had no work to do.", textPt: "que não tinha nenhum trabalho para fazer." },
    { start: 6.5, end: 9.0, textEng: "Every day, and all day long,", textPt: "Todos os dias, e o dia todo," },
    { start: 9.5, end: 12.5, textEng: "he sat on soft cushions and listened to stories.", textPt: "ele se sentava em almofadas macias e escutava histórias." },
    { start: 13.0, end: 15.5, textEng: "And no matter what the story was about,", textPt: "E não importa sobre o que era a história," },
    { start: 16.0, end: 20.5, textEng: "he never grew tired of hearing it, even though many of the stories took hours to complete.", textPt: "ele nunca se cansava de escutá-la, mesmo que muitas histórias levassem horas para acabar." },
    { start: 21.0, end: 24.5, textEng: "“There is only one fault with your story,” he often said,", textPt: "“Há apenas uma falha na sua história,” ele frequentemente dizia," },
    { start: 24.8, end: 26.5, textEng: "“it is too short.”", textPt: "“ela é muito curta.”" },
    { start: 27.0, end: 30.0, textEng: "All the storytellers in the world were invited to his palace;", textPt: "Todos os contadores de histórias do mundo eram convidados ao seu palácio;" },
    { start: 30.5, end: 33.5, textEng: "and some of them told stories that were very long indeed.", textPt: "e alguns deles contavam histórias que eram de fato muito longas." }
];

const transcricaoMod03Aula02 = [
   { start: 0.5, end: 3.5, textEng: "In the Far East there was a Great King", textPt: "No Extremo Oriente havia um Grande Rei" },
    { start: 3.8, end: 6.0, textEng: "who had no work to do.", textPt: "que não tinha nenhum trabalho para fazer." },
    { start: 6.5, end: 9.0, textEng: "Every day, and all day long,", textPt: "Todos os dias, e o dia todo," },
    { start: 9.5, end: 12.5, textEng: "he sat on soft cushions and listened to stories.", textPt: "ele se sentava em almofadas macias e escutava histórias." },
    { start: 13.0, end: 15.5, textEng: "And no matter what the story was about,", textPt: "E não importa sobre o que era a história," },
    { start: 16.0, end: 20.5, textEng: "he never grew tired of hearing it, even though many of the stories took hours to complete.", textPt: "ele nunca se cansava de escutá-la, mesmo que muitas histórias levassem horas para acabar." },
    { start: 21.0, end: 24.5, textEng: "“There is only one fault with your story,” he often said,", textPt: "“Há apenas uma falha na sua história,” ele frequentemente dizia," },
    { start: 24.8, end: 26.5, textEng: "“it is too short.”", textPt: "“ela é muito curta.”" },
    { start: 27.0, end: 30.0, textEng: "All the storytellers in the world were invited to his palace;", textPt: "Todos os contadores de histórias do mundo eram convidados ao seu palácio;" },
    { start: 30.5, end: 33.5, textEng: "and some of them told stories that were very long indeed.", textPt: "e alguns deles contavam histórias que eram de fato muito longas." }
];
const transcricaoMod03Aula03 = [
     { start: 0.5, end: 3.5, textEng: "But The King was always sad", textPt: "Mas o Rei estava sempre triste" },
    { start: 3.7, end: 5.5, textEng: "when the story ended.", textPt: "quando a história acabava." },
    { start: 6.0, end: 12.5, textEng: "At last he sent a message to every city and town, offering a prize to any one able to tell him an endless tale.", textPt: "Finalmente ele enviou uma mensagem a toda cidade grande e cidade pequena, oferecendo um prêmio a qualquer um capaz de contar a ele um conto sem fim." },
    { start: 13.0, end: 17.0, textEng: "He said: “To the man that will tell me a story which lasts forever,", textPt: "Ele disse: “Ao homem que irá me contar uma história que dure para sempre," },
    { start: 17.5, end: 20.0, textEng: "I will give my daughter as his wife;", textPt: "Eu darei minha filha como sua esposa;" },
    { start: 20.5, end: 25.0, textEng: "and I will make him my heir, and he shall be king after me.”", textPt: "e eu farei dele meu herdeiro, e ele será rei depois de mim.”" },
    { start: 25.5, end: 28.5, textEng: "But this challenge wasn’t quite what it seemed.", textPt: "Mas este desafio não era muito (exatamente) o que parecia." },
    { start: 29.0, end: 30.8, textEng: "The King added a strict condition.", textPt: "O Rei adicionou uma condição rigorosa." },
    { start: 31.3, end: 34.5, textEng: "“If any man tries to tell such a story and fails,", textPt: "“Se qualquer homem tentar contar tal história e falhar," },
    { start: 35.0, end: 37.0, textEng: "then his head will be cut off.”", textPt: "então sua cabeça será cortada.”" }
];

const transcricaoMod03Aula04 = [
    { start: 0.5, end: 3.5, textEng: "The King's daughter was very beautiful,", textPt: "A filha do Rei era muito bonita," },
    { start: 3.7, end: 8.0, textEng: "and many young men in The Kingdom were willing to do anything to win her.", textPt: "e muitos jovens rapazes no Reino estavam dispostos a fazer qualquer coisa para ganhá-la." },
    { start: 8.5, end: 13.0, textEng: "But none of them wanted to lose his head, and so only a few tried for the prize.", textPt: "Mas nenhum deles queria perder a cabeça, e então apenas alguns se arriscaram pelo prêmio." },
    { start: 13.5, end: 16.5, textEng: "One young man invented a story that lasted three months;", textPt: "Um jovem rapaz inventou uma história que durou três meses;" },
    { start: 17.0, end: 20.0, textEng: "but after that, he could think of nothing more.", textPt: "mas depois disso, ele não conseguiu pensar em mais nada." },
    { start: 20.5, end: 26.5, textEng: "His fate was a warning to others, and it was a long time before another storyteller was daring enough to take the King's challenge.", textPt: "Seu destino foi um alerta aos outros, e levou muito tempo antes que outro contador de histórias fosse ousado o suficiente para aceitar o desafio do Rei." }
];

const transcricaoMod03Aula05 = [
    { start: 0.5, end: 4.0, textEng: "One day a Stranger from the South came to The Palace.", textPt: "Um dia um Estranho do Sul veio ao Palácio." },
    { start: 4.5, end: 6.0, textEng: "“Great king,” he said,", textPt: "“Grande rei,” ele disse," },
    { start: 6.5, end: 11.0, textEng: "“is it true that you offer a prize to the man who can tell a story that has no end?”", textPt: "“é verdade que você oferece um prêmio ao homem que conseguir contar uma história que não tem fim?”" },
    { start: 11.5, end: 13.5, textEng: "“It is true,” said The King.", textPt: "“É verdade,” disse o Rei." },
    { start: 14.0, end: 18.0, textEng: "“And will this man have your daughter for his wife, and will he be your heir?”", textPt: "“E irá este homem ter sua filha como esposa, e será ele (irá ele ser) seu herdeiro?”" },
    { start: 18.5, end: 22.5, textEng: "“Yes, if he succeeds,” said The King, “but if he fails, he will lose his head.”", textPt: "“Sim, se ele for bem-sucedido,” disse o Rei, “mas se ele falhar, ele vai perder sua cabeça.”" },
    { start: 23.0, end: 25.0, textEng: "“Very well, then,” said the Stranger.", textPt: "“Muito bem, então,” disse o Estranho." },
    { start: 25.5, end: 28.0, textEng: "“I have a pleasant story about locusts.”", textPt: "Eu tenho uma agradável história sobre gafanhotos.”" },
    { start: 28.5, end: 30.0, textEng: "“Tell it,” said The King.", textPt: "“Conte-a,” disse o Rei." },
    { start: 30.5, end: 32.0, textEng: "“I will listen to you.”", textPt: "“Eu vou te escutar.”" }
];

const transcricaoMod03Aula06 = [
    { start: 0.0, end: 4.0, textEng: "The storyteller began his story.", textPt: "O contador de histórias começou sua história." },
    { start: 4.1, end: 12.0, textEng: "“Once upon a time a certain king seized all the corn in his country, and stored it in a strong granary,", textPt: "“Uma vez (era uma vez) um certo rei confiscou todo o milho de seu país, e guardou-o em um forte celeiro," },
    { start: 12.1, end: 19.0, textEng: "but a swarm of locusts came over the land and saw where the grain was stored.", textPt: "mas um enxame de gafanhotos invadiu a terra e viu onde os grãos estavam guardados." },
    { start: 19.1, end: 28.0, textEng: "After searching for many days, the locusts found a small crack on the east side of the granary,", textPt: "Depois de procurar por muitos dias, os gafanhotos encontraram uma pequena rachadura no lado leste do celeiro," },
    { start: 28.1, end: 35.0, textEng: "but the opening was just large enough for one locust at a time to pass through.", textPt: "mas a abertura era apenas grande o bastante para um gafanhoto de cada vez passar." },
    { start: 35.1, end: 40.0, textEng: "So, one locust went in and carried away a grain of corn;", textPt: "Então, um gafanhoto entrou e levou um grão de milho;" },
    { start: 40.1, end: 45.0, textEng: "then another locust went in and carried away a grain of corn;", textPt: "então outro gafanhoto entrou e levou um grão de milho;" },
    { start: 45.1, end: 50.0, textEng: "then another locust went in and carried away a grain of corn.”", textPt: "então outro gafanhoto entrou e levou um grão de milho.”" }
];

const transcricaoMod03Aula07 = [
    { start: 0.5, end: 3.5, textEng: "Day after day, week after week,", textPt: "Dia após dia, semana após semana," },
    { start: 4.0, end: 6.5, textEng: "the Stranger kept on saying,", textPt: "o Estranho continuava dizendo," },
    { start: 7.0, end: 11.0, textEng: "“Then another locust went in and carried away a grain of corn.”", textPt: "“Então outro gafanhoto entrou e levou um grão de milho.”" },
    { start: 11.5, end: 14.0, textEng: "A month passed. A year passed.", textPt: "Um mês se passou. Um ano se passou." },
    { start: 14.5, end: 17.0, textEng: "After two years, The King asked,", textPt: "Depois de dois anos, o Rei perguntou," },
    { start: 17.5, end: 22.0, textEng: "“How much longer will the locusts be going in and carrying away corn?\"", textPt: "“Por quanto tempo mais os gafanhotos vão entrar e levar milho?”" },
    { start: 22.5, end: 24.5, textEng: "\"Oh, King!\" said the Stranger,", textPt: "“Ó, Rei!” disse o Estranho," },
    { start: 25.0, end: 29.0, textEng: "“the locusts have only cleared a few inches, and there are thousands of inches in the granary.\"", textPt: "“os gafanhotos removeram/liberaram apenas algumas polegadas, e há milhares de polegadas no celeiro.”" }
];

const transcricaoMod03Aula08 = [
    { start: 0.5, end: 3.0, textEng: "“Man, man!” cried The King,", textPt: "“Cara, cara!” gritou o Rei," },
    { start: 3.5, end: 5.5, textEng: "“You will drive me mad.", textPt: "“Você vai me enlouquecer." },
    { start: 6.0, end: 8.0, textEng: "I can listen to it no longer.", textPt: "Eu não posso mais escutar isso." },
    { start: 8.5, end: 13.5, textEng: "Take my daughter, be my heir, and rule my Kingdom,", textPt: "Leve minha filha, seja meu herdeiro e reine sobre meu Reino," },
    { start: 14.0, end: 18.0, textEng: "but do not let me hear another word about those incessant locusts!\"", textPt: "mas não me deixe ouvir outra palavra sobre aqueles gafanhotos intermináveis!”" },
    { start: 18.5, end: 22.5, textEng: "So, the Stranger married The King's daughter and lived happily in the land for many years;", textPt: "Então, o Estranho se casou com a filha do Rei e viveu feliz naquela terra por muitos anos;" },
    { start: 23.0, end: 27.5, textEng: "however, his father-in-law, The King, did not care to listen to any more stories.", textPt: "no entanto, seu sogro, o Rei, não queria mais ouvir quaisquer outras histórias." }
];

        // Define qual transcrição usar
        if (["m1a1", "m1a2", "m1a3", "m1a4", "m1a5", "m1a6"].includes(aulaId)) {
            legendasAula = transcricaoJackHannafordM1;
        } else if (aulaId === "m2a1" || aulaId === "m2a9" || aulaId === "m3a9") { // Aulas de M02 que são só vídeo
             transcricaoContainer.innerHTML = "<p>Esta aula é apenas instrucional em vídeo.</p>";
        } else if (aulaId === "m2a2") { 
            legendasAula = transcricaoMod02Aula02;
        } else if (aulaId === "m2a3") { 
            legendasAula = transcricaoMod02Aula03;
        } else if (aulaId === "m2a4") { // <-- ADICIONE ESTA CONDIÇÃO
        legendasAula = transcricaoMod02Aula04;
        } else if (aulaId === "m2a5") { // <-- ADICIONE ESTA CONDIÇÃO
        legendasAula = transcricaoMod02Aula05;
        } else if (aulaId === "m2a6") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod02Aula06;
        } else if (aulaId === "m2a7") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod02Aula07;
        } else if (aulaId === "m2a8") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod02Aula08;
        } else if (aulaId === "m3a1") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod03Aula01;
        } else if (aulaId === "m3a2") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod03Aula02;
        } else if (aulaId === "m3a3") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod03Aula03;
        } else if (aulaId === "m3a4") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod03Aula04;
        } else if (aulaId === "m3a5") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod03Aula05;
        } else if (aulaId === "m3a6") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod03Aula06;
        } else if (aulaId === "m3a7") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod03Aula07;
        } else if (aulaId === "m3a8") { // <-- NOVA CONDIÇÃO ADICIONADA
            legendasAula = transcricaoMod03Aula08;
            }

        // Adicione 'else if' para m2a4, m2a5, m2a6, m2a7, m2a8 quando tiver as transcrições
        else {
            transcricaoContainer.innerHTML = "<p>Transcrição não configurada para esta aula.</p>";
        } 

        // Renderiza as legendas e configura o 'timeupdate' listener
        if (legendasAula.length > 0) {
            let existingContent = transcricaoContainer.innerHTML;
            let needsPopulation = true;
            if (existingContent.includes("Carregando") || existingContent.includes("não disponível") || existingContent.includes("não configurada") || existingContent.includes("instrucional em vídeo")) {
                transcricaoContainer.innerHTML = ''; 
            } else if (transcricaoContainer.querySelectorAll('.legenda-linha').length > 0) {
                const primeiraLegendaRenderizada = transcricaoContainer.querySelector('.legenda-item');
                if(primeiraLegendaRenderizada && legendasAula.length > 0 && legendasAula[0] && primeiraLegendaRenderizada.textContent === legendasAula[0].textEng) {
                    needsPopulation = false; 
                } else {
                     transcricaoContainer.innerHTML = ''; 
                }
            }

            if (needsPopulation && legendasAula.length > 0) {
                legendasAula.forEach((item, index) => {
                    const divLinha = document.createElement('div');
                    divLinha.classList.add('legenda-linha');
                    const spanEng = document.createElement('span');
                    spanEng.classList.add('legenda-item', 'legenda-eng');
                    spanEng.dataset.start = item.start; spanEng.dataset.end = item.end; spanEng.dataset.index = index;
                    spanEng.textContent = item.textEng;
                    const spanPt = document.createElement('span');
                    spanPt.classList.add('legenda-item', 'legenda-pt');
                    spanPt.dataset.start = item.start; spanPt.dataset.end = item.end; spanPt.dataset.index = index;
                    spanPt.textContent = item.textPt;
                    divLinha.appendChild(spanEng); divLinha.appendChild(document.createElement('br')); divLinha.appendChild(spanPt);
                    transcricaoContainer.appendChild(divLinha);
                });
            }
        }
        
        const todosSpansLegenda = transcricaoContainer.querySelectorAll('.legenda-item');
        let ultimoSpanDestacado = null;

        if (todosSpansLegenda.length > 0 && audioPlayer) {
            audioPlayer.addEventListener('timeupdate', function() {
                if (!audioPlayer.paused && audioPlayer.duration > 0) { 
                    const tempoAtual = audioPlayer.currentTime;
                    let spanParaScroll = null;
                    let algumHighlight = false;
                    todosSpansLegenda.forEach(span => {
                        const start = parseFloat(span.dataset.start);
                        const end = parseFloat(span.dataset.end);
                        const index = span.dataset.index;
                        if (tempoAtual >= start && tempoAtual < end) {
                            document.querySelectorAll(`.legenda-item[data-index="${index}"]`).forEach(s => s.classList.add('highlight'));
                            if (span.classList.contains('legenda-eng') && span !== ultimoSpanDestacado) {
                                spanParaScroll = span;
                                ultimoSpanDestacado = span;
                            }
                            algumHighlight = true;
                        } else {
                            document.querySelectorAll(`.legenda-item[data-index="${index}"]`).forEach(s => s.classList.remove('highlight'));
                        }
                    });
                    if (spanParaScroll) {
                         spanParaScroll.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    }
                    if (!algumHighlight && ultimoSpanDestacado) { 
                        ultimoSpanDestacado = null;
                    }
                }
            });
        }
    }
});