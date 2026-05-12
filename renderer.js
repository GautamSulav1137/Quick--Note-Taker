window.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('note');
  const saveBtn = document.getElementById('save');
  const statusEL = document.getElementById('status');
  const saveAsBtn = document.getElementById('save-as');
  const newNoteBtn = document.getElementById('new-note');
  const openFileBtn = document.getElementById('open-file');

  // Load existing note
  const savedNote = await window.electronAPI.loadNote();
  textarea.value = savedNote;

  let lastSavedText = textarea.value;
  //save button 
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
  //save as button
  saveAsBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.saveAs(textarea.value);
    if (result.success) {
      lastSavedText = textarea.value;
      statusEL.textContent = `Saved to:${result.filePath}`;
    } else {
      statusEL.textContent = 'Save  as cancelled';
    }
  });
  //new note button
  newNoteBtn.addEventListener('click', async () => {
    // If there are no unsaved changes, just clear the note
    if (textarea.value === lastSavedText) {
      textarea.value = '';
      lastSavedText = '';
      statusEL.textContent = 'New note started.';
      return;
    }
    const result = await window.electronAPI.newNote();
    if (result.confirmed) {
       textarea.value = '';
       lastSavedText = '';
       statusEL.textContent = 'New note started.';
    } else {
      statusEL.textContent = 'New note cancelled.';
    }
  });

  //open file button
  openFileBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.openFile();
    if (result.success) {
      textarea.value = result.content;
      lastSavedText = result.content;
      statusEL.textContent = `Opened file: ${result.filePath}`;
    } else {
      statusEL.textContent = 'Failed to open file';
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
    debounceTimer = setTimeout(autosave, 5000);
  });

});


