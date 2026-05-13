pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-credentials')
        DOCKER_IMAGE     = 'ntharusha/apexpos-backend'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))  // Save disk on free tier
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Lint') {
            parallel {
                stage('Backend Deps') {
                    steps {
                        dir('server') {
                            sh 'npm ci --production'
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('client') {
                            sh 'npm ci'
                            sh 'npm run lint'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            when { branch 'main' }
            steps {
                dir('server') {
                    sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
                    sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Push to Docker Hub') {
            when { branch 'main' }
            steps {
                sh """
                    echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin
                    docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE}:latest
                """
            }
        }

        stage('Deploy to k3s') {
            when { branch 'main' }
            steps {
                sh """
                    kubectl set image deployment/apexpos-backend \
                        backend=${DOCKER_IMAGE}:${BUILD_NUMBER} \
                        -n apexpos
                    kubectl rollout status deployment/apexpos-backend \
                        -n apexpos --timeout=120s
                """
            }
        }

        stage('Smoke Test') {
            when { branch 'main' }
            steps {
                sh """
                    sleep 10
                    curl -f http://localhost:30500/ || exit 1
                    echo "Backend health check passed"
                """
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            // Clean up Docker images to save disk (30GB limit on free tier)
            sh 'docker image prune -f || true'
        }
    }
}
