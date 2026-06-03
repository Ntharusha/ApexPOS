pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-credentials')
        DOCKER_IMAGE     = 'tharusha69/apexpos-backend'
        DEPLOYMENT_FILE  = 'k8s/backend/deployment.yml'
        NAMESPACE        = 'apexpos'
        DEPLOYMENT       = 'apexpos-backend'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 20, unit: 'MINUTES')
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
                            sh 'npm ci --omit=dev'
                        }
                    }
                }
                stage('Frontend Lint & Build') {
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
            when {
                anyOf {
                    branch 'main'
                    branch 'dev'
                }
            }
            steps {
                dir('server') {
                    sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
                    sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Push to Docker Hub') {
            when {
                anyOf {
                    branch 'main'
                    branch 'dev'
                }
            }
            steps {
                sh """
                    echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin
                    docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE}:latest
                """
            }
        }

        stage('Deploy to k3s') {
            when {
                anyOf {
                    branch 'main'
                    branch 'dev'
                }
            }
            steps {
                sh """
                    export KUBECONFIG=/root/.kube/config
                    kubectl rollout restart deployment/${DEPLOYMENT} -n ${NAMESPACE}
                    kubectl rollout status deployment/${DEPLOYMENT} -n ${NAMESPACE} --timeout=180s
                """
            }
        }

        stage('Smoke Test') {
            when {
                anyOf {
                    branch 'main'
                    branch 'dev'
                }
            }
            steps {
                sh """
                    sleep 10
                    curl -f http://localhost:30500/ || exit 1
                    echo "Backend health check passed ✅"
                """
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline succeeded — backend deployed to k3s!'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above.'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
