# Install Periscope

Periscope runs locally on your computer. It includes the application, fonts, fictional example data, and a SQLite database that initializes automatically. No API keys, account setup, or separate database service are required.

## Prerequisites

- Git.
- Node.js **22.13 or later**, with npm. Installation was validated with **Node.js 22.23.2 and npm 10.9.8**. Node's built-in `node:sqlite` module is required.
- Internet access for the initial clone and dependency installation.
- A writable project directory for the build output and saved database.

Check your installed versions:

```sh
git --version
node --version
npm --version
```

## Get the project

```sh
git clone https://github.com/kalyankatika/uxd-periscope.git
cd uxd-periscope
npm ci
```

`npm ci` installs the dependency versions recorded in `package-lock.json`. Run subsequent commands from the `uxd-periscope` directory.

## Run the app

For development, with automatic reloads after edits:

```sh
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Keep the terminal running; press **Ctrl+C** to stop the server.

For a local production build, stop any development server on the same port, then run:

```sh
npm run build
npm start
```

Both modes bind to `127.0.0.1`, so the app is accessible from the same computer. To choose another port:

```sh
npm run dev -- --port 3001
```

For the production server, use `npm start -- --port 3001`. Open `http://127.0.0.1:3001` when using that port.

## First use

The initial screen is **Work map**. A fresh installation displays the fictional leadership example: 26 people, seven teams, and 13 projects. Explore the map or switch to **Grid**, then use **Overview**, **Teams & reporting**, **Projects**, and **Capacity** from the navigation.

- **Example data** is for exploration. Edits stay in memory and reset on reload.
- **Open workspace** switches to the saved SQLite workspace. A new database starts with a smaller, separate sample of 12 people and five projects. Edits in this mode persist.
- **Use example data** returns to the leadership example.

To bring in your own data, open **People & imports** in the saved workspace. Import people before projects, review the column and label mappings, and confirm the import. See [Enterprise data mapping](enterprise-data-mapping.md) for required fields, stable IDs, supported labels, and merge/replace behavior. Source connectors and automatic synchronization are not implemented.

## Configure the database

Configuration is optional. The default saved database is:

```text
data/planner.sqlite
```

The server creates the directory, schema, and starter records on first access. Existing databases migrate automatically. SQLite may also create `planner.sqlite-wal` and `planner.sqlite-shm` alongside the database. The default database files and local environment files are excluded from Git.

To use another location, create `.env.local` in the project root and set an absolute path:

```dotenv
DATABASE_PATH=/absolute/path/to/periscope/planner.sqlite
```

On Windows, a forward-slash path such as `C:/Users/your-name/PeriscopeData/planner.sqlite` can be used. The parent directory must be writable by the user running Node.js. Restart the server after changing the configuration. Changing the path selects a different database; it does not move existing records.

`.env.example` documents this variable. No other environment variables are required.

## Back up and restore

Stop every Periscope server using the database before making a file backup. Copy the entire `data` directory to a backup location, including any SQLite WAL/SHM files. If you set `DATABASE_PATH`, back up that database and its companion files instead. Keep any `.env.local` configuration with your backup.

To restore, stop the server, preserve the current database as a separate backup, and put the backed-up database and companion files in the configured location before restarting. Restoring replaces the saved workspace with the backup's contents. Example-mode edits are never part of the saved database.

The CSV exports in **People & imports** and graph JSON-LD export are useful for data exchange; a database backup preserves the complete persisted workspace.

## Update an installation

Stop the server and back up the database first. Commit or otherwise preserve your local code changes before updating.

```sh
git pull --ff-only
npm ci
npm test
npm run build
npm start
```

The default `data` directory and `.env.local` remain local. Do not remove the database when updating the application.

## Verify the installation

```sh
npm test
npm run typecheck
npm run build
```

Tests use temporary databases. They cover calculations, import mappings and validation, graph relationships, reporting rollups, persistence, migrations, and API behavior.

After starting the server, check that the Work map loads, switch to Grid, and open Overview. The [40-second silent demo](../artifacts/platform-demo/periscope-overview-demo.mp4) shows the main workflow. Demo recording tools are optional; Python, ffmpeg, and agent-browser are not required to run the application.

## Troubleshooting

| Issue | Resolution |
| --- | --- |
| `node` or `npm` is not found | Install Node.js with npm, reopen the terminal, and check the versions. |
| `No such built-in module: node:sqlite` or an unsupported engine error | Use Node.js 22.13 or later, then rerun `npm ci`. |
| An experimental SQLite warning appears | Node.js 22 may print this warning. It does not prevent the application from running. |
| Port 3000 is already in use | Stop the other server or use `--port 3001` as shown above. |
| `npm start` cannot find a production build | Run `npm run build` successfully before `npm start`. |
| SQLite cannot open the database | Check `DATABASE_PATH` and folder write permissions. Use a local writable directory. |
| Edits disappear after a reload | Check whether **Example data** is active. Use **Open workspace** for persistent edits. |
| An import is blocked | Read the mapping review errors and correct IDs, references, or labels using the [mapping guide](enterprise-data-mapping.md). |

## Deployment scope

This version is a local application without authentication. A shared enterprise deployment requires authentication, access controls, durable storage, and an agreed data integration approach. The included start command intentionally binds to localhost; these instructions do not publish the app to the internet.
