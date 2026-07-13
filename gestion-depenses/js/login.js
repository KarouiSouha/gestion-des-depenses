
App.setupPasswordToggle('togglePassword', 'password');

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (App.login(email, password)) {
        window.location.href = 'dashboard.html';
    } else {
        const alertBox = document.getElementById('loginAlert');
        alertBox.classList.remove('d-none');
        setTimeout(() => {
            alertBox.classList.add('d-none');
        }, 3000);
    }
});

if (App.isLoggedIn()) {
    window.location.href = 'dashboard.html';
}