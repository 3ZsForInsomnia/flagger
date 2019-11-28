pipeline {
  agent {
    node {
      label 'Flagger'
    }

  }
  stages {
    stage('Lint') {
      steps {
        script {
          npm run lint
        }

      }
    }

    stage('Test') {
      steps {
        script {
          npm run test
        }

      }
    }

    stage('Build') {
      steps {
        script {
          npm run build
        }

      }
    }

    stage('Release') {
      steps {
        script {
          npm run publish
        }

      }
    }

  }
}