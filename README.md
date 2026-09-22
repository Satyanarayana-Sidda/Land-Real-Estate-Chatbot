# EstateGPT: Land Real Estate Chatbot

EstateGPT is a full-stack real-estate platform that lets customers search land listings with natural-language queries and communicate with property sellers. The project includes a production-oriented AWS infrastructure and automated container delivery pipeline.

[![CI/CD](https://github.com/Satyanarayana-Sidda/Land-Real-Estate-Chatbot/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Satyanarayana-Sidda/Land-Real-Estate-Chatbot/actions/workflows/ci-cd.yml)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Cloud%20Infrastructure-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![MySQL](https://img.shields.io/badge/MySQL-RDS-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

## Cloud and DevOps Highlights

- Designed AWS infrastructure with EC2, Application Load Balancer, Auto Scaling, VPC, S3, CloudFront, ECR, IAM, RDS, and CloudWatch.
- Built public and private subnet architecture with NAT Gateway egress; application instances and the database run in private subnets.
- Containerized the API and static frontend with Docker.
- Added GitHub Actions CI/CD for linting, frontend builds, API image creation, vulnerability scanning, ECR publishing, S3 synchronization, CloudFront invalidation, and Auto Scaling instance refresh.
- Added IAM-based ECR access, security groups, environment-based secrets, ACM certificate support, and CloudWatch alarms for CPU, unhealthy targets, and API 5xx errors.

## Architecture

```text
Users
  |
  v
CloudFront -----> S3 static frontend
  |
  +-------------> HTTPS Application Load Balancer
                         |
                         v
                  EC2 Auto Scaling Group
                  Dockerized Express API
                         |
                         +----> Amazon RDS for MySQL
                         +----> Gemini API

Public subnets: ALB and NAT Gateway
Private subnets: EC2 instances and RDS
Delivery: GitHub Actions -> ECR/S3 -> ASG refresh/CloudFront invalidation
```

## Application Features

- Customer and admin authentication with JWT and bcrypt.
- Property listing, filtering, ownership management, and favorites.
- EstateGPT AI assistant using Gemini with a rule-based fallback.
- Direct customer-to-seller messaging.
- Property details, site-visit and booking interface foundations.
- Responsive React dashboard and administration pages.

## Technology Stack

### Application

- React, Vite, React Router, Tailwind CSS, Axios
- Node.js, Express, Sequelize
- MySQL / Amazon RDS
- Google Gemini API

### Cloud and DevOps

- AWS EC2, Application Load Balancer, Auto Scaling, VPC, NAT Gateway
- Amazon S3, CloudFront, ECR, RDS, IAM, CloudWatch
- Docker and Docker Compose
- GitHub Actions with AWS OIDC

## Repository Structure

```text
.
├── src/                         React frontend
├── server/                      Express API and Sequelize models
│   ├── controllers/             API controllers
│   ├── models/                  Database models
│   ├── routes/                  API routes
│   └── Dockerfile               Production API image
├── deploy/nginx.conf            SPA-serving Nginx configuration
├── Dockerfile                   Production frontend image
├── docker-compose.yml           Local frontend, API, and MySQL stack
├── aws-infrastructure.yaml      AWS CloudFormation infrastructure
├── deploy.py                    CloudFormation deployment helper
└── .github/workflows/ci-cd.yml  CI/CD pipeline
```

## Local Setup

### Standard development

Prerequisites: Node.js 20+, npm, and MySQL.

```bash
git clone https://github.com/Satyanarayana-Sidda/Land-Real-Estate-Chatbot.git
cd Land-Real-Estate-Chatbot
npm install
npm install --prefix server
copy .env.example .env
npm run dev
```

The Vite frontend runs on port `8081` and the API runs on port `5000`.

### Docker Compose

Docker Desktop must be running.

```bash
docker compose up --build
```

- Frontend: `http://localhost:8081`
- API health check: `http://localhost:5000/api/health`

Stop the stack with:

```bash
docker compose down
```

## Environment Configuration

Copy `.env.example` to `.env` and provide local values for:

```text
DB_HOST
DB_NAME
DB_USER
DB_PASSWORD
JWT_SECRET
GEMINI_API_KEY
CORS_ORIGIN
VITE_API_URL
```

Never commit `.env` files, database passwords, JWT secrets, cloud credentials, or AI API keys.

## AWS Infrastructure Deployment

The CloudFormation template provisions:

- VPC, Internet Gateway, public/private subnets, route tables, and NAT Gateway.
- HTTPS Application Load Balancer and target group health checks.
- Private EC2 Auto Scaling Group running the API container.
- Private MySQL RDS instance.
- ECR repository with scan-on-push enabled.
- Private S3 frontend bucket served through CloudFront.
- IAM instance profile with CloudWatch and ECR read permissions.
- CloudWatch alarms for API health and resource conditions.

Required deployment inputs include a database password, a JWT secret of at least 32 characters, a Gemini API key if AI mode is enabled, and an ACM certificate ARN.

```bash
python deploy.py \
  --region us-east-1 \
  --db-username admin \
  --db-password '<database-password>' \
  --jwt-secret '<32-character-or-longer-secret>' \
  --certificate-arn '<acm-certificate-arn>' \
  --gemini-api-key '<gemini-api-key>'
```

The deployment script uses the standard AWS credential chain. Do not place access keys in source code.

## CI/CD Pipeline

The workflow at `.github/workflows/ci-cd.yml` runs on pull requests and pushes to `main`:

1. Installs dependencies and runs ESLint.
2. Builds the React frontend.
3. Installs backend dependencies.
4. Builds the API Docker image.
5. Scans the image with Trivy for high and critical vulnerabilities.
6. On `main`, authenticates to AWS using GitHub OIDC.
7. Pushes immutable and `latest` API tags to ECR.
8. Uploads the frontend build to S3.
9. Invalidates CloudFront cache.
10. Starts an Auto Scaling instance refresh.

Configure these GitHub repository values before enabling deployment:

### Secrets

- `AWS_DEPLOY_ROLE_ARN`
- `FRONTEND_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `ASG_NAME`

### Variables

- `AWS_REGION`
- `ECR_REPOSITORY`

The AWS deployment role should trust GitHub Actions through OIDC and be restricted to the required ECR, S3, CloudFront, and Auto Scaling actions.

## Validation

```bash
npm run lint
npm run build
node --check server/server.js
node --check server/config/db.js
python -B -m py_compile deploy.py
docker compose config
```

## Author

Satyanarayana Sidda
