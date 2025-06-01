// js/script.js

// VERIFICAÇÃO DE LOGIN - DEVE SER A PRIMEIRA COISA NO SCRIPT
(function() {
    const isLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
    const isLoginPage = window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/login.html/');

    // Descobre o caminho base para login.html
    // Isso tenta lidar com o Live Server que pode servir de uma subpasta.
    let loginPath = 'login.html'; 
    // Se o script.js é carregado de uma página na raiz (como index.html), login.html também está na raiz.
    // Se script.js fosse carregado por uma página em /algumacoisa/pagina.html, o path precisaria ser '../login.html'
    // Mas como este script.js é para index.html (raiz), 'login.html' é o correto.

    if (!isLoggedIn && !isLoginPage) {
        console.log("Usuário não logado, redirecionando de script.js para:", loginPath);
        window.location.href = loginPath;
        // Impede a execução do restante do script se for redirecionar
        throw new Error("Redirecionando para login."); 
    }
})();
// FIM DA VERIFICAÇÃO DE LOGIN

// O restante do seu script.js continua aqui:
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
    console.log("Script global (script.js) carregado e usuário logado (ou na pág de login)!");
    // ... TODO o seu código existente do script.js (seleção de usuário, tema, abas de etapa, progresso) ...
    // COLE O CONTEÚDO COMPLETO DO SEU SCRIPT.JS DA ÚLTIMA RESPOSTA AQUI
});
document.addEventListener('DOMContentLoaded', function () {
    console.log("Script global (script.js) carregado!");

    const corpo = document.body;
    const userSelectionOverlay = document.getElementById('user-selection-overlay');
    const btnSelectRafael = document.getElementById('btn-select-rafael');
    const btnSelectAmanda = document.getElementById('btn-select-amanda');
    const userProfileHeaderDisplay = document.querySelector('header .user-profile-mv span'); 
    const welcomeMessageDashboardDisplay = document.querySelector('.bem-vindo-mv .info-usuario-mv h2'); 

    let currentUser = localStorage.getItem('currentUserProjetoBilingue');
    const baseStorageKeyProgresso = "progressoProjetoBilingueAR";

    function updateUserDisplay(userName) {
        const displayName = userName === 'rafael' ? 'Rafael Ancelmo' : (userName === 'amanda' ? 'Amanda Menezes' : 'Usuário');
        const firstName = displayName.split(' ')[0];

        if (userProfileHeaderDisplay) {
            userProfileHeaderDisplay.textContent = `Bem vindo(a), ${firstName}!`;
        }
        if (welcomeMessageDashboardDisplay) {
            welcomeMessageDashboardDisplay.textContent = `Bem-vindo(a), ${displayName}!`;
        }
    }

    function selectUser(userName) {
        currentUser = userName;
        localStorage.setItem('currentUserProjetoBilingue', currentUser);
        if (userSelectionOverlay) {
            userSelectionOverlay.classList.add('hidden');
        }
        corpo.style.overflow = 'auto';
        updateUserDisplay(currentUser);
        
        // Garante que o progresso e as anotações sejam (re)carregados para o usuário selecionado
        if (typeof inicializarProgressoStorage === "function") inicializarProgressoStorage();
        if (typeof atualizarDisplayProgressoGeral === "function" && document.querySelector('.dashboard-mv-container')) {
             atualizarDisplayProgressoGeral();
        }

        if (typeof window.carregarAnotacoes === "function") {
            const aulaId = document.querySelector('.pagina-aula-mv-layout')?.dataset.aulaId;
            if (aulaId) {
                window.carregarAnotacoes(aulaId);
            }
        }
        const checkboxAulaAtual = document.querySelector('.marcar-concluida-mv-aula');
        const aulaIdPaginaLayout = document.querySelector('.pagina-aula-mv-layout');
        if (checkboxAulaAtual && aulaIdPaginaLayout) { 
            const aulaId = aulaIdPaginaLayout.dataset.aulaId;
            const moduloId = aulaId.substring(0,2);
            const progressoDoUsuarioAtual = JSON.parse(localStorage.getItem(getCurrentUserStorageKeyProgresso())) || {};
            progressoDoUsuarioAtual[moduloId] = progressoDoUsuarioAtual[moduloId] || []; // Garante que o array do módulo existe
            checkboxAulaAtual.checked = !!(progressoDoUsuarioAtual[moduloId].includes(aulaId));
        }
    }

    if (userSelectionOverlay) {
        if (!currentUser) {
            userSelectionOverlay.classList.remove('hidden');
            corpo.style.overflow = 'hidden';
        } else {
            userSelectionOverlay.classList.add('hidden');
            updateUserDisplay(currentUser);
        }
    }

    if (btnSelectRafael) {
        btnSelectRafael.addEventListener('click', () => selectUser('rafael'));
    }
    if (btnSelectAmanda) {
        btnSelectAmanda.addEventListener('click', () => selectUser('amanda'));
    }

    // --- LÓGICA PARA TEMA ESCURO/CLARO ---
    // Garante que os seletores peguem os botões corretos em qualquer página
    const btnToggleTemaPrincipal = document.getElementById('btn-toggle-tema');
    const btnToggleTemaAulaPage = document.getElementById('btn-toggle-tema-aula');

    function aplicarTemaSalvo() {
        const temaSalvo = localStorage.getItem('temaProjetoBilingue');
        corpo.classList.remove('tema-claro', 'tema-escuro');
        if (temaSalvo) {
            corpo.classList.add(temaSalvo);
        } else {
            corpo.classList.add('tema-claro');
        }
    }

    function alternarTema() {
        if (corpo.classList.contains('tema-claro')) {
            corpo.classList.replace('tema-claro', 'tema-escuro');
            localStorage.setItem('temaProjetoBilingue', 'tema-escuro');
        } else {
            corpo.classList.replace('tema-escuro', 'tema-claro');
            localStorage.setItem('temaProjetoBilingue', 'tema-claro');
        }
    }

    if (btnToggleTemaPrincipal) { // Botão da index.html
        btnToggleTemaPrincipal.addEventListener('click', alternarTema);
    }
    if (btnToggleTemaAulaPage) { // Botão das páginas de aula
        btnToggleTemaAulaPage.addEventListener('click', alternarTema);
    }
    aplicarTemaSalvo();


    // --- LÓGICA PARA ABAS DE ETAPAS NO INDEX.HTML ---
    const etapaButtons = document.querySelectorAll('.etapas-navegacao-mv .btn-etapa-mv');
    const etapaPanels = document.querySelectorAll('.etapas-conteudo-mv .etapa-painel-mv');
    if (etapaButtons.length > 0 && etapaPanels.length > 0) {
        const activeEtapaButtonHTML = document.querySelector('.etapas-navegacao-mv .btn-etapa-mv.active');
        let activeEtapaPanelId = activeEtapaButtonHTML ? activeEtapaButtonHTML.dataset.target : null;

        etapaPanels.forEach(panel => panel.style.display = 'none'); // Esconde todos primeiro

        if (activeEtapaPanelId) {
            const activeEtapaPanel = document.getElementById(activeEtapaPanelId);
            if (activeEtapaPanel) activeEtapaPanel.style.display = 'block';
        } else { // Se nenhum botão está ativo no HTML, ativa o primeiro
            etapaButtons[0].classList.add('active');
            activeEtapaPanelId = etapaButtons[0].getAttribute('data-target');
            const firstPanel = document.getElementById(activeEtapaPanelId);
            if (firstPanel) {
                 firstPanel.classList.add('active'); // Adiciona active ao painel também
                 firstPanel.style.display = 'block';
            }
        }
        
        etapaButtons.forEach(button => {
            button.addEventListener('click', function() {
                etapaButtons.forEach(btn => btn.classList.remove('active'));
                etapaPanels.forEach(panel => { panel.classList.remove('active'); panel.style.display = 'none'; });
                this.classList.add('active');
                const targetPanelId = this.getAttribute('data-target');
                const targetPanel = document.getElementById(targetPanelId);
                if (targetPanel) { targetPanel.classList.add('active'); targetPanel.style.display = 'block'; }
            });
        });
    }

    // --- LÓGICA DE PROGRESSO ---
    const dadosDoCurso = {
        "m1": { totalAulas: 6, cardHomeBarraId: "barra-m1-card-home", cardHomeAulasTextoId: "aulas-m1-card-home", cardHomePercentTextoId: "percent-m1-card-home", cardGridBarraId: "prog-m1-card" },
        "m2": { totalAulas: 9, cardGridBarraId: "prog-m2-card" },
        "m3": { totalAulas: 9, cardGridBarraId: "prog-m3-card" }, // ATUALIZADO: Módulo 03 com 9 aulas
        "m4": { totalAulas: 0, cardGridBarraId: "prog-m4-card" },
        "m5": { totalAulas: 0, cardGridBarraId: "prog-m5-card" },
        "m6": { totalAulas: 0, cardGridBarraId: "prog-m6-card" },
        "m7": { totalAulas: 0, cardGridBarraId: "prog-m7-card" },
        "m8": { totalAulas: 0, cardGridBarraId: "prog-m8-card" },
        "m9": { totalAulas: 0, cardGridBarraId: "prog-m9-card" },
        "m10": { totalAulas: 0, cardGridBarraId: "prog-m10-card" },
        "m11": { totalAulas: 0, cardGridBarraId: "prog-m11-card" },
        "m12": { totalAulas: 0, cardGridBarraId: "prog-m12-card" },
        "m13": { totalAulas: 0, cardGridBarraId: "prog-m13-card" },
        "m14": { totalAulas: 0, cardGridBarraId: "prog-m14-card" },
        "m15": { totalAulas: 0, cardGridBarraId: "prog-m15-card" },
        "m16": { totalAulas: 0, cardGridBarraId: "prog-m16-card" },
        "m17": { totalAulas: 0, cardGridBarraId: "prog-m17-card" },
        "m18": { totalAulas: 0, cardGridBarraId: "prog-m18-card" },
        "m19": { totalAulas: 0, cardGridBarraId: "prog-m19-card" },
        "m20": { totalAulas: 0, cardGridBarraId: "prog-m20-card" },
        "m21": { totalAulas: 0, cardGridBarraId: "prog-m21-card" },
        "m22": { totalAulas: 0, cardGridBarraId: "prog-m22-card" },
        "m23": { totalAulas: 0, cardGridBarraId: "prog-m23-card" }
    };
    let progressoUsuario = {}; 

    function getCurrentUserStorageKeyProgresso() {
        if (!currentUser) return null;
        return `${baseStorageKeyProgresso}_${currentUser}`;
    }
    
    function carregarProgressoUsuario() {
        const userStorageKey = getCurrentUserStorageKeyProgresso();
        if (!userStorageKey) {
            progressoUsuario = {}; 
            return;
        }
        progressoUsuario = JSON.parse(localStorage.getItem(userStorageKey)) || {};
    }

    function salvarProgressoUsuario() {
        const userStorageKey = getCurrentUserStorageKeyProgresso();
        if (!userStorageKey) return;
        localStorage.setItem(userStorageKey, JSON.stringify(progressoUsuario));
    }

    function inicializarProgressoStorage() {
        carregarProgressoUsuario(); 
        let precisaSalvar = false;
        for (const moduloIdKey in dadosDoCurso) {
            if (!progressoUsuario.hasOwnProperty(moduloIdKey)) {
                progressoUsuario[moduloIdKey] = [];
                precisaSalvar = true;
            }
        }
        if (precisaSalvar) {
            salvarProgressoUsuario();
        }
    }

    window.marcarAulaComoConcluida = function(aulaIdCompleto) {
        if (!currentUser) { alert("Por favor, selecione um usuário para salvar seu progresso!"); return; }
        const moduloId = aulaIdCompleto.substring(0, 2);
        inicializarProgressoStorage(); 
        if (!progressoUsuario[moduloId]) progressoUsuario[moduloId] = []; 
        
        if (!progressoUsuario[moduloId].includes(aulaIdCompleto)) {
            progressoUsuario[moduloId].push(aulaIdCompleto);
            salvarProgressoUsuario();
            if (document.querySelector('.dashboard-mv-container')) atualizarDisplayProgressoGeral();
        }
    };

    window.desmarcarAulaComoConcluida = function(aulaIdCompleto) {
        if (!currentUser) return;
        const moduloId = aulaIdCompleto.substring(0, 2);
        inicializarProgressoStorage();
        if (progressoUsuario[moduloId]) {
            progressoUsuario[moduloId] = progressoUsuario[moduloId].filter(aula => aula !== aulaIdCompleto);
            salvarProgressoUsuario();
            if (document.querySelector('.dashboard-mv-container')) atualizarDisplayProgressoGeral();
        }
    };

    function atualizarDisplayProgressoGeral() {
        if (!currentUser && document.querySelector('.dashboard-mv-container')) {
            // Zera as barras se nenhum usuário estiver selecionado na home
            for (const moduloId in dadosDoCurso) {
                const infoModuloSistema = dadosDoCurso[moduloId];
                if (infoModuloSistema.cardHomeBarraId) {
                    const el = document.getElementById(infoModuloSistema.cardHomeBarraId); if (el) el.style.width = '0%';}
                if (infoModuloSistema.cardHomeAulasTextoId) {
                    const el = document.getElementById(infoModuloSistema.cardHomeAulasTextoId); if (el) el.textContent = `0/${infoModuloSistema.totalAulas || '?'}`;}
                if (infoModuloSistema.cardHomePercentTextoId) {
                    const el = document.getElementById(infoModuloSistema.cardHomePercentTextoId); if (el) el.textContent = '0%';}
                if (infoModuloSistema.cardGridBarraId) {
                    const el = document.getElementById(infoModuloSistema.cardGridBarraId); if (el) el.style.width = '0%';}
            }
            const barraTotalEl = document.getElementById('progresso-geral-home-bar');
            const textoTotalEl = document.getElementById('progresso-geral-home-percent');
            if (barraTotalEl) barraTotalEl.style.width = '0%';
            if (textoTotalEl) textoTotalEl.textContent = '0%';
            return;
        }
        
        if (!currentUser) return; // Não prossegue se não há usuário (relevante para pág de aula)

        carregarProgressoUsuario();
        let totalAulasConcluidasCurso = 0;
        let totalAulasNoCurso = 0;

        for (const moduloId in dadosDoCurso) {
            const infoModuloSistema = dadosDoCurso[moduloId];
            const aulasConcluidasNesteModulo = progressoUsuario[moduloId] ? progressoUsuario[moduloId].length : 0;
            totalAulasNoCurso += infoModuloSistema.totalAulas;
            totalAulasConcluidasCurso += aulasConcluidasNesteModulo;
            const percentualModulo = infoModuloSistema.totalAulas > 0 ? (aulasConcluidasNesteModulo / infoModuloSistema.totalAulas) * 100 : 0;
            
            // Card "Comece Aqui"
            if (infoModuloSistema.cardHomeBarraId) {
                const elBarraHome = document.getElementById(infoModuloSistema.cardHomeBarraId);
                if (elBarraHome) elBarraHome.style.width = percentualModulo.toFixed(0) + '%';
            }
            if (infoModuloSistema.cardHomeAulasTextoId) {
                const elAulasHome = document.getElementById(infoModuloSistema.cardHomeAulasTextoId);
                if (elAulasHome) elAulasHome.textContent = `${aulasConcluidasNesteModulo}/${infoModuloSistema.totalAulas}`;
            }
            if (infoModuloSistema.cardHomePercentTextoId) {
                const elPercentHome = document.getElementById(infoModuloSistema.cardHomePercentTextoId);
                if (elPercentHome) elPercentHome.textContent = percentualModulo.toFixed(0) + '%';
            }
            // Card do Módulo na Grade
            if (infoModuloSistema.cardGridBarraId) {
                const elBarraGrid = document.getElementById(infoModuloSistema.cardGridBarraId);
                if (elBarraGrid) elBarraGrid.style.width = percentualModulo.toFixed(0) + '%';
            }
        }
        const percentualGeral = totalAulasNoCurso > 0 ? (totalAulasConcluidasCurso / totalAulasNoCurso) * 100 : 0;
        const barraTotalElDashboard = document.getElementById('progresso-geral-home-bar');
        const textoTotalElDashboard = document.getElementById('progresso-geral-home-percent');
        if (barraTotalElDashboard) barraTotalElDashboard.style.width = percentualGeral.toFixed(0) + '%';
        if (textoTotalElDashboard) textoTotalElDashboard.textContent = percentualGeral.toFixed(0) + '%';
    }
    
    const checkboxAula = document.querySelector('.marcar-concluida-mv-aula');
    if (checkboxAula) { // Só executa esta parte se estiver numa página de aula
        const aulaIdPagina = document.querySelector('.pagina-aula-mv-layout').dataset.aulaId;
        if (currentUser) {
            const moduloIdPagina = aulaIdPagina.substring(0, 2);
            carregarProgressoUsuario();
            // Garante que progressoUsuario[moduloIdPagina] é um array
            progressoUsuario[moduloIdPagina] = progressoUsuario[moduloIdPagina] || [];
            checkboxAula.checked = progressoUsuario[moduloIdPagina].includes(aulaIdPagina);
        } else {
            checkboxAula.checked = false; 
        }
        checkboxAula.addEventListener('change', function() {
            if (this.checked) {
                window.marcarAulaComoConcluida(aulaIdPagina);
            } else {
                window.desmarcarAulaComoConcluida(aulaIdPagina);
            }
        });
    }
    
    // Condição inicial para carregar progresso na home ou atualizar display se usuário for selecionado
    if (document.querySelector('.dashboard-mv-container')) { // Se é a index.html
        if (currentUser) {
            inicializarProgressoStorage(); 
            atualizarDisplayProgressoGeral();
        } else {
            // Overlay de seleção de usuário deve estar visível, barras devem estar zeradas
             atualizarDisplayProgressoGeral(); // Chamada para zerar visualmente
        }
    }
});