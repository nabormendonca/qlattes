// const optionsPageButton = document.querySelector("#go-to-options");
// console.log(optionsPageButton);

// optionsPageButton.addEventListener("click", function(event) {
//     event.preventDefault();

//     if (chrome.runtime.openOptionsPage) {
//         chrome.runtime.openOptionsPage();
//         console.log("Switching to options page...");
//     } else {
//         window.open(chrome.runtime.getURL("options.html"));
//         console.log("Opening options page...");
//     }
// });

// open or switch to options page (no popup page!)

window.close();

if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
    console.log('Switching to options page...');
} else {
    window.open(chrome.runtime.getURL('options.html'));
    console.log('Opening options page...');
}
