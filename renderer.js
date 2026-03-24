window.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('note');
  const saveBtn = document.getElementById('save');
  const statusEL = document.getElementById('save_+status');

  // Load existing note
  const savedNote = await window.electronAPI.loadNote();
  textarea.value = savedNote;

  let lastSavedText = textarea.value;

  saveBtn.addEventListener('click', async () => {
    try {
      await window.electronAPI.saveNote(textarea.value);
      lastSavedText = textarea.value;
      alert('Note saved successfully!');
      if (statusEL) statusEL.textContent = 'Manually saved!';
    } catch (err) {
      console.error('Manual save failed:', err);
      if (statusEL) statusEL.textContent = 'Save failed – check console';
    }
  });

  let debounceTimer;
  async function autosave() {
    const currentText = textarea.value;
    if (currentText === lastSavedText) {
      if (statusEL) statusEL.textContent = 'No changes – already saved';
      return;
    }
    try {
      await window.electronAPI.saveNote(currentText);
      lastSavedText = currentText;
      const now = new Date().toLocaleTimeString();
      if (statusEL) statusEL.textContent = `Auto-saved at ${now}`;
    } catch (err) {
      console.error('Auto-save failed:', err);
      if (statusEL) statusEL.textContent = 'Auto-save error – check console';
    }
  }

  textarea.addEventListener('input', () => {
    if (statusEL) statusEL.textContent = 'Changes detected – auto-save in 5s...';
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(autosave, 5);
  });
});
