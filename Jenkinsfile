
pipeline {
    agent {
        label 'taskflow'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    stages {

        stage('Checkout Source Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/hesskhay/taskflow-three-tier.git'
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    echo "Running backend tests..."

                    docker run --rm \
                      -v "$PWD/backend:/app" \
                      -w /app \
                      -u "$(id -u):$(id -g)" \
                      -e HOME=/tmp \
                      node:24-alpine \
                      sh -c "npm ci && npm test"
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                sh '''
                    echo "Building React frontend..."

                    docker run --rm \
                      -v "$PWD/frontend:/app" \
                      -w /app \
                      -u "$(id -u):$(id -g)" \
                      -e HOME=/tmp \
                      node:24-alpine \
                      sh -c "npm ci && npm run build"
                '''
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh '''
                    echo "Building backend Docker image..."

                    docker build \
                      -t taskflow-backend:${BUILD_NUMBER} \
                      ./backend
                '''
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh '''
                    echo "Building frontend Docker image..."

                    docker build \
                      -t taskflow-frontend:${BUILD_NUMBER} \
                      ./frontend
                '''
            }
        }
    }

    post {
        success {
            echo 'TaskFlow CI pipeline completed successfully!'
        }

        failure {
            echo 'TaskFlow CI pipeline failed. Check console output.'
        }

        always {
            echo "Pipeline execution completed for build ${BUILD_NUMBER}"
        }
    }
}

