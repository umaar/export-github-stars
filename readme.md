
### Github Star Export

This webapp queries the GitHub API to access your stars, and stores them in an SQLite database. 10,000 stars will occupy ~6mb worth of data.

This repo uses persistent queues, and supports resumable downloading of stars.

#### To run

1. Get a GitHub token from https://github.com/settings/tokens

2. Create a `.env` file:

```
# Contents of .env

GITHUB_TOKEN=your token here

# Any name for your new database
DATABASE_NAME=output
```

3. Run these commands:

```sh
npm i
npm run migrate-db-dev
npm start
```

### TODO:

Insert stars/repos using transactions in bulk
Implement ajax for pagination
Cache users and their star counts
Use http://nvd3.org/ to visualise a users stars over time