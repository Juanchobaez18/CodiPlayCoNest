const form = document.getElementById('contact-form');
const messageBox = document.getElementById('form-message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageBox.className = 'form-message';
  messageBox.textContent = '';

  const formData = new FormData(form);
  const payload = {
    name: formData.get('name')?.toString().trim(),
    email: formData.get('email')?.toString().trim(),
    phone: formData.get('phone')?.toString().trim(),
    message: formData.get('message')?.toString().trim(),
  };

  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'No se pudo enviar la solicitud.');
    }

    messageBox.classList.add('success');
    messageBox.textContent = '¡Gracias! Te enviaremos un correo confirmando que te contactaremos para una clase gratis.';
    form.reset();
  } catch (error) {
    messageBox.classList.add('error');
    messageBox.textContent = error.message || 'Ocurrió un error al enviar el formulario.';
  }
});
