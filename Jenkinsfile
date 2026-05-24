pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-credentials')
        DOCKER_IMAGE     = 'tharusha69/apexpos-backend'
        DEPLOYMENT_FILE  = 'k8s/backend/deployment.yml'
        SMOKE_URL        = 'http://localhost:30500/'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
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
                            sh 'npm ci --omit=dev'
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

        stage('Bump GitOps Manifest') {
            when { branch 'main' }
            steps {
                withCredentials([string(credentialsId: 'github-pat', variable: 'GITHUB_TOKEN')]) {
                    sh """
                        set -e
                        sed -i 's|image: .*apexpos-backend:.*|image: ${DOCKER_IMAGE}:${BUILD_NUMBER}|' ${DEPLOYMENT_FILE}
                        git config user.email 'jenkins@apexpos.local'
                        git config user.name 'Jenkins CI'
                        git add ${DEPLOYMENT_FILE}
                        if git diff --staged --quiet; then
                            echo 'Image tag unchanged, skipping git push'
                        else
                            git commit -m '[ci] backend image ${BUILD_NUMBER}'
                            git push https://\${GITHUB_TOKEN}@github.com/Ntharusha/ApexPOS.git HEAD:main
                        fi
                    """
                }
            }
        }

        stage('Wait for Argo CD Sync') {
            when { branch 'main' }
            steps {
                sh '''
                    echo "Waiting 60s for Argo CD to sync GitOps manifest..."
                    sleep 60
                '''
            }
        }

        stage('Smoke Test') {
            when { branch 'main' }
            steps {
                sh """
                    curl -f ${SMOKE_URL} || exit 1
                    echo "Backend health check passed"
                """
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded — Argo CD will deploy from updated k8s manifest.'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
