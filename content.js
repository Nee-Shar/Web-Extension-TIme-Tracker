//runs in bg of page we are on
//and listento background.js
console.log("Content script running");

chrome.runtime.sendMessage(
  { message: "content script has loaded" },
  function (response) {
    console.log(response.message);
  }
);
