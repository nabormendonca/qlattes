// open or switch to options page (no popup!)
if (chrome.runtime.openOptionsPage) {
  chrome.runtime.openOptionsPage();
  console.log('Switching to options page...');
} else {
  window.open(chrome.runtime.getURL('html/options.html'));
  console.log('Opening options page...');
}

// close popup
window.close();
