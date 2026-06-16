# GUIDES

This guide covers installation, configuration, and running of the project.

## Required dependencies

- List of [dependencies](docs/dependencies.md)

## Fresh setup

If the dependencies have been installed, but not yet configured for the project:

- [Database](docs/fresh-setup.md#database-setup)
- [`.env` setup](docs/fresh-setup.md#env-file-setup)
- [composer setup](docs/fresh-setup.md#composer-setup)
- [npm and php setup](docs/fresh-setup.md#npm-and-php-setup)

## After `git fetch` and `git pull`

<<<<<<< HEAD
- [Frontend changes](#frontend-changes)
- [Backend changes](#backend-changes) (`Controllers/`, `Models/`, `migrations/`)
- [Route changes](#route-changes) (`routes/`, `config/`)
- [Database changes](#database-changes)

## Running the webiste

- [Run the website](#running-the-website)

---

## Installing dependencies

Make sure to have the following dependencies installed:

- [Composer](https://getcomposer.org/download/)
- [Laravel 13](https://laravel.com/docs/13.x/installation#installing-php)
- [Php 8.3 or higher](https://www.php.net/downloads.php?os=windows&osvariant=windows-native&version=default&multiversion=Y)
- [Node.js](https://nodejs.org/en/download) (as it includes `npm`)
- Database
  - [XAMPP](https://www.apachefriends.org/download.html)
  - [MariaDB](https://mariadb.org/download/?t=mariadb&p=mariadb&r=12.3.2&os=windows&cpu=x86_64&pkg=msi&mirror=ossplanet)
  - SQLite
    - [CLI tools](https://sqlite.org/download.html)
    - [GUI](https://sqlitebrowser.org/dl/)


## Verify PHP

Check php version by running: `php -v`. If version is < 8.3:

**Windows**:

Set your system environment PATH variables to use the latest (in your local device) version of PHP. 

Look for the `php.exe` directory, and copy the directory as a text, e.g. `C:\Program Files\PHP\current`

> [!WARNING]
> **DO NOT INCLUDE** php.exe: \
> WRONG: `C:\Program Files\PHP\current\php.exe` \
> CORRECT: ``C:\Program Files\PHP\current``

**Linux**:

For Linux users, you may want to consider upgrading PHP. Check you distro's official documentation on how to update PHP.

## For fresh setup

If all of the required dependencies have been installed, proceed here.

**Checklist**:

- [ ] Database
- [ ] `.env` file setup
- [ ] `composer` setup
- [ ] `npm` and `php` setup

## Database setup

Setup your database.

**For Windows:**

- [XAMPP](#xampp) (phpmyadmin)
- [MariaDB](#mariadb) (mysql)
- [SQLite](#windows-setup)

**For Linux:**

- [MariaDB](#mariadb) (mysql)
- [SQLite](#linux-setup)

### SQLite

Create a `.sqlite` file:

#### Linux setup

```bash
# for linux users
touch database/database.sqlite
```

#### Windows setup

```powershell
# for powershell users
code database/database.sqlite

# if code is not available
New-Item -ItemType File database/database.sqlite -Force
```

Then proceed to [SQLite `.env` setup](#for-sqlite-users)

### MariaDB

```sql
sudo mariadb -u root -p
-- enter password, by default i think none?

-- create a new database
MariaDB [(none)]> CREATE DATABASE portal_dashboard;

-- create a new user for database, save password for later
CREATE USER '<any_username>'@'localhost' IDENTIFIED BY 'password';
CREATE USER '<any_username>'@'127.0.0.1' IDENTIFIED BY 'password';

-- grant privileges to new user
GRANT ALL PRIVILEGES ON portal_dashboard.* TO '<username>'@'localhost';
GRANT ALL PRIVILEGES ON portal_dashboard.* TO '<username>'@'127.0.0.1';

-- apply privileges to user
FLUSH PRIVILEGES;
exit;
```

### XAMPP

Open XAMPP amp, and start both Apache and MySQL modules. Once started, click on the `Admin` button for MySQL. Create a new database with the name `portal_dashboard`, and create a new user, and grant needed permissions.

**Create new database**

<img width="810" height="730" alt="image" src="https://github.com/user-attachments/assets/fad22525-a72e-474f-88c6-d68b9b03176b" />

---

**Create new user under `User accoutns` tab**

<img width="1877" height="579" alt="image" src="https://github.com/user-attachments/assets/097bf121-bbe3-43a6-a009-f28d083d356a" />

---

**Add information P1**

<img width="633" height="429" alt="image" src="https://github.com/user-attachments/assets/7ec04adb-8f08-467a-a771-effce9c4c2ed" />

---

**Add information P2**

If you have already created a database, no need to check the boxes.

<img width="419" height="115" alt="image" src="https://github.com/user-attachments/assets/8ea5dc46-9d2f-453f-a0a0-aa3289911d2f" />

---

**Grant privileges**

<img width="1346" height="709" alt="image" src="https://github.com/user-attachments/assets/0707bcd2-7d05-4bfb-8f97-cbb82a0ea995" />

Click `go` once finished.

## `.env` file setup

Initialize `.env` file. Rename `.env.example` to `.env`, and change necessary details:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=portal_dashboard
DB_USERNAME=<your_username>
DB_PASSWORD=<your_password>
```

### For SQLite users

Set your `.env` file to:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database/database.sqlite

# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_USERNAME=<your_username>
# DB_PASSWORD=<your_password>
```

## `composer` setup

Install `vendor/` by executing:

```composer
composer install
```

## `npm` and `php` setup

For npm and php, run the following commands before proceeding:

```bash
# npm commands before running
npm install

# also, check npm audit
npm audit

# if vulnerability is found, try executing:
npm install concurrently@latest

# if no vulnerability, proceed to:
npm run build

# for php commands
php artisan key:generate
php artisan migrate

# seed the tables
php artisan db:seed
```

## After fetch and pull (with database, with `.env` file)

```bash
# if from another branch
git checkout main

# if already in main branch
git fetch
git pull origin main
```

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
=======
- [Frontend changes](docs/after-pull.md#frontend-changes)
- [Backend changes](docs/after-pull.md#backend-changes) (`Controllers/`, `Models/`, `migrations/`)
- [Route changes](docs/after-pull.md#route-changes) (`routes/`, `config/`)
- [Database changes](docs/after-pull.md#database-changes)
>>>>>>> 26e5f86 (chore: separated instructions into different md files)

## Running the website

- [Run the website](docs/running-website.md#running-the-website)

## API Schema

- [JSON Schema](docs/api-schema.md)
