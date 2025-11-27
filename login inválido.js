function handleLogin(e) {
        e.preventDefault();
        const identifier = loginIdentifierInput.value;
        const password = loginPasswordInput.value;

        let users = JSON.parse(localStorage.getItem(USERS_DB_KEY)) || [];

        const user = users.find(user =>
            (user.email === identifier || user.username === identifier)
        );

        if (user && user.password === password) {
            // SUCESSO!
            // Esta linha abaixo é a que faz a tela de login sumir
            // e o app principal aparecer.
            showAppScreen(user.username);
        } else {
            // Falha
            loginError.textContent = 'Email, usuário ou senha inválidos.';
        }
    }