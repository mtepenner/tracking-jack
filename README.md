# 📦 Tracking Jack

## Description
Tracking Jack is a full-stack application designed to retrieve real-time package statuses. It utilizes a vanilla web frontend and a Node.js backend that acts as a web scraper. The application currently supports scraping tracking details directly from the USPS website using headless Chrome.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Future Implementations](#future-implementations)
- [License](#license)

## 🚀 Features
- **Real-Time Scraping:** Fetches up-to-date tracking information by directly scraping carrier web pages.
- **Clean UI:** A lightweight, responsive, and easy-to-use HTML/CSS interface.
- **CORS Enabled:** The backend safely communicates with the local HTML frontend using the Express CORS middleware.

## 🛠️ Technologies Used
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Web Scraping:** Puppeteer

## 💻 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mtepenner/tracking-jack.git
   cd tracking-jack
   ```

2. **Install backend dependencies:**
   Navigate to the backend directory and install the required Node modules.
   ```bash
   cd backend
   npm install express cors puppeteer
   ```

## ⚙️ Usage

1. **Start the backend server:**
   From the `backend` directory, run the server script.
   ```bash
   node server.js
   ```
   *The server will run at `http://localhost:3000`.*

2. **Launch the frontend:**
   Open `frontend/index.html` in your preferred web browser.

3. **Track a package:**
   - Select **USPS** from the carrier dropdown.
   - Enter your tracking number.
   - Click **Track Package** to view the current status.

## 🔮 Future Implementations
Currently, the application supports USPS web scraping. Support for UPS, FedEx, DHL, and TNT is planned for future releases. 

## 📄 License
This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
