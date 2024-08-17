document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");
  const countDisplay = document.getElementById("count");
  const disclaimer = document.getElementById("disclaimer");
  const disclaimerText = document.getElementById("disclaimerText");

  async function updateButtonCount() {
    const tabId = await getCurrentTabId();
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: function () {
        const buttons = Array.from(document.querySelectorAll("button")).filter(
          (button) => button.textContent.trim() === "Remove"
        );
        chrome.runtime.sendMessage({ type: "count", count: buttons.length });
      },
    });
  }

  startButton.addEventListener("click", async function () {
    startButton.disabled = true;
    stopButton.disabled = false;

    const tabId = await getCurrentTabId();
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: function () {
        let intervalId;
        const buttons = Array.from(document.querySelectorAll("button")).filter(
          (button) => button.textContent.trim() === "Remove"
        );

        if (buttons.length === 0) {
          console.log("No 'Remove' buttons found.");
          chrome.runtime.sendMessage("finished");
          return;
        }

        console.log(`Found ${buttons.length} 'Remove' buttons.`);
        let startTime = Date.now();
        let index = 0;

        function clickButton() {
          if (index < buttons.length) {
            buttons[index].click();
            index++;
          } else {
            clearInterval(intervalId);
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(
              `Finished clicking buttons. Total elapsed time: ${elapsedTime} seconds.`
            );
            chrome.runtime.sendMessage("finished");
          }
        }

        intervalId = setInterval(clickButton, 1300);
      },
    });
  });

  stopButton.addEventListener("click", async function () {
    const tabId = await getCurrentTabId();
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: function () {
        clearInterval(intervalId);
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
          `Script stopped manually. Total elapsed time: ${elapsedTime} seconds.`
        );
        chrome.runtime.sendMessage("finished");
      },
    });
  });

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request === "finished") {
      startButton.disabled = false;
      stopButton.disabled = true;
    }
    if (request.type === "count") {
      countDisplay.textContent = request.count;
    }
  });

  disclaimer.addEventListener("click", function () {
    disclaimerText.style.display =
      disclaimerText.style.display === "none" ? "block" : "none";
  });

  function getCurrentTabId() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        resolve(tabs[0].id);
      });
    });
  }

  // Update the button count whenever the popup opens
  updateButtonCount();
});
