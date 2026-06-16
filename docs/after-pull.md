## After fetch and pull (with database, with `.env` file)

```bash
# if from another branch
git checkout main

# if already in main branch
git fetch
git pull origin main
```

[Back to README](../README.md)

### Frontend changes

If changes are made in the frontend files:

- `*.jsx`,
- `*.tsx`,
- `*.js`,
- `*.css`,
- etc.

```bash
npm run dev
```

Run this if dependencies have changed (`package.json` or `package-lock.json`):

```bash
npm install
```

[Back to README](../README.md)

### Backend changes

If changes are made in the following directories:

- `./app/Http/Controllers/`,
- `./app/Models/`,
- `./database/migrations/`

```bash
composer install
php artisan migrate
```

If there are any errors (especially those related to `unknown column values`), you may want to check [database changes](#database-changes).

[Back to README](../README.md)

### Route changes

If changes are made in the following directories:

- `routes/`,
- `config/`,
- `.env`

```bash
php artisan optimize:clear
php artisan migrate
```

Run these if there are changes in the dependency files (`composer.json` or `composer.lock`):

```bash
composer install
npm install
```

[Back to README](../README.md)

### Database changes

If there are any changes to the database such as:

- new table
- new column
- changed column
- new migration file

Try this first:

```bash
php artisan migrate
```

If there is still an error, you may want to consider a full database reset:

```bash
php artisan migrate:fresh --seed
```

> [!WARNING]
> Running this command will delete all existing local database tables and data, then recreate and seed them. Only run this when needed.

[Back to README](../README.md)