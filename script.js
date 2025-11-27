function atualizarBordasCategorias() {
        if (rendaTotal > 0) {
            const metaEssencial = rendaTotal * 0.50;
            const percentEssencial = metaEssencial > 0 ? (gastosPorCategoria.essencial / metaEssencial) * 100 : 0;
            updateCircleProgress(circleEssencial, percentEssencial, 'var(--cor-essencial)');
            // [NOVO] Adiciona/remove classe de alerta
            percentEssencial > 100 ? circleEssencial.classList.add('over-budget') : circleEssencial.classList.remove('over-budget');

            const metaOpcional = rendaTotal * 0.30;
            const percentOpcional = metaOpcional > 0 ? (gastosPorCategoria.opcional / metaOpcional) * 100 : 0;
            updateCircleProgress(circleOpcional, percentOpcional, 'var(--cor-opcional)');
            // [NOVO] Adiciona/remove classe de alerta
            percentOpcional > 100 ? circleOpcional.classList.add('over-budget') : circleOpcional.classList.remove('over-budget');

            const metaInvestimento = rendaTotal * 0.20;
            const percentInvestimento = metaInvestimento > 0 ? (gastosPorCategoria.investimento / metaInvestimento) * 100 : 0;
            updateCircleProgress(circleInvestimento, percentInvestimento, 'var(--cor-investimento)');
            // [NOVO] Adiciona/remove classe de alerta
            percentInvestimento > 100 ? circleInvestimento.classList.add('over-budget') : circleInvestimento.classList.remove('over-budget');

        } else {
            [circleEssencial, circleOpcional, circleInvestimento].forEach(circle => {
                updateCircleProgress(circle, 0, 'var(--cor-borda-cinza)');
                circle.classList.remove('over-budget'); // [NOVO] Limpa ao resetar
            });
        }
    }