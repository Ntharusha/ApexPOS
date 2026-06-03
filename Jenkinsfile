pipeline {
    agent any

    environment {
        NAMESPACE = 'apexpos'
        BACKEND_IMAGE = 'localhost:5000/apexpos-backend:latest'
        FRONTEND_IMAGE = 'localhost:5000/apexpos-frontend:latest'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '3'))
        timeout(time: 15, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Configure Env') {
            steps {
                script {
                    echo '🔍 Querying Minikube Node IP...'
                    // Get the Kubernetes Node IP (exposed NodePort IP) dynamically
                    def nodeIp = sh(script: "kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type==\"InternalIP\")].address}'", returnStdout: true).trim()
                    if (!nodeIp) {
                        error "Could not detect Minikube Node IP! Check Kubernetes connection."
                    }
                    echo "✅ Detected Node IP: ${nodeIp}"
                    
                    // Write VITE_API_URL pointing to backend NodePort (30500)
                    sh "echo 'VITE_API_URL=http://${nodeIp}:30500/api' > client/.env"
                    echo "📝 Configured client/.env with VITE_API_URL=http://${nodeIp}:30500/api"
                }
            }
        }

        stage('Build Images') {
            steps {
                echo '🐳 Building Backend Image...'
                sh "docker build -t ${BACKEND_IMAGE} ./server"

                echo '🐳 Building Frontend Image...'
                sh "docker build -t ${FRONTEND_IMAGE} ./client"
            }
        }

        stage('Push Images') {
            steps {
                echo '📤 Pushing Images to local registry...'
                sh "docker push ${BACKEND_IMAGE}"
                sh "docker push ${FRONTEND_IMAGE}"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo '☸️ Deploying Namespace, PVs, and PVCs...'
                sh "kubectl apply -f /var/jenkins_home/devops-repo/k8s/namespace.yml"
                sh "kubectl apply -f /var/jenkins_home/devops-repo/k8s/database/"

                echo '☸️ Deploying Configs and Secrets...'
                sh "kubectl apply -f /var/jenkins_home/devops-repo/k8s/backend/configmap.yml"
                sh "kubectl apply -f /var/jenkins_home/devops-repo/k8s/backend/secrets.yml"

                echo '☸️ Deploying App Services (Backend & Frontend)...'
                sh "kubectl apply -f /var/jenkins_home/devops-repo/k8s/backend/deployment.yml"
                sh "kubectl apply -f /var/jenkins_home/devops-repo/k8s/backend/service.yml"
                sh "kubectl apply -f /var/jenkins_home/devops-repo/k8s/frontend/deployment.yml"
                sh "kubectl apply -f /var/jenkins_home/devops-repo/k8s/frontend/service.yml"

                echo '🔄 Triggering Rolling Restarts...'
                sh "kubectl rollout restart deployment/apexpos-backend -n ${NAMESPACE}"
                sh "kubectl rollout restart deployment/apexpos-frontend -n ${NAMESPACE}"
                
                echo '🩺 Waiting for deployments to become healthy...'
                sh "kubectl rollout status deployment/apexpos-backend -n ${NAMESPACE} --timeout=120s"
                sh "kubectl rollout status deployment/apexpos-frontend -n ${NAMESPACE} --timeout=120s"
            }
        }
    }

    post {
        success {
            script {
                def nodeIp = sh(script: "kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type==\"InternalIP\")].address}'", returnStdout: true).trim()
                echo "--------------------------------------------------------"
                echo "🎉 Pipeline Completed Successfully!"
                echo "👉 Access Frontend: http://${nodeIp}:30080"
                echo "👉 Access Backend:  http://${nodeIp}:30500"
                echo "--------------------------------------------------------"
            }
        }
        failure {
            echo '❌ Pipeline failed! Please check logs.'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
