App.setupPasswordToggle('togglePassword', 'password');

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const result = await App.login(email, password);
    if (result.ok) {
        window.location.href = 'dashboard.html';
    } else {
        const alertBox = document.getElementById('loginAlert');
        alertBox.classList.remove('d-none');
        setTimeout(() => {
            alertBox.classList.add('d-none');
        }, 3000);
    }
});

// Si une session est déjà active, on saute directement au dashboard.
App.redirectIfLoggedIn();