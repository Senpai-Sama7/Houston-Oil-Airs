
<p align="center">
  <img src="frontend/IMAGE.jpeg" alt="Houston Oil Airs" width="300"/>
</p>

# 🌟 Houston Oil Airs - Advanced AI Research Platform

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](docker/)

> **Created by**: Senpai-Sama7
> **Date**: 2025-05-28 21:39:15 UTC
> **Vision**: Advancing responsible AI through cutting-edge research visualization

---

## 🚀 **Live Demo**

- **Production**: [https://houstonoilairs.org](https://houstonoilairs.org)
- **Staging**: [https://staging.houstonoilairs.org](https://staging.houstonoilairs.org)

---

## ✨ **Features**

- 🎨 **Immersive 3D Visualizations** - WebGL-powered research data exploration
- 🔄 **Real-time Analytics** - Live AI research metrics and collaboration networks
- 🌐 **Interactive Network Analysis** - Dynamic research collaboration mapping
- ⚡ **High Performance** - Native C++, Java, and Node.js backend architecture
- 🔒 **Enterprise Security** - Advanced authentication and data protection
- 📱 **Responsive Design** - Optimized for all devices and screen sizes

---

## 🔧 **Updated Features**

### Research Trends Endpoint

- Returns a JSON array of research metrics for a given category and timeframe.
- If no metrics are found, an empty JSON array is returned.

### Network Analysis Endpoint

- Performs network analysis for specified research categories.
- Returns a JSON object with nodes, edges, and network metrics.
- If no data is generated, an empty JSON object is returned.

### Health Endpoint

- Provides the service status, timestamp, and service name.
- Always returns a JSON response indicating the health of the service.

---

## 🏗️ **Architecture**

- **Frontend**: Built with Vite.js for blazing-fast development and optimized production builds.
- **Backend**: Multi-language architecture using C++, Java, and Node.js for high performance and scalability.
- **Deployment**: Dockerized containers with Kubernetes orchestration for seamless scaling.
- **Database**: Optimized relational and NoSQL databases for efficient data storage and retrieval.

---

## 📜 **Documentation**

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [License](LICENSE)
- [FAQs](FAQ.md)

---

## 🛠️ **Setup Instructions**

### Prerequisites

- **Node.js**: v18.20.8 or higher
- **Java**: JDK 11 or higher
- **Docker**: Installed and running

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Senpai-Sama7/Houston-Oil-Airs.git
   ```

2. Navigate to the project directory:

   ```bash
   cd Houston-Oil-Airs
   ```

3. Install dependencies for the frontend:

   ```bash
   cd frontend
   npm install
   ```

4. Build and run the backend services:

   ```bash
   cd ../backend/java-services
   mvn clean install
   mvn spring-boot:run
   ```

5. Start the frontend:

   ```bash
   cd ../../frontend
   npm run dev
   ```

6. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8080/api](http://localhost:8080/api)

---

## 🧪 **Testing**

### Backend Tests

Run the following command to execute backend tests:

```bash
cd backend/java-services
mvn test
```

### Frontend Tests

Run the following command to execute frontend tests:

```bash
cd frontend
npm test
```

---

## 🌍 **Contributing**

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

---

## 📧 **Contact**

For inquiries, please contact us at [support@houstonoilairs.org](mailto:support@houstonoilairs.org).

---

## 📜 **License**

This project is licensed under the [MIT License](LICENSE).
