$(document).ready(function () {
  const userId = localStorage.getItem("UID"); // Replace with dynamic user ID if necessary

  // if (userId) {
  //   fetchUsageData(userId).then((data) => {
  //     if (data && data.length > 0) {
  //       displayStatisticsMetrics(data);
  //     }
  //   });
  // }

  // Fetch daily data from the endpoint
  async function fetchDailyData() {
    try {
      const response = await fetch(
        `http://localhost:8000/allDataForToday/${userId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  // Process the fetched daily data and prepare it for visualization
  function processAndVisualizeDailyData(data) {
    const labels = data.map((entry) => entry.Site_Name);
    const times = data.map((entry) => entry.total_time);

    // Create the bar chart
    const ctx = document.getElementById("timeSpentChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Time Spent (seconds)",
            data: times,
            backgroundColor: "rgba(240, 88, 77)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          title: {
            display: true,
            text: "Time Spent on Websites Today",
          },
        },
      },
    });
  }

  // Fetch monthly data from the endpoint or local storage
  async function fetchMonthlyData() {
    const localStorageData = localStorage.getItem("monthlyData");
    if (localStorageData) {
      return JSON.parse(localStorageData);
    }

    try {
      const response = await fetch(
        `http://localhost:8000/monthlyData/${userId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      localStorage.setItem("monthlyData", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  // Process the fetched monthly data and prepare it for visualization
  function processAndVisualizeMonthlyData(data) {
    const labels = data.map((entry) => entry.Site_Name);
    const times = data.map((entry) => entry.total_time);

    // Create the pie chart
    const ctx = document.getElementById("monthlyPieChart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Time Spent (seconds)",
            data: times,
            backgroundColor: [
              "rgba(100, 0, 0, 0.3)", // Dark red with 20% opacity
              "rgba(0, 100, 0, 0.3)", // Dark green with 20% opacity
              "rgba(255, 206, 86, 0.3)", // Normal yellow with 20% opacity
              "rgba(75, 192, 192, 0.3)", // Normal cyan with 20% opacity
              "rgba(153, 102, 255, 0.3)", // Normal purple with 20% opacity
              "rgba(255, 159, 64, 0.3)", // Normal orange with 20% opacity
            ],
            borderColor: [
              "rgba(100, 0, 0, 1)", // Dark red
              "rgba(0, 100, 0, 1)", // Dark green
              "rgba(255, 206, 86, 1)", // Normal yellow
              "rgba(75, 192, 192, 1)", // Normal cyan
              "rgba(153, 102, 255, 1)", // Normal purple
              "rgba(255, 159, 64, 1)", // Normal orange
            ],

            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          title: {
            display: true,
            text: "Monthly Time Spent on Websites",
          },
        },
      },
    });
  }

  // Fetch and visualize the daily data on page load
  fetchDailyData().then((data) => {
    if (data) {
      processAndVisualizeDailyData(data);
    }
  });

  // Event listener for the "Fetch Monthly Data" button
  document.getElementById("fetchMonthlyData").addEventListener("click", () => {
    fetchMonthlyData().then((data) => {
      if (data) {
        processAndVisualizeMonthlyData(data);
      }
    });
  });

  // Event listener for the "Go Back" button
  document.getElementById("goBack").addEventListener("click", () => {
    window.location.href = "personalized.html";
  });
});

async function fetchUsageData(userId) {
  try {
    const response = await fetch(
      `http://localhost:8000/all_time_data/${userId}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    displayStatisticsMetrics(data);
    console.log("DONE");
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

function displayStatisticsMetrics(data) {
  const days = data.Days;
  const totalOverallTime = data.total_time;
  const averageTimePerDay = totalOverallTime / (days + 1); // Calculate average time per day
  console.log(data.Days, data.total_time, totalOverallTime, averageTimePerDay);
  // Display metrics in HTML elements
  document.getElementById("totalTimeSpent").textContent =
    totalOverallTime + " seconds";
  document.getElementById("averageTimeSpent").textContent =
    averageTimePerDay.toFixed(2) + " seconds"; // Round to 2 decimal places
  document.getElementById("mostVisitedWebsite").textContent = data.max_time_site;  
}

document.getElementById("seeStats").addEventListener("click", () => {
  const userId = localStorage.getItem("UID"); // Replace with dynamic user ID if necessary
  document.getElementById("myList").style.visibility = "visible";

  if (userId) {
    fetchUsageData(userId);
  }
});
