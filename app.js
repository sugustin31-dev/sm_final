document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
  const form = document.getElementById('comment-form');
  const nameInput = document.getElementById('name');
  const messageInput = document.getElementById('message');
  const ratingSelect = document.getElementById('rating');
  const submitBtn = document.getElementById('submit-btn');
  const errorMsg = document.getElementById('error-msg');
  const container = document.getElementById('comments-container');

  async function loadComments() {
    try {
      const res = await fetch('api/comments.php');
      if (!res.ok) throw new Error('Error al cargar comentarios');
      const comments = await res.json();
      renderComments(comments);
    } catch (err) {
      showError(err.message);
    }
  }

  function renderComments(comments) {
    if (!comments.length) {
      container.innerHTML = '<p class="empty-feed">No hay comentarios aún. ¡Sé el primero!</p>';
      return;
    }

    container.innerHTML = comments.map(c => `
      <div class="comment">
        <span class="name">${escapeHtml(c.name)}</span>
        <span class="date">${formatDate(c.created_at)}</span>
        <span class="stars">${renderStars(c.rating)}</span>
        <p class="message">${escapeHtml(c.message)}</p>
      </div>
    `).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderStars(rating) {
    const full = '★'.repeat(rating);
    const empty = '☆'.repeat(5 - rating);
    return full + empty;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr.replace(' ', 'T'));
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  }

  function hideError() {
    errorMsg.classList.add('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const rating = parseInt(ratingSelect.value, 10);

    if (!name || !message || !rating) {
      showError('Completá todos los campos.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      const res = await fetch('api/comment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, rating }),
      });

      const data = await res.json();

      if (!data.success) {
        showError(data.error || 'Error al enviar comentario');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar';
        return;
      }

      form.reset();
      await loadComments();
    } catch (err) {
      showError('Error de conexión. Intentalo de nuevo.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
    }
  });

  loadComments();
});
