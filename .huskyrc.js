const runNpmLock = 'npm install --frozen-lockfile';

module.exports = {
  hooks: {
    'post-checkout': `if [[ $HUSKY_GIT_PARAMS =~ 1$ ]]; then ${runNpmLock}; fi`,
    'post-merge': runNpmLock,
    'post-rebase': 'npm install',
    'pre-commit': 'npx lint-staged'
  }
};
