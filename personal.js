function fetchRestrictedSitesData(userId) {
  // Check if restricted sites data is already in local storage
  const storedRestrictedSites = localStorage.getItem("restrictedSites");

  if (storedRestrictedSites) {
    // If data is present in local storage, parse and update UI
    const restrictedSites = JSON.parse(storedRestrictedSites);
    updateRestrictedSitesList(restrictedSites);
  } else {
    // If data is not present, fetch it from the API
    fetch(`https://outstanding-mackerel-nee-shar-963708c8.koyeb.app/get_restricted_sites/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch restricted sites data");
        }
        return response.json();
      })
      .then((data) => {
        const restrictedSites = data.map((site) => site.Res_Site);

        // Update HTML list
        updateRestrictedSitesList(restrictedSites);

        // Store the fetched data in local storage for future use
        localStorage.setItem(
          "restrictedSites",
          JSON.stringify(restrictedSites)
        );

        // Send message to background script to store restricted sites data
        chrome.runtime.sendMessage(
          { action: "storeRestrictedSites", sites: restrictedSites },
          function (response) {
            if (chrome.runtime.lastError) {
              console.error(
                "Error sending message to background script:",
                chrome.runtime.lastError
              );
            } else {
              console.log(response.message); // Log the response from the background script
            }
          }
        );
      })
      .catch((error) => {
        console.error("Error fetching restricted sites data:", error);
      });
  }
}

function updateRestrictedSitesList(restrictedSitesArray) {
  const listContainer = document.getElementById("restricted-sites-list");

  // Clear existing list items
  listContainer.innerHTML = "";

  // Iterate through the array and add each site to the list
  restrictedSitesArray.forEach((site) => {
    // Create list item
    const listItem = document.createElement("li");
    listItem.classList.add("kalam-bold");
    // Set text content to the site
    listItem.textContent = site.trim(); // Remove leading/trailing whitespace if any

    // Append list item to list container
    listContainer.appendChild(listItem);
  });
}
// function updateRestrictedSitesList(restrictedSitesString) {
//   const listContainer = document.getElementById("restricted-sites-list");

//   // Clear existing list items
//   listContainer.innerHTML = "";

//   // Split the string by commas
//   const restrictedSites = restrictedSitesString.split(",");

//   // Iterate through the array and add each site to the list
//   restrictedSites.forEach((site) => {
//     // Create list item
//     const listItem = document.createElement("li");

//     // Set text content to the site
//     listItem.textContent = site.trim(); // Remove leading/trailing whitespace if any

//     // Append list item to list container
//     listContainer.appendChild(listItem);
//   });
// }

document.getElementById("addToRestricted").addEventListener("click", () => {
  var site_Name = document.getElementById("basic-url").value;
  var user_id = localStorage.getItem("UID");
  var time = 0;
  // user_id: str
  // Res_Site:str
  // Allowed_Time: int
  const userData = {
    user_id: user_id,
    Res_Site: site_Name,
    Allowed_Time: time,
  };
  fetch("https://outstanding-mackerel-nee-shar-963708c8.koyeb.app/add_restricted_site", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response
      console.log(data.message); // Log the message received from the server
      localStorage.removeItem("restrictedSites");
      window.location.reload();
      fetchRestrictedSitesData(localStorage.getItem("UID"));
    })
    .catch((error) => {
      // Handle any errors that occur during the fetch operation
      console.error("Error:", error);
      // You can add more error handling here, such as displaying an error message to the user
    });
});

function fetchTop3Data(userId) {
  fetch(`https://outstanding-mackerel-nee-shar-963708c8.koyeb.app/top3sites/${userId}`)
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("top3Data", JSON.stringify(data));
      console.log("Top 3 sites data stored:", data);
      populateTop3Table(data);
    })
    .catch((error) => {
      console.error("Error fetching top 3 sites data:", error);
    });
}

function populateTop3Table(data) {
  const tableBody = document.getElementById("data-table-body");
  tableBody.innerHTML = ""; // Clear existing rows

  data.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.classList.add("table-info");
    const cellIndex = document.createElement("th");
    cellIndex.scope = "row";
    cellIndex.textContent = index + 1;
    row.appendChild(cellIndex);

    const cellWebsite = document.createElement("td");
    cellWebsite.textContent = entry.Site_Name; // Adjust field name
    row.appendChild(cellWebsite);

    const cellTimeSpend = document.createElement("td");
    cellTimeSpend.textContent = formatTime(entry.total_time); // Adjust field name and format time
    row.appendChild(cellTimeSpend);

    const cellDate = document.createElement("td");
    cellDate.textContent = entry.datee; // Display date as it is
    row.appendChild(cellDate);

    tableBody.appendChild(row);
  });
}

function formatTime(timeInSeconds) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

document.addEventListener("DOMContentLoaded", function () {
  const notification = document.getElementById("notification");
  notification.style.display = "block";

  // Hide the notification after 3 seconds
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
  const userId = localStorage.getItem("UID");
  fetchRestrictedSitesData(userId);

  if (userId) {
    const storedTop3Data = localStorage.getItem("top3Data");
    const storedRestrictedSites = localStorage.getItem("restrictedSites");

    if (storedTop3Data && storedRestrictedSites) {
      console.log("Using stored data for top 3 sites and restricted sites.");
      const top3Data = JSON.parse(storedTop3Data);
      const restrictedSites = JSON.parse(storedRestrictedSites);
      populateTop3Table(top3Data);
      // You can use the restrictedSites data as needed
      console.log("Restricted sites data:", restrictedSites);
    } else {
      console.log(
        "Fetching data from API because stored data is not available."
      );
      fetchTop3Data(userId);
      fetchRestrictedSitesData(userId);
    }
  } else {
    console.log("User not logged in.");
  }
});

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
  let presentDate = "" + nDateYear + "-" + nDateMonth + "-" + nDateDate;
  return presentDate;
}
// function getDomain(tablink){
//     let url =  tablink[0].url;
//     return url.split("/")[2];
// };

document.getElementById("logOut").addEventListener("click", function () {
  //remove  UID from localstorarge
  localStorage.removeItem("UID");
  localStorage.removeItem("top3Data");
  localStorage.removeItem("restrictedSites");
  localStorage.removeItem("monthlyData");
  chrome.runtime.sendMessage({
    type: "deLimitAll",
  });

  window.location.href = "popup.html";
});

document.addEventListener("DOMContentLoaded", function () {
  var Unique_id = localStorage.getItem("UID");
  // Event listener for start tracking button
  document
    .getElementById("startTracking")
    .addEventListener("click", function () {
      chrome.runtime.sendMessage({
        action: "startTracking",
        userId: Unique_id,
      });
    });

  // Event listener for stop tracking button
  // Console data saved by background.js after tracking stopped
  document
    .getElementById("stopTracking")
    .addEventListener("click", function () {
      chrome.runtime.sendMessage({ action: "stopTracking" });
      var today = getDateString(new Date());
      chrome.storage.local.get([Unique_id], function (result) {
        let userData = result[Unique_id] || {};
        let dateData = userData[today] || {};
        let siteDataList = [];
        for (let key in dateData) {
          siteDataList.push({
            Site_Name: key,
            Time_Spend: dateData[key],
            user_id: Unique_id,
          });
        }

        // Send the data to the backend
        fetch("https://outstanding-mackerel-nee-shar-963708c8.koyeb.app/add_site_data_batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(siteDataList),
        })
          .then((response) => response.json())
          .then((data) => {
            // Handle the response
            fetchTop3Data(Unique_id);
            fetchRestrictedSitesData(Unique_id);
            console.log(data.message); // Log the message received from the server
          })
          .catch((error) => {
            // Handle any errors that occur during the fetch operation
            console.error("Error:", error);
            // You can add more error handling here, such as displaying an error message to the user
          });
      });
    });
});
//console data saved by background.js after tracking stoppped

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

document.getElementById("limitPage").addEventListener("click", function () {
  window.location.href = "limit.html";
});

// GRAPHS

document.getElementById("letsGraph").addEventListener("click", function () {
  window.location.href = "Visualization.html";
});

document.getElementById("tipsPage").addEventListener("click", function () {
  window.location.href = "tips.html";
});
