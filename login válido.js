function showAppScreen(username) {
        // ... (outros códigos de login) ...

        loginContainer.style.display = 'none'; // <-- ESCONDE A TELA DE LOGIN
        mainContainer.style.display = 'block'; // <-- MOSTRA O SEU APP
        btnLogout.style.display = 'block';
        welcomeMessage.textContent = `Olá, ${username}!`;

        loadData(); // Carrega os dados do usuário
        // ... (outros códigos) ...
    }