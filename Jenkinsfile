pipeline {
    agent any

    environment {
        REGISTRY = 'ghcr.io'
        OWNER = 'ntharusha'
        BACKEND_IMAGE = 'apexpos-backend'
        FRONTEND_IMAGE = 'apexpos-frontend'
    }

    stages {
        stage('Lint & Verify') {
            parallel {
                stage('Verify Backend') {
                    steps {
                        dir('server') {
                            sh 'node -c server.js'
                            echo '✅ Backend syntax verification passed.'
                        }
                    }
                }
                stage('Verify Frontend') {
                    steps {
                        dir('client') {
                            sh 'npm install'
                            sh 'npm run lint'
                            echo '✅ Frontend linting passed.'
                        }
                    }
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    // Extract branch name and set appropriate tag
                    def branch = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'dev').replace('origin/', '')
                    def imageTag = branch == 'main' ? 'latest' : branch
                    
                    // Fetch EC2 instance public IP dynamically
                    def publicIp = sh(script: 'curl -s https://api.ipify.org || curl -s ifconfig.me', returnStdout: true).trim()
                    echo "Building Docker images for branch: ${branch} with tag: ${imageTag}. Public IP is: ${publicIp}"
                    
                    // Build images with dynamic backend API URL injected to the frontend build stage
                    sh "docker build -t ${REGISTRY}/${OWNER}/${BACKEND_IMAGE}:${imageTag} ./server"
                    sh "docker build --build-arg VITE_API_URL=http://${publicIp}:30500/api -t ${REGISTRY}/${OWNER}/${FRONTEND_IMAGE}:${imageTag} ./client"
                    
                    // Push to registry, falling back to using local Docker engine runtime if credentials are not set
                    try {
                        withCredentials([usernamePassword(credentialsId: 'github-ghcr-creds', usernameVariable: 'GHCR_USER', passwordVariable: 'GHCR_PAT')]) {
                            sh "echo \$GHCR_PAT | docker login ${REGISTRY} -u \$GHCR_USER --password-stdin"
                            sh "docker push ${REGISTRY}/${OWNER}/${BACKEND_IMAGE}:${imageTag}"
                            sh "docker push ${REGISTRY}/${OWNER}/${FRONTEND_IMAGE}:${imageTag}"
                            echo "✅ Successfully pushed images to GitHub Container Registry."
                        }
                    } catch (Exception e) {
                        echo "⚠️ Jenkins Credentials 'github-ghcr-creds' not found or authentication failed."
                        echo "Since K3s runs with the --docker runtime flag on the host, built images are already available to the cluster."
                        echo "✅ Proceeding to deployment using host local Docker cache."
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    def branch = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'dev').replace('origin/', '')
                    def imageTag = branch == 'main' ? 'latest' : branch
                    
                    echo "Rolling out deployment update in K3s..."
                    
                    // Update Kubernetes deployment images and rollout restart to trigger the update
                    sh "kubectl set image deployment/apexpos-backend backend=${REGISTRY}/${OWNER}/${BACKEND_IMAGE}:${imageTag} -n apexpos --record || true"
                    sh "kubectl set image deployment/apexpos-frontend frontend=${REGISTRY}/${OWNER}/${FRONTEND_IMAGE}:${imageTag} -n apexpos --record || true"
                    
                    sh "kubectl rollout restart deployment/apexpos-backend -n apexpos"
                    sh "kubectl rollout restart deployment/apexpos-frontend -n apexpos"
                    
                    // Verify rollout status
                    sh "kubectl rollout status deployment/apexpos-backend -n apexpos --timeout=90s"
                    sh "kubectl rollout status deployment/apexpos-frontend -n apexpos --timeout=90s"
                    
                    echo "✅ Deployment rolled out successfully to K3s cluster."
                }
            }
        }
    }

    post {
        always {
            deleteDir()
        }
        success {
            echo "🚀 Pipeline execution completed successfully!"
        }
        failure {
            echo "❌ Pipeline execution failed. Please check build logs."
        }
    }
}
