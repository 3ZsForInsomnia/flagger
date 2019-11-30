module.exports = {
  branch: 'master',
  tagFormat: 'v${version}',
  prepare: ['@semantic-release/changelog', '@semantic-release/npm', '@semantic-release/git'],
  verifyConditions: ['@semantic-release/npm', '@semantic-release/git'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING']
        }
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'angular',
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING']
        },
        writerOpts: {
          commitsSort: ['subject', 'scope']
        }
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['dist/**/*.{js,css}', 'docs', 'package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          { path: 'dist/asset.min.css', label: 'CSS distribution' },
          { path: 'dist/asset.min.js', label: 'JS distribution' }
        ]
      }
    ],
    '@semantic-release/npm'
  ]
};
