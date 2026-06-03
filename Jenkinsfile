pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-credentials')
        DOCKER_IMAGE     = 'tharusha69/apexpos-backend'
        DEPLOYMENT_FILE  = 'k8s/backend/deployment.yml'
        NAMESPACE        = 'apexpos'
        DEPLOYMENT       = 'apexpos-backend'
        // Limit Node memory consumption to 256MB to prevent OOM
        NODE_OPTIONS     = '--max-old-space-size=256'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '3'))
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // Run sequentially (NOT in parallel) to conserve memory on t3.micro
        stage('Backend Dependencies') {
            steps {
                dir('server') {
                    echo '📦 Installing Backend Dependencies...'
                    sh 'npm ci --omit=dev --no-audit --no-fund'
                }
            }
        }

        stage('Frontend Dependencies & Build') {
            steps {
                dir('client') {
                    echo '📦 Installing Frontend Dependencies...'
                    sh 'npm ci --no-audit --no-fund'
                    echo '🔍 Linting Frontend...'
                    sh 'npm run lint'
                    echo '🚀 Building Frontend Production Bundle...'
                    sh 'npm run build'
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
                    echo '🐳 Building Docker Image...'
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
                echo '📤 Pushing Image to Docker Hub...'
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
                echo '🔄 Restarting Kubernetes Deployment...'
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
                echo '🩺 Running API health check...'
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
