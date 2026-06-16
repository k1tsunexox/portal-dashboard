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
> CORRECT: `C:\Program Files\PHP\current`

**Linux**:

For Linux users, you may want to consider upgrading PHP. Check you distro's official documentation on how to update PHP.

[Back to README](../README.md)
