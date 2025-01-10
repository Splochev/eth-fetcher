# Eth Fetcher Documentation

## Introduction

Eth Fetcher is a TypeScript-based backend application designed to fetch transaction details from the Ethereum blockchain. The system interacts with Ethereum nodes to gather real-time data, providing users with transaction information and storing it for retrieval.

---

## 1. **Architecture of the Server - Design Decisions and Overview**

Eth Fetcher follows a modular and layered architecture to ensure separation of concerns, scalability, and maintainability.

### **1.1 Layers and Components**
- **Controllers**: Handle HTTP requests and responses, interact with services, and return results to clients.
- **Services**: Implement core business logic. Services interact with models and external APIs (e.g., Ethereum nodes) to process data.
- **Models**: Define the structure of the data entities and interact with the database for CRUD operations.
- **Utils**: Contain reusable helper functions such as authentication, validation, and Ethereum interaction utilities.
- **Tests**: Unit tests cover services, controllers, and database interactions for reliability and correctness.

### **1.2 Key Design Decisions**
- **RESTful API Design**: Following REST principles for intuitive and standardized endpoints.
- **Authentication**: JWT-based authentication for securing routes and protecting sensitive data.
- **Ethereum Integration**: Uses the `ethers.js` library to interact with Ethereum nodes and retrieve transaction data.
- **Database**: Knex.js is used as a query builder to interact with the PostgreSQL database, allowing for easy migrations and queries.

### **1.3 Tech Stack**
- **Node.js**: JavaScript runtime for server-side operations.
- **Express.js**: Lightweight web framework for RESTful APIs.
- **Knex.js**: Query builder for PostgreSQL.
- **bcrypt**: Password hashing.
- **jsonwebtoken**: JWT for authentication.
- **ethers.js**: Ethereum interaction library.

---

## 2. **How to Run the Server**

### **2.1 Prerequisites**
- Node.js (version >= 14)
- Docker (for containerized environments)
- PostgreSQL (for local database setup)

### **2.2 Setup Instructions**
1. **Clone the Repository**
```bash
git clone https://github.com/your-repository/eth_fetcher.git
cd eth_fetcher
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Environment Variables Create a **.env** file in the root directory and configure:**
```bash
API_PORT=3020
DB_CONNECTION_URL=postgres://postgres:postgres@localhost:5432/postgres 
ETH_NODE_URL=https://eth-sepolia.g.alchemy.com/v2/<API_KEY>
```

4. **Start the Server This will also run database migrations and seeds:**
```bash
npm start
```

5. **Run Unit Tests**
```bash
npm test
```
6. **Dockerized Environment**
- With Database:
```bash
docker-compose build
docker-compose up -d
```
- Without Database:
```bash
docker build -t eth_fetcher
docker run -p 3020:3020 eth_fetcher
```
---

## 3. ** Requests and Responses (with Examples)**
### **3.1 POST /api/authenticate - Authenticate User and Get JWT Token**
- Request:
```http
POST /api/authenticate
Content-Type: application/json
{
  "username": "dave",
  "password": "dave"
}
```
- Response:
```json
{ "token": "eyJhbGciOiJIUz...I1NiI" }
```
### **3.2 GET /api/eth/:rlphex? - Retrieve Ethereum Transaction Details. Links them to user if given**
- Request (Ethereum Transaction Hash): 
```http
GET /api/eth/f90110b842307866633262336236646233386135316462336239636239356
Content-Type: application/json
AUTH_TOKEN: eyJhbGciOiJIUzI1NiI
```
```http
GET /api/eth/f90110b842307866633262336236646233386135316462336239636239356
Content-Type: application/json
```
```http
GET /api/eth?transactionHashes=0xfc2b3b6d....6e4b4b99df056ffb7f2e&transactionHashes=0x48603f7adff7....7c8821df79356
Content-Type: application/json
```
- Response:
```json
{
    "transactions": [
        {
            "transactionHash": "0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e",
            "transactionStatus": 1,
            "blockHash": "0x123456789",
            "blockNumber": 100,
            "from": "0xAddressFrom",
            "to": "0xAddressTo",
            "contractAddress": null,
            "logsCount": 2,
            "input": "0xdata",
            "value": "1000000000000000000"
        },
        ...
    ]
}
```
### **3.3 GET /api/all - Retrieve All Transactions in Database**
- Request:
```http
GET /api/all
Content-Type: application/json
```
- Response:
```json
{
    "transactions": [
        {
            "transactionHash": "0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e",
            "transactionStatus": 1,
            "blockHash": "0x123456789",
            "blockNumber": 100,
            "from": "0xAddressFrom",
            "to": "0xAddressTo",
            "contractAddress": null,
            "logsCount": 2,
            "input": "0xdata",
            "value": "1000000000000000000"
        },
        ...
    ]
}
```
### **3.3 GET /api/my - Retrieve Transactions Linked to Logged-in User
- Request:
```http
GET /api/my
Content-Type: application/json
AUTH_TOKEN: eyJhbGciOiJIUzI1NiI
```
- Response:
```json
{
    "transactions": [
        {
            "transactionHash": "0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e",
            "transactionStatus": 1,
            "blockHash": "0x123456789",
            "blockNumber": 100,
            "from": "0xAddressFrom",
            "to": "0xAddressTo",
            "contractAddress": null,
            "logsCount": 2,
            "input": "0xdata",
            "value": "1000000000000000000"
        },
        ...
    ]
}
```

---

## 4. **Improving the API: Design Choices and Trade-offs**

### **4.1 Suggested API Improvements**
- **Batch Processing**: Implement batch processing for fetching multiple transactions at once to reduce API call overhead.
- **Pagination for /api/all and /api/my**: Allow pagination to handle large datasets and prevent performance degradation.

### **4.2 Trade-offs**
- **Rate Limiting**: To prevent abuse and ensure the service is available to all users, implement rate limiting. However, this can impact users with high transaction volumes.
- **Caching**: Caching Ethereum transaction data could reduce latency and load on the Ethereum node, but it may result in displaying stale data if not refreshed frequently.

---

## 5. **Continuous Integration (CI) Strategy**

### **5.1 CI Setup**
- Use **GitHub Actions** or **CircleCI** for continuous integration.
- Steps in CI pipeline:
  1. Linting the code to maintain code quality.
  2. Running unit tests on every commit or pull request.
  3. Deploying to a staging environment for testing.
  4. Automating versioning with semantic versioning.

---

## 6. **Scalability Strategy**

### **6.1 Horizontal Scaling**
- Use **Docker** and **Kubernetes** to scale the application horizontally. This allows multiple instances of the application to run across different machines.
  
### **6.2 Database Optimization**
- Implement **database sharding** to scale horizontally and distribute the load.
- Use **caching** (e.g., Redis) to store frequently accessed transaction data and reduce database load.

---

## 7. **Paid Service Strategy**

### **7.1 User Management**
- Implement tiered access (e.g., basic, premium) using JWT tokens that include roles and permissions.
- Integrate **Stripe** or **PayPal** for payment processing.
  
### **7.2 Architectural Changes**
- Introduce **API rate limiting** for paid plans to manage load.
- Track user activity and implement usage quotas (e.g., number of transactions per month).

---

## 8. **Handling Failing Ethereum Node URL**

### **8.1 Retry Mechanism**
- Implement a **retry mechanism** for failed requests to the Ethereum node URL. Retries should be exponential backoff to avoid overwhelming the service.

### **8.2 Fallback Ethereum Node**
- Use **multiple Ethereum node providers** (e.g., Alchemy, Infura) and implement a fallback mechanism in case one fails. This ensures availability even when one provider is down.