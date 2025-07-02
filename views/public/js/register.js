document.getElementById('birthDate').max = new Date().toISOString().split('T')[0]; // Set today's date as the max value

document.getElementById('register-form').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent default form submission

  // Get the form data
  const name = document.getElementById('name').value;
  const birthDate = document.getElementById('birthDate').value;  // Get the birthDate value
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Get the value of the hidden role field
  const role = document.getElementById('role').value; // This is hidden, but its value will be "user"

  // Prepare the data to be sent to the backend
  const formData = {
    name,
    birthDate,
    email,
    password,
    role // Include role (which is "user" by default)
  };

  try {
    // Send the POST request to the backend
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      // If registration is successful, store the JWT token and redirect
      localStorage.setItem('authToken', result.token);
      window.location.href = '/tasks.html';  // Redirect to dashboard or home page
    } else {
      // Show error message if registration fails
      document.getElementById('error-msg').textContent = result.error || 'Registration failed';
    }
  } catch (error) {
    // Handle network errors
    document.getElementById('error-msg').textContent = 'An error occurred. Please try again.';
  }
});
