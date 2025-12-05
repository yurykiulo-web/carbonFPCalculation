# Carbon Footprint Tracker

This application helps you track your carbon footprint. It consists of a React frontend, a Python (FastAPI) backend, and a PostgreSQL database.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following tools installed on your system:

*   **Docker and Docker Compose:** Used to run the PostgreSQL database in a container.
    *   [Install Docker Engine](https://docs.docker.com/engine/install/)
    *   [Install Docker Compose](https://docs.docker.com/compose/install/)

*   **Node.js and npm:** Required for the frontend application. We recommend using a Node Version Manager (nvm) to install and manage Node.js versions.
    *   [nvm](https://github.com/nvm-sh/nvm) (for Linux/macOS) or [nvm-windows](https://github.com/coreybutler/nvm-windows)
    *   Install a recent LTS version of Node.js (e.g., 18 or 20):
        ```bash
        nvm install 18
        nvm use 18
        ```

*   **Python:** The backend is built with Python. We recommend using a Python version manager like `pyenv`.
    *   [pyenv](https://github.com/pyenv/pyenv)
    *   Install Python 3.11:
        ```bash
        pyenv install 3.11
        pyenv global 3.11
        ```

### Installation

1.  **Clone the repository:**
    ```bash
    git https://github.com/yurykiulo-web/carbonFPCalculation.git
    cd CarbonFootprintTracker
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the Python virtual environment and install backend dependencies:**
    ```bash
    python -m venv server-python/.venv
    ```
    *   On Linux/macOS:
        ```bash
        source server-python/.venv/bin/activate
        ```
    *   On Windows:
        ```bash
        server-python\.venv\Scripts\activate
        ```
    Then, install the required packages:
    ```bash
    pip install -r server-python/requirements.txt
    ```

## Running the Application

1.  **Start the PostgreSQL database:**
    Use Docker Compose to start the database service in the background.
    ```bash
    docker-compose up -d
    ```

2.  **Set up environment variables:**
    The backend requires a `DATABASE_URL` to connect to the database. Create a `.env` file in the `server-python` directory:
    ```
    server-python/.env
    ```
    Add the following line to the `.env` file:
    ```
    DATABASE_URL=postgresql://user:password@localhost:5432/carbonfootprinttracker
    ```

3.  **Run the development server:**
    The project includes a script to run both the frontend and backend servers concurrently.
    ```bash
    ./run-dev.sh
    ```

    This will:
    *   Start the Python backend on `http://localhost:8000`.
    *   Start the React frontend on `http://localhost:5000`.

You can now access the application by navigating to `http://localhost:5000` in your web browser.
