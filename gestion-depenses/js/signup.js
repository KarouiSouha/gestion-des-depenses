
App.setupPasswordToggle('togglePassword', 'password');

function showError(message) {
    const alertBox = document.getElementById('signupAlert');
    document.getElementById('signupAlertMsg').textContent = message;
    alertBox.classList.remove('d-none');
    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 3000);
}

document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password.length < 6) {
        showError('Le mot de passe doit contenir au moins 6 caractères.');
        return;
    }
    if (password !== confirmPassword) {
        showError('Les mots de passe ne correspondent pas.');
        return;
    }

    const result = App.register(name, email, password);
    if (result.ok) {
        window.location.href = 'dashboard.html';
    } else {
        showError(result.error);
    }
});

if (App.isLoggedIn()) {
    window.location.href = 'dashboard.html';
}