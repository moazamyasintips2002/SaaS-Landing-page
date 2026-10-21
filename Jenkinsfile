pipeline {
    agent any

    environment {
        // Docker image ka naam jo Docker Hub par push hoga
        DOCKER_IMAGE = 'moazamyasin/saas-landing:latest'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Aap ka exact GitHub repository URL jo aap ne bataya hai
                git branch: 'main', url: 'https://github.com/moazamyasintips2002/SaaS-Landing-page.git'
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                script {
                    // Aap ki Docker Hub credentials ID jo Jenkins me save hai
                    withDockerRegistry(credentialsId: 'ae697d34-d8f2-48b5-9578-3bca0831a9c7', toolName: 'docker') {
                        sh "docker build -t ${DOCKER_IMAGE} ."
                        sh "docker push ${DOCKER_IMAGE}"
                    }
                }
            }
        }

        stage('Deploy to K3s') {
            steps {
                // K3s cluster par deployment apply karne ki command
                sh "kubectl apply -f saas-deployment.yaml"
            }
        }
    }
}
