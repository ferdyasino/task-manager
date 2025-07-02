document.getElementById('login-form').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent default form submission

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const loginData = { email, password };

  try {
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();

    if (response.ok) {
      // Store the JWT token in localStorage
      localStorage.setItem('authToken', result.token);
      window.location.href = '/tasks.html';  // Redirect to another page after successful login
    } else {
      document.getElementById('error-msg').textContent = result.error || 'Invalid login credentials';
    }
  } catch (error) {
    document.getElementById('error-msg').textContent = 'An error occurred. Please try again.';
  }
});
