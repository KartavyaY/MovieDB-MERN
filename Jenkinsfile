pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup ENV Files') {
            steps {
                sh 'chmod -R u+w backend frontend'
                withCredentials([
                    file(credentialsId: 'BACKEND_ENV',  variable: 'BACKEND_ENV_FILE'),
                    file(credentialsId: 'FRONTEND_ENV', variable: 'FRONTEND_ENV_FILE')
                ]) {
                    sh 'cp $BACKEND_ENV_FILE backend/.env'
                    sh 'cp $FRONTEND_ENV_FILE frontend/.env'
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose build --no-cache'
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Pipeline failed!'
            sh 'docker-compose down || true'
        }
    }
}
