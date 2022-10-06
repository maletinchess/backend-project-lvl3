### Hexlet tests and linter status:
[![Actions Status](https://github.com/maletinchess/backend-project-lvl3/workflows/hexlet-check/badge.svg)](https://github.com/maletinchess/backend-project-lvl3/actions) <a href="https://codeclimate.com/github/maletinchess/backend-project-lvl3/maintainability"><img src="https://api.codeclimate.com/v1/badges/ee5bed22031812444266/maintainability" /></a> <a href="https://codeclimate.com/github/maletinchess/backend-project-lvl3/test_coverage"><img src="https://api.codeclimate.com/v1/badges/ee5bed22031812444266/test_coverage" /></a> [![my-check](https://github.com/maletinchess/backend-project-lvl3/actions/workflows/my-check.yml/badge.svg)](https://github.com/maletinchess/backend-project-lvl3/actions/workflows/my-check.yml)

Pageloader - консольная утилита для скачивания интернет-страницы и ее ресурсов.

Требования к ПО - Node не ниже 16 версии.

Установка.

1. Клонирование репозитория: git clone https://github.com/maletinchess/backend-project-lvl3.git
2. Установка зависимостей: make install (npm ci).
3. Установка бинарного файла: npm link .

Использование.

pageloader [options] <url>

Options:
  -o, --output [dir] - директория для сохранения файлов (по умолчанию: текущая рабочая директория)
  
 Тестирование - make test
 
 Проверка линтера - make lint

Основная функция:

<a href="https://asciinema.org/a/0wNIpljslINY5fo8Mc5UM3c2v?speed=3" target="_blank"><img src="https://asciinema.org/a/0wNIpljslINY5fo8Mc5UM3c2v.svg" /></a>

Debug:

<a href="https://asciinema.org/a/8p4tRuN1cSvMApAXKw3S0vHit?speed=3" target="_blank"><img src="https://asciinema.org/a/8p4tRuN1cSvMApAXKw3S0vHit.svg" /></a>

Ошибки:

<a href="https://asciinema.org/a/slgFlO6XXl3uZWsqxlJdo0VFm?speed=3" target="_blank"><img src="https://asciinema.org/a/slgFlO6XXl3uZWsqxlJdo0VFm.svg" /></a>
