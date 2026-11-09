pipeline {
    agent {
        label 'taskflow'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/hesskhay/taskflow-three-tier.git'
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
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
    }

    post {
        success {
            echo 'TaskFlow CI checks passed!'
        }
        failure {
            echo 'TaskFlow CI failed. Review the console output.'
        }
    }
}
