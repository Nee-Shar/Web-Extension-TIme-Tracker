chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
      message: "clicked_browser_action",
    });
  });
});

document.getElementById("Login-instead").addEventListener("click", function () {
  document.getElementById("login-form").style.display = "block";
  document.getElementById("signup-form").style.display = "none";
});

document.getElementById("signUp").addEventListener("click", function (e) {
  e.preventDefault();
  var email = document.getElementById("signup-email").value;
  var password = document.getElementById("signup-password").value;
  var userData = {
    Email: email,
    Pssd: password,
  };

  // Send the POST request
  fetch("http://localhost:8000/add_user", {
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
      console.log("UID:", data.UID);
      //go to login.html web page
      window.location.href = "login.html";
      // Log the UID received from the server
      // You can add more handling here, such as displaying a success message to the user
    })
    .catch((error) => {
      // Handle any errors that occur during the fetch operation
      console.error("Error:", error);
      // You can add more error handling here, such as displaying an error message to the user
    });
});

document.getElementById("login").addEventListener("click", function (e) {
  e.preventDefault();
  var email = document.getElementById("login-email").value;
  var password = document.getElementById("login-password").value;
  console.log(email, password);
  var userData = {
    Email: email,
    Pssd: password,
  };
  fetch("http://localhost:8000/is_user_authentic", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then((response) => {
      if (!response.ok) {
        // If the response is not ok, throw an error with the status text
        return response.json().then((data) => {
          throw new Error(data.detail || "Authentication failed");
        });
      }

      return response.json();
    })
    .then((data) => {
      // Handle the response
      console.log(data.message); // Log the message received from the server

      localStorage.setItem("UID", data.result);
      window.location.href = "personalized.html";

      // Log the UID received from the server
      // You can add more handling here, such as displaying a success message to the user
    })
    .catch((error) => {
      // Handle any errors that occur during the fetch operation
      alert("Invalid Credentials");
      console.error("Error:", error);
      // You can add more error handling here, such as displaying an error message to the user
    });
});

if (localStorage.getItem("UID")) {
  window.location.href = "personalized.html";
}

document.getElementById("tipsPage").addEventListener("click", function () {
  window.location.href = "tips.html";
});
