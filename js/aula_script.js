// js/aula_script.js
document.addEventListener('DOMContentLoaded', function () {
    console.log("Script da página de aula (aula_script.js) carregado!");

    const tabButtons = document.querySelectorAll('.abas-mv-aula .btn-aba-mv');
    const tabPanels = document.querySelectorAll('.abas-mv-aula .painel-aba-mv');

    if (tabButtons.length > 0 && tabPanels.length > 0) {
        // Garante que o primeiro painel ativo no HTML seja exibido
        const activePanelOnLoad = document.querySelector('.paineis-abas-mv .painel-aba-mv.active');
        if (activePanelOnLoad) {
            activePanelOnLoad.style.display = 'block';
        }


        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    panel.style.display = 'none'; // Esconde todos os painéis
                });

                this.classList.add('active');
                const targetPanelId = this.getAttribute('data-target');
                const targetPanel = document.getElementById(targetPanelId);
                
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.style.display = 'block'; // Mostra o painel alvo
                } else {
                    console.error("Painel da aba não encontrado com ID:", targetPanelId);
                }
            });
        });
    }
});