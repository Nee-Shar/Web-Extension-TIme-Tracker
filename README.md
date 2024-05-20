# Web Time Tracker Extension

## Overview

The Web Time Tracker Extension is a powerful tool for managing your online activities. It allows you to sign up, log in, track time spent on different websites, set restrictions, and visualize usage data. Built with HTML, CSS, JavaScript, Bootstrap, FastAPI, and MySQL, this extension helps you stay productive and manage your time effectively while browsing the web.

## Features

- **Sign Up and Login**: Create a secure account and log in to access personalized features.
- **Track Time for Different Websites**: Monitor your browsing habits and track time spent on various websites.
- **Restrict Entry to Websites**: Add websites to a restriction list to limit access.
- **Limit Entry to Websites**: Set time and entry limits for specific websites to maintain productivity.
- **Visualize Usage Data**: View insightful charts to understand your daily and monthly usage patterns.
- **Statistics Metrics**: Display total time spent, average time spent per day, and most visited websites for better analysis.
- **Time-Saving Tips**: Get tips and recommendations to help you save time and stay focused online.

## Demo Video

Watch the demo video [here](https://drive.google.com/file/d/1RoTf148fFrKcU4RD4si78mWKmsvOoXXe/view?usp=sharing).

## Installation

1. **Download ZIP**: Download the project ZIP file and extract it.

2. **Backend Setup**:
   - Navigate to the `backend/app` directory.
   - Install required Python packages:
     ```bash
     pip install fastapi mysql-connector-python uvicorn
     ```
   - Run the backend server:
     ```bash
     uvicorn app:app --reload
     ```

3. **Extension Setup**:
   - Open your web browser and go to the extensions page.
   - Enable Developer Mode.
   - Load the unpacked extension by selecting the extracted project folder.

4. **Database Setup**:
   - Ensure MySQL server is running.
   - Create the required database and tables as per application needs.

## Usage

- Ensure the backend server is running.
- Use the extension while the server is active.
- Access various features through the extension interface.

## Contributing

Contributions are welcome! Please create an issue or submit a pull request.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.
