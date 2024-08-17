let intervalId;
let startTime;

function startClicking() {
  const buttons = Array.from(document.querySelectorAll("button")).filter(
    (button) => button.textContent.trim() === "Remove"
  );

  chrome.runtime.sendMessage({ type: "count", count: buttons.length });

  if (buttons.length === 0) {
    logToConsole("No 'Remove' buttons found.");
    chrome.runtime.sendMessage("finished");
    return;
  }

  logToConsole(`Found ${buttons.length} 'Remove' buttons.`);
  startTime = Date.now();
  let index = 0;

  function clickButton() {
    if (index < buttons.length) {
      buttons[index].click();
      index++;
    } else {
      clearInterval(intervalId);
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      logToConsole(
        `Finished clicking buttons. Total elapsed time: ${elapsedTime} seconds.`
      );
      chrome.runtime.sendMessage("finished");
    }
  }

  intervalId = setInterval(clickButton, 1300);
}

function stopClicking() {
  if (intervalId) {
    clearInterval(intervalId);
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    logToConsole(
      `Script stopped manually. Total elapsed time: ${elapsedTime} seconds.`
    );
    chrome.runtime.sendMessage("finished");
  }
}

function logToConsole(message) {
  console.log(message);
}

function countButtons() {
  const buttons = Array.from(document.querySelectorAll("button")).filter(
    (button) => button.textContent.trim() === "Remove"
  );

  chrome.runtime.sendMessage({ type: "count", count: buttons.length });
}
