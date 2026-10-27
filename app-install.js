(() => {
  let pendingInstall;
  const dialog = document.getElementById('appInstallDialog');
  const installButton = document.getElementById('appInstallButton');
  const status = document.getElementById('appInstallStatus');
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const reflectInstallation = () => {
    document.getElementById('install').hidden = standalone();
    if (standalone()) installButton.hidden = true;
  };
  document.getElementById('appGuideButton').addEventListener('click', () => dialog.showModal());
  document.getElementById('appGuideClose').addEventListener('click', () => dialog.close());
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    pendingInstall = event;
    installButton.hidden = false;
  });
  installButton.addEventListener('click', async () => {
    if (!pendingInstall) return;
    const prompt = pendingInstall;
    pendingInstall = null;
    installButton.hidden = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      status.textContent = choice.outcome === 'accepted'
        ? 'Installation requested. Follow your browser’s instructions to finish.'
        : 'You can install later using your browser’s menu.';
    } catch {
      status.textContent = 'Use the steps below to add Sachems to your home screen.';
    }
  });
  window.addEventListener('appinstalled', () => {
    pendingInstall = null;
    installButton.hidden = true;
    status.textContent = 'Sachems is installed. Look for the red Sachems logo icon on your device.';
    document.getElementById('install').hidden = true;
  });
  reflectInstallation();
  window.matchMedia('(display-mode: standalone)').addEventListener('change', reflectInstallation);
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {
      // The archive remains usable when a browser blocks service workers.
    });
  }
})();
