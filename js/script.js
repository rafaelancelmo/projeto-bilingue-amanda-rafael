// js/script.js
document.addEventListener('DOMContentLoaded', function () {
    console.log("Script global (script.js) para index.html carregado!");

    // Lógica para as abas de ETAPAS no index.html
    const etapaButtons = document.querySelectorAll('.etapas-navegacao-mv .btn-etapa-mv');
    const etapaPanels = document.querySelectorAll('.etapas-conteudo-mv .etapa-painel-mv');

    if (etapaButtons.length > 0 && etapaPanels.length > 0) {
        // Garantir que o primeiro painel esteja visível se marcado como active no HTML
        const activeEtapaPanelId = document.querySelector('.etapas-navegacao-mv .btn-etapa-mv.active')?.dataset.target;
        if (activeEtapaPanelId) {
            const activeEtapaPanel = document.getElementById(activeEtapaPanelId);
            if (activeEtapaPanel) activeEtapaPanel.style.display = 'block';
        }

        etapaButtons.forEach(button => {
            button.addEventListener('click', function() {
                etapaButtons.forEach(btn => btn.classList.remove('active'));
                etapaPanels.forEach(panel => {
                    panel.classList.remove('active');
                    panel.style.display = 'none'; // Esconde o painel
                });

                this.classList.add('active');
                const targetPanelId = this.getAttribute('data-target');
                const targetPanel = document.getElementById(targetPanelId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.style.display = 'block'; // Mostra o painel
                }
            });
        });
    }

    // --- LÓGICA DE PROGRESSO (Exemplo) ---
    const dadosDoCurso = {
        "m1": { totalAulas: 3, barraProgressoId: "progress-m1", textoProgressoId: "progress-text-m1" },
        "m2": { totalAulas: 5, barraProgressoId: "progress-m2", textoProgressoId: "progress-text-m2" }
    };
    let progressoUsuario = JSON.parse(localStorage.getItem('progressoProjetoBilingueAR')) || {};

    function inicializarProgresso() {
        let precisaSalvar = false;
        for (const moduloKey in dadosDoCurso) {
            if (!progressoUsuario[moduloKey]) {
                progressoUsuario[moduloKey] = [];
                precisaSalvar = true;
            }
        }
        if (precisaSalvar) localStorage.setItem('progressoProjetoBilingueAR', JSON.stringify(progressoUsuario));
    }

    window.marcarAulaComoConcluida = function(aulaId) {
        const moduloId = aulaId.substring(0, 2);
        if (progressoUsuario[moduloId] && !progressoUsuario[moduloId].includes(aulaId)) {
            progressoUsuario[moduloId].push(aulaId);
            localStorage.setItem('progressoProjetoBilingueAR', JSON.stringify(progressoUsuario));
            atualizarDisplayProgressoGeral(); // Atualiza barras no index.html
        }
    };

    window.desmarcarAulaComoConcluida = function(aulaId) {
        const moduloId = aulaId.substring(0, 2);
        if (progressoUsuario[moduloId]) {
            progressoUsuario[moduloId] = progressoUsuario[moduloId].filter(id => id !== aulaId);
            localStorage.setItem('progressoProjetoBilingueAR', JSON.stringify(progressoUsuario));
            atualizarDisplayProgressoGeral();
        }
    };

    function atualizarDisplayProgressoGeral() {
        let totalAulasConcluidasCurso = 0;
        let totalAulasNoCurso = 0;

        for (const moduloId in dadosDoCurso) { // "m1", "m2"
            const infoModulo = dadosDoCurso[moduloId];
            const aulasConcluidasNesteModulo = progressoUsuario[moduloId] ? progressoUsuario[moduloId].length : 0;
            
            totalAulasNoCurso += infoModulo.totalAulas;
            totalAulasConcluidasCurso += aulasConcluidasNesteModulo;

            const percentual = infoModulo.totalAulas > 0 ? (aulasConcluidasNesteModulo / infoModulo.totalAulas) * 100 : 0;

            const barraElemento = document.getElementById(infoModulo.barraProgressoId);
            const textoElemento = document.getElementById(infoModulo.textoProgressoId);

            if (barraElemento) barraElemento.style.width = percentual.toFixed(0) + '%';
            if (textoElemento) textoElemento.textContent = percentual.toFixed(0) + '%';
        }
        
        // Atualizar progresso geral no dashboard
        const percentualGeral = totalAulasNoCurso > 0 ? (totalAulasConcluidasCurso / totalAulasNoCurso) * 100 : 0;
        const barraTotalElDashboard = document.getElementById('barra-geral-total-dashboard');
        const textoTotalElDashboard = document.getElementById('progresso-geral-home-percent');
        
        if (barraTotalElDashboard) barraTotalElDashboard.style.width = percentualGeral.toFixed(0) + '%';
        if (textoTotalElDashboard) textoTotalElDashboard.textContent = percentualGeral.toFixed(0) + '%';
    }
    
    inicializarProgresso();
    if (document.querySelector('.dashboard-mv-container')) { // Se estiver na index.html
        atualizarDisplayProgressoGeral();
    }

    // Lógica para o checkbox na PÁGINA DA AULA
    const checkboxAula = document.querySelector('.marcar-concluida-mv-aula');
    if (checkboxAula) {
        const aulaIdPagina = document.querySelector('.pagina-aula-mv-layout').dataset.aulaId;
        const moduloIdPagina = aulaIdPagina.substring(0, 2);

        if (progressoUsuario[moduloIdPagina] && progressoUsuario[moduloIdPagina].includes(aulaIdPagina)) {
            checkboxAula.checked = true;
        }

        checkboxAula.addEventListener('change', function() {
            if (this.checked) {
                window.marcarAulaComoConcluida(aulaIdPagina);
            } else {
                window.desmarcarAulaComoConcluida(aulaIdPagina);
            }
        });
    }
});