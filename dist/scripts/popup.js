// // open or switch to options page (no popup!)
// if (chrome.runtime.openOptionsPage) {
//   chrome.runtime.openOptionsPage();
//   console.log('Switching to options page...');
// } else {
//   window.open(chrome.runtime.getURL('html/options.html'));
//   console.log('Opening options page...');
// }

// open a new visualization page
window.open(chrome.runtime.getURL('html/visualization.html'));

// close popup
window.close();
