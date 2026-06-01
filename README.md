# ALCapital Governance Dashboard

A comprehensive, real-time dashboard designed for institutional governance and performance tracking. Built with modern web technologies, this dashboard offers seamless data visualization, live updates, and an intuitive user interface.

## 🚀 Architecture

The application is built on a robust, full-stack architecture:

- **Frontend:** React 19, powered by Vite for lightning-fast builds and hot-module replacement.
- **Styling:** Tailwind CSS for utility-first, responsive, and maintainable styling.
- **Animations:** Motion for smooth, professional micro-interactions and transitions.
- **Data Visualization:** Chart.js for rendering dynamic and interactive charts.
- **Icons:** Lucide React for clean and consistent iconography.
- **Backend:** Express.js running on Node.js, handling API routing and real-time connections.
- **Real-time Communication:** Socket.io for bi-directional event-based communication between the server and clients.
- **Advanced Features:** Integrated advanced processing capabilities to enhance data insights and user experience.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## ⚙️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy the example environment file and configure your local variables.
   ```bash
   cp .env.example .env.local
   ```
   *Note: Ensure all required configuration variables are set in `.env.local`.*

## 🏃‍♂️ Running the Application

### Development Mode

To start the development server with hot-reloading enabled:

```bash
npm run dev
```

### Production Build

To build the application for production deployment:

```bash
npm run build
```
This command compiles the frontend via Vite and bundles the backend server into the `dist/` directory.

To start the production server:

```bash
npm run start
```

## 🧹 Maintenance

To clean the build artifacts and temporary files:
```bash
npm run clean
```

To run linting and type-checking:
```bash
npm run lint
```
