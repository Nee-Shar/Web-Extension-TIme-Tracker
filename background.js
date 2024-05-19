chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Check if the message contains action to store restricted sites
  if (message.action === "storeRestrictedSites") {
    // Get the restricted sites data from the message
    const restrictedSites = message.sites;

    // Store the restricted sites data in Chrome storage local
    chrome.storage.local.set({ restrictedSites: restrictedSites }, function () {
      if (chrome.runtime.lastError) {
        console.error(
          "Error storing restricted sites:",
          chrome.runtime.lastError.message
        );
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
      } else {
        console.log("Restricted sites stored successfully");
        sendResponse({ success: true });
      }
    });

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});

function isValidURL(givenURL) {
  if (givenURL) {
    if (givenURL.includes(".")) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

let isTracking = false;

// Message listener for handling button clicks from popup.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "startTracking") {
    console.log(Date.now());
    startTracking();
  } else if (message.action === "stopTracking") {
    stopTracking();
  }
});

function secondsToString(seconds, compressed = false) {
  let hours = parseInt(seconds / 3600);
  seconds = seconds % 3600;
  let minutes = parseInt(seconds / 60);
  seconds = seconds % 60;
  let timeString = "";
  if (hours) {
    timeString += hours + " hrs ";
  }
  if (minutes) {
    timeString += minutes + " min ";
  }
  if (seconds) {
    timeString += seconds + " sec ";
  }
  if (!compressed) {
    return timeString;
  } else {
    if (hours) {
      return `${hours}h`;
    }
    if (minutes) {
      return `${minutes}m`;
    }
    if (seconds) {
      return `${seconds}s`;
    }
  }
}

function getDateString(nDate) {
  let nDateDate = nDate.getDate();
  let nDateMonth = nDate.getMonth() + 1;
  let nDateYear = nDate.getFullYear();
  if (nDateDate < 10) {
    nDateDate = "0" + nDateDate;
  }
  if (nDateMonth < 10) {
    nDateMonth = "0" + nDateMonth;
  }
  let presentDate = nDateYear + "-" + nDateMonth + "-" + nDateDate;
  return presentDate;
}
function getDomain(tablink) {
  if (tablink) {
    let url = tablink[0].url;
    return url.split("/")[2];
  } else {
    return null;
  }
}
function startTracking() {
  isTracking = true;
  console.log("Started Tracking");
  updateTime();
}
function stopTracking() {
  isTracking = false;
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url) {
    chrome.storage.local.get("restrictedSites", function (result) {
      if (result.restrictedSites) {
        let restrictedSites = result.restrictedSites;
        for (let restrictedSite of restrictedSites) {
          if (tab.url.includes(restrictedSite)) {
            chrome.tabs.remove(tabId, function () {
              window.location.href = "limitended.html";
              if (chrome.runtime.lastError) {
                console.error("Error removing tab:", chrome.runtime.lastError);
              } else {
                console.log("Closed tab with restricted URL:", tab.url);
              }
            });
            break;
          }
        }
      }
    });
  }
});

function updateTime() {
  if (isTracking) {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      function (activeTab) {
        let domain = getDomain(activeTab);
        if (isValidURL(domain)) {
          let today = new Date();
          let presentDate = getDateString(today);
          let myObj = {};
          myObj[presentDate] = {};
          myObj[presentDate][domain] = "";
          let timeSoFar = 0;
          chrome.storage.local.get(presentDate, function (storedObject) {
            if (storedObject[presentDate]) {
              if (storedObject[presentDate][domain]) {
                timeSoFar = storedObject[presentDate][domain] + 1;
                storedObject[presentDate][domain] = timeSoFar;
                chrome.storage.local.set(storedObject, function () {
                  console.log(
                    "Set " + domain + " at " + storedObject[presentDate][domain]
                  );
                  chrome.browserAction.setBadgeText({
                    text: timeSoFar,
                  });
                });
              } else {
                timeSoFar++;
                storedObject[presentDate][domain] = timeSoFar;
                chrome.storage.local.set(storedObject, function () {
                  console.log(
                    "Set " + domain + " at " + storedObject[presentDate][domain]
                  );
                  chrome.browserAction.setBadgeText({
                    text: timeSoFar,
                  });
                });
              }
            } else {
              timeSoFar++;
              storedObject[presentDate] = {};
              storedObject[presentDate][domain] = timeSoFar;
              chrome.storage.local.set(storedObject, function () {
                console.log(
                  "Set " + domain + " at " + storedObject[presentDate][domain]
                );
                chrome.browserAction.setBadgeText({
                  text: timeSoFar,
                });
              });
            }
          });
        } else {
          chrome.browserAction.setBadgeText({ text: "" });
        }
      }
    );
  }
}

var intervalID;

intervalID = setInterval(updateTime, 1000);
setInterval(checkFocus, 500);

function checkFocus() {
  chrome.windows.getCurrent(function (window) {
    if (window.focused) {
      if (!intervalID) {
        intervalID = setInterval(updateTime, 1000);
      }
    } else {
      if (intervalID) {
        clearInterval(intervalID);
        intervalID = null;
      }
    }
  });
}

// Adding support for time limits sites
// Set up a objects to store the visit counts for each website
var visitCounts = {};
var timeLimits = {};
var visitLimits = {};
var timers = {};
var lastHandle = {};

// Extaract the hostname from URL
function extractHostname(url) {
  var url = new URL(url);
  var hostname = url.hostname;
  if (hostname.startsWith("www.")) {
    return hostname.substring(4);
  }
  return hostname;
}

// Set up a listener for when the new tab is opened
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // The `changeInfo` object contains information about the changes to the tab.
  // Check if pendingUrl is undefined - when it is NOT new tab
  //if (typeof changeInfo.url !== 'undefined'){
  try {
    var hostname = extractHostname(changeInfo.url);
    //console.log(`tab: ${tab} changeInfo.url: ${changeInfo.url} hostname ${hostname}` )
    // console.log(
    //   `Tab with id: ${tabId} was updated. New url: ${changeInfo.url}`
    // );
    // DEBUG console.log("tab changed hostname extractHostname: ",hostname, "call handleHostname..")
    // Delete timer on this tab if exist
    if (timers[tabId] && lastHandle[tabId] != hostname) {
      clearTimeout(timers[tabId]);
      delete timers[tabId];
      //console.log(`clear timout on tabId: ${tabId}`);
    }
    handleHostname(hostname, tabId);
  } catch (error) {
    // console.log("Can't handle in onUpdated:", error);
    //console.log("The problematic URL: ", changeInfo);
  }
  /*	}
	else
	// It is a new tab. can escape
	{console.log("new tab from onUpdated");
	console.log("changeInfo: ", changeInfo);
	return;}*/
});

// Set up a listener for when the active tab in the browser changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Get the URL of the active tab
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    // check if pendingUrl is undefined - when it is NOT new tab
    if (typeof tab.pendingUrl == "undefined") {
      //console.log("tab.url.pendingUrl == 'undefined'")
      //console.log("tab: ",tab)
      try {
        var hostname = extractHostname(tab.url);
        //console.log("tab: ", tab, "tab.url:", tab.url, "hostname: ",hostname);
        // console.log(
        //   "tab switched hostname extractHostname: ",
        //   hostname,
        //   "call handleHostname.."
        // );
        handleHostname(hostname, tab.id);
      } catch (error) {
        // console.log("Can't handle in onActivated:", error);
      }
    } else {
      // It is a new tab. can escape
      //console.log("new tab from onActivated");
      //console.log("tab.url.pendingUrl !== 'undefined', but url:", tab.url);
      return;
    }
  });
});

// Get array of hostnames with limits and return string with limitations
function limits_to_string(hosts) {
  res = "";
  for (host of hosts) {
    time_limitation = timeLimits[host] ? timeLimits[host] : "No limit";
    visits_limitation = visitLimits[host] ? visitLimits[host] : "No limit";
    res += `\n${host} Limited to:\n\tTime per limits: ${time_limitation} \n\tVisits per day: ${visits_limitation}\n`;
  }
  return res;
}

// Handle the hostname apply limitations and count the visit
function handleHostname(hostname, tabID) {
  //console.log("Handling: ", hostname);
  // Check if there is a visit count set for this website
  if (visitCounts[hostname] && lastHandle[tabID] != hostname) {
    // If there is a visit count set, increment the count
    visitCounts[hostname]++;
    // Check if the visit count has reached the limit
    if (visitCounts[hostname] > visitLimits[hostname]) {
      // If the visit count has reached the limit, navigate the tab to a new URL
      chrome.tabs.update(tabID, {
        url: "/limitended.html",
      });
    }
  } else {
    if (visitLimits[hostname] && lastHandle[tabID] != hostname) {
      // If there is no visit count set for this website, but in visit limits  list- set the count to 1
      visitCounts[hostname] = 1;
    }
  }
  // Check if there is a time limit set for this website
  if (timeLimits[hostname]) {
    // If there is a time limit set, start a timer for the specified time
    const timeLimit = timeLimits[hostname];
    // When the timer finishes, navigate the tab to a new URL
    const timer = setTimeout(() => {
      chrome.tabs.update(tabID, {
        url: "/limitended.html",
      });
    }, timeLimit * 60000);
    timers[tabID] = timer;
    // console.log(`timers[tabID]: set on tabId: ${tabID} timer: ${timer}`);
  }
  lastHandle[tabID] = hostname;
}

// Set up a listener for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.hostname && extractHostname(request.hostname) === "github.com") {
    // console.log(
    //   "You can't limit github.com. \n " +
    //     "\t1. It will cause an infinite loop. \n" +
    //     "\t2. There isn't worried you will waste youre time there.."
    // );
    return;
  }
  // Check if the message is a request to set a visits count limit
  if (request.type === "setVisitLimit") {
    var hostname = extractHostname(request.hostname);
    var visitLimit = request.visitLimit;
    // Set the visit limit for the specified website
    visitLimits[hostname] = visitLimit;
    // DEBUG console.log(hostname, "Limited: ", visitLimit, "visits")
    // DEBUG console.log(new URL(request.hostname).hostname)
  }
  // Check if the message is a request to set a time limit
  if (request.type === "setTimeLimit") {
    var hostname = extractHostname(request.hostname);
    var timeLimit = request.timeLimit;
    // Set the time limit for the specified website
    timeLimits[hostname] = timeLimit;
    // DEBUG console.log(hostname, "Limited: ", timeLimit, "seconds")
  }
  // DEBUG console.log("from background", visitCounts, timeLimits, visitLimits)	//DEBUG
  // Check if the message is a request to delete hostname limits
  if (request.type === "deLimit") {
    // DEBUG console.log(" from background deLimit clicked");
    let hostname = extractHostname(request.hostname);
    // Set the visit limit for the specified website
    delete visitLimits[hostname];
    delete timeLimits[hostname];
    delete visitCounts[hostname];
    // DEBUG console.log("visitLimits:", visitLimits)
    // DEBUG console.log("timeLimits: ", timeLimits)
  }
  if (request.type === "deLimitAll") {
    console.log(" from background deLimitAll clicked");
    visitLimits = {};
    timeLimits = {};
    visitCounts = {};
  }
  // Check if the message is a request to show limits
  if (request.type === "showLimits") {
    //console.log(" from background ShowLimits clicked");
    var timeLimitsSet = new Set(Object.keys(timeLimits));
    var visitLimitsSet = new Set(Object.keys(visitLimits));
    var allLimitsUnion = new Set([...timeLimitsSet, ...visitLimitsSet]);
    // DEBUG console.log(`Limits:\n ${Array.from(allLimitsUnion)}`)
    var limitation_respond =
      allLimitsUnion.size > 0
        ? limits_to_string(Array.from(allLimitsUnion))
        : "No Limits Yet";
    sendResponse({ limits: limitation_respond });
  }
});

// This function will run the func daily at hour:minutes
function runAtSpecificTimeOfDay(hour, minutes, func) {
  const twentyFourHours = 86400000;
  const now = new Date();
  let eta_ms =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minutes,
      0,
      0
    ).getTime() - now;
  if (eta_ms < 0) {
    eta_ms += twentyFourHours;
  }
  setTimeout(function () {
    //run once
    func();
    // run every 24 hours from now on
    setInterval(func, twentyFourHours);
  }, eta_ms);
}

// run everyday at midnight
runAtSpecificTimeOfDay(0, 0, () => {
  // Clean visitCounts of the day
  for (var member in visitCounts) delete visitCounts[member];
  //Clean timers of the day. Needed when closed the tab before switched (manualy or by LiLimit).
  for (var member in timers) delete timers[member];
});

// Reset the visit counts once a day
//setInterval(() => {
//  visitCounts = {};
//}, 86400000);
