pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'moazamyasin/saas-landing:latest'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com'
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                script {
                    // Docker Hub credentials ID check kar lein jo aap ne Jenkins me set ki thi
                    withDockerRegistry(credentialsId: '4c178f54-a872-445a-8553-296d96ee9ebb', toolName: 'docker') {
                        sh "docker build -t ${DOCKER_IMAGE} ."
                        sh "docker push ${DOCKER_IMAGE}"
                    }
                }
            }
        }

        stage('Deploy to K3s') {
            steps {
                // K3s master node par Kubernetes deployment apply karein
                sh "kubectl apply -f saas-deployment.yaml"
            }
        }
    }
}
