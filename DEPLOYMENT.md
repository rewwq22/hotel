# DEPLOYMENT.md — Инструкции по деплою на сервер

## Данные сервера

| Параметр | Значение |
|----------|----------|
| IP-адрес | 5.35.82.20 |
| Панель | FASTPANEL |
| Веб-сервер | nginx 1.24.0 |
| Домен | hotel-service-krd.ru |
| SSL | Да (HTTPS, редирект с HTTP) |
| FTP-логин | hotel_servic |
| FTP-пароль | см. файл `ftp` |

## Загрузка файлов по FTP

### Через командную строку (lftp)

```bash
# Установить lftp если нет
sudo apt install lftp

# Подключиться и залить файлы
lftp -u hotel_servic,ПАРОЛЬ 5.35.82.20 <<EOF
mirror -R site-backup/hotel-service-krd.ru/ /
quit
EOF
```

### Через FileZilla

1. Хост: `5.35.82.20`
2. Логин: `hotel_servic`
3. Пароль: из файла `ftp`
4. Порт: `21`
5. Перетащить содержимое `site-backup/hotel-service-krd.ru/` в корень FTP

## Что НЕ перезаписывать на сервере

1. **Файл подтверждения Яндекс.Вебмастера** — `yandex_*.html` в корне
2. **mail.php** — обработчик форм на сервере
3. **Любые серверные конфиги** — `.htaccess`, `robots.txt`, `sitemap.xml` (если есть)

## Порядок деплоя

1. Убедиться, что все HTML-страницы содержат Яндекс.Метрику
2. Проверить локально открытие страниц в браузере
3. Загрузить по FTP
4. Проверить в браузере: https://hotel-service-krd.ru/
5. Проверить в Яндекс.Вебмастере что индексация идёт

## Проверка после деплоя

```bash
# Проверить главную
curl -sI https://hotel-service-krd.ru/ | head -5

# Проверить новые страницы
curl -sI https://hotel-service-krd.ru/katalog/polotenca/ | head -5
curl -sI https://hotel-service-krd.ru/krasnodar/ | head -5
curl -sI https://hotel-service-krd.ru/blog/pochemu-v-otelyah-beloe-bele/ | head -5
```

Ожидаемый ответ: `HTTP/1.1 200 OK` или `HTTP/2 200`
