pipeline {
    // 1. 파이프라인 전체를 Jenkins 호스트에서 실행 (모든 stage가 agent를 상속)
    agent any

    // 2. GitHub 'main' 브랜치에 push/merge될 때 자동 실행
    triggers {
        githubPush()
    }

    stages {
        // 3. Jenkins 호스트에 설치된 NodeJS로 빌드 실행
        stage('Build') {
            // Jenkins 호스트에 설치된 NodeJS/npm을 사용
            stages {
                // 3-1. 의존성 설치
                stage('Install Dependencies') {
                    steps {
                        echo 'Installing npm dependencies (on host)...'
                        sh 'npm ci'
                    }
                }
        
                // 'test' 스크립트가 프로젝트에 없으므로 'Run Tests' 단계는 주석 처리
                // stage('Run Tests') {
                //     steps {
                //         echo 'Running tests (on host)...'
                //         sh 'npm run test'
                //     }
                // }
        
                // 3-2. 프로덕션용 정적 파일 빌드
                stage('Build Project') {
                    steps {
                        echo 'Building static files (on host)...'
                        withCredentials([string(credentialsId: 'VITE_API_URL', variable: 'VITE_API_URL')]) {
                            sh 'npm run build'
                        }
                    }
                }
            }
        } // End of Build Stage

        // 5. Nginx 서버로 빌드 결과물 배포
        stage('Deploy to Nginx') {
            steps {
                echo 'Deploying to Nginx (from host)...'
                
                // [주의] 'jenkins' 유저는 이 디렉터리에 대한 쓰기 권한이 필요합니다.
                sh 'rsync -avz --delete dist/ /var/www/html/fisa-front/'

                echo 'Deployment Complete!'
            }
        }
        
    } // End of stages

    // 6. 파이프라인 종료 후 작업 공간 정리 및 결과 알림
    post {
        always {
            // 최상위 agent의 작업 공간(workspace)을 정리합니다.
            echo 'Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}

