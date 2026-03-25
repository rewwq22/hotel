# AGENT.md — Инструкции для AI-агента по проекту hotel-service-krd.ru

> **ВАЖНО:** Этот файл дополняет `CLAUDE.md` (авто-загружаемый).
> При старте сессии сначала выполни протокол из `CLAUDE.md`, потом читай этот файл.

---

## Протокол восстановления после обрыва

Если ты новый агент / новая сессия / предыдущий агент не закончил:

1. **Прочитай** `.claude/state/wip.md` — там список незавершённых задач
2. **Сообщи пользователю** если есть задачи со статусом `IN_PROGRESS` или `BLOCKED`
3. **Перед началом работы** — запиши свою задачу в `wip.md` как `IN_PROGRESS`
4. **Каждые 3-5 шагов** — обнови прогресс в `wip.md` (что сделано, что осталось)
5. **После завершения** — переведи в `DONE`, запиши в `.claude/state/changelog.md`
6. **При ошибке** — переведи в `BLOCKED`, запиши причину и контекст для следующего агента

### Зачем это нужно
- VS Code может зависнуть → следующая сессия подхватит
- Токены могут кончиться на полпути → другой агент продолжит
- Пользователь может переключиться → контекст не потеряется

---

## Обзор проекта

Сайт компании **ОТЕЛЬ-СЕРВИС ЮГ** — производитель и поставщик постельного белья и текстиля для гостиниц и отелей оптом. Краснодар.

- **Домен:** hotel-service-krd.ru
- **Сервер:** 5.35.82.20 (FASTPANEL / nginx 1.24.0)
- **FTP:** логин `hotel_servic` (доступы в файле `ftp`)
- **Фреймворк:** Статический HTML + Tailwind CSS (CDN) + Vanilla JS
- **Метрика:** Яндекс.Метрика ID 106791450

---

## КРИТИЧЕСКИ ВАЖНО — НЕ ТРОГАТЬ

1. **Яндекс.Метрика** — код счётчика в `<head>` каждой страницы (ID 106791450). НЕ удалять, НЕ изменять.
2. **Файл подтверждения Яндекс.Вебмастера** — HTML-файл в корне сайта (yandex_*.html). НЕ удалять.
3. **Политика конфиденциальности** — `/politika-konfidencialnosti/index.html`. НЕ удалять.

---

## Структура проекта

```
hotel-service-krd.ru/
├── index.html                          # Главная страница
├── css/style.css                       # Кастомные стили (минимальные, основная стилизация через Tailwind CDN)
├── js/script.js                        # Общий JS (год, мобильное меню, модалка прайса, формы, cookie-баннер)
├── image/                              # Изображения
├── katalog/                            # Каталог продукции
│   ├── index.html                      # Главная каталога
│   ├── byaz/                           # Бязь (+ /1-5-spalnyj/, /2-spalnyj/, /euro/)
│   ├── satin/                          # Сатин (+ размеры)
│   ├── strajp-satin/                   # Страйп-сатин (+ размеры)
│   ├── perkal/                         # Перкаль (+ размеры)
│   ├── poplin/                         # Поплин
│   ├── komplekty/                      # Комплекты КПБ
│   ├── prostyni/                       # Простыни
│   ├── prostyni-na-rezinke/            # Простыни на резинке
│   ├── prostyni-dlya-vysokih-matrasov/ # Простыни для высоких матрасов
│   ├── pododeyalniki/                  # Пододеяльники (+ размеры)
│   ├── navolochki/                     # Наволочки (+ размеры)
│   ├── polotenca/                      # Полотенца
│   ├── podushki/                       # Подушки
│   ├── odeyala/                        # Одеяла
│   ├── namatrasniki/                   # Наматрасники
│   ├── halaty/                         # Халаты
│   └── tapochki/                       # Тапочки
├── resheniya/                          # Готовые решения
│   ├── index.html                      # Главная решений
│   ├── 3-zvezdy/                       # 3 звезды
│   ├── 4-zvezdy/                       # 4 звезды
│   ├── 5-zvezd/                        # 5 звёзд
│   ├── hostely/                        # Хостелы
│   ├── sanatorii/                      # Санатории
│   ├── apartamenty/                    # Апартаменты
│   └── bazy-otdyha/                    # Базы отдыха / глэмпинги
├── uslugi/
│   └── vyshivka-logotipa/              # Вышивка логотипа
├── blog/                               # Блог
│   ├── index.html                      # Листинг статей
│   ├── kak-vybrat-postelnoe-bele-dlya-gostinicy/
│   ├── kakaya-plotnost-luchshe-dlya-otelya/
│   ├── skolko-komplektov-nuzhno-na-nomer/
│   ├── pochemu-v-otelyah-beloe-bele/
│   ├── kak-stirat-gostinichnoe-bele/
│   ├── gost-trebovaniya-k-belyu-v-gostinicah/
│   ├── raschet-tekstilya-dlya-otkrytiya-gostinicy/
│   └── satin-ili-byaz-chto-luchshe-dlya-otelya/
├── krasnodar/                          # Региональный лендинг
├── sochi/                              # Региональный лендинг
├── anapa/                              # Региональный лендинг
├── gelendzhik/                         # Региональный лендинг
├── rostov-na-donu/                     # Региональный лендинг
├── o-kompanii/                         # О компании
├── dostavka-i-oplata/                  # Доставка и оплата
├── individualnyj-poshiv/               # Индивидуальный пошив
├── optovye-postavki/                   # SEO-лендинг: оптовые поставки
├── postelnoe-bele-optom/               # SEO-лендинг: белье оптом
├── gostinichnoe-postelnoe-bele/        # SEO-лендинг: гостиничное белье
├── beloe-postelnoe-bele/               # SEO-лендинг: белое белье
├── tekstil-dlya-horeca/                # SEO-лендинг: текстиль HoReCa
├── kontakty/                           # Контакты
└── politika-konfidencialnosti/         # Политика конфиденциальности
```

---

## Шаблон страницы

Каждая HTML-страница следует одному шаблону:

```html
<!DOCTYPE html>
<html lang="ru" class="scroll-smooth">
<head>
    <!-- Мета, шрифты, Tailwind CDN, конфиг, style.css, canonical, Яндекс.Метрика -->
</head>
<body class="bg-background-light text-slate-800 font-display antialiased">
    <!-- Header (фиксированный, с навигацией, телефоном, соцсетями, CTA) -->
    <!-- Хлебные крошки + контент страницы -->
    <!-- Footer (форма, ссылки, контакты, копирайт) -->
    <script src="RELATIVE/js/script.js"></script>
</body>
</html>
```

### Относительные пути

Все пути в проекте **относительные** (не абсолютные от корня /):

| Глубина страницы | Префикс | Пример |
|---|---|---|
| Корень (`/index.html`) | нет / `./` | `katalog/index.html` |
| 1 уровень (`/katalog/index.html`) | `../` | `../css/style.css` |
| 2 уровня (`/katalog/byaz/index.html`) | `../../` | `../../css/style.css` |
| 3 уровня (`/katalog/byaz/euro/index.html`) | `../../../` | `../../../css/style.css` |

---

## Цветовая палитра

| Токен | Hex | Назначение |
|---|---|---|
| `primary` | #65a30d | Основной зелёный (lime-600) |
| `primary-dark` | #4d7c0f | Тёмный зелёный (lime-700) |
| `footer-bg` | #1f291a | Фон footer |
| `footer-input` | #2d3826 | Поля ввода footer |
| `background-light` | #f6f7f6 | Фон body |
| `background-dark` | #1a1c18 | Тёмный фон |

---

## Контакты компании

- **Телефон:** +7 (918) 462-32-69
- **Email:** 89184623269@mail.ru
- **WhatsApp:** wa.me/79184623269
- **Telegram:** t.me/+79184623269
- **MAX:** max.ru/u/f9LHodD0cOLtlZKqeHi5NhewJ9kVRPXACHuIBn9Du0G5Py8-NqzEFWiLJTs
- **ИНН:** 2312233967
- **Бренд:** ОТЕЛЬ-СЕРВИС ЮГ
- **Слоган:** Оснащение отелей под ключ

---

## Навигация

### Header (4 пункта)
1. Каталог → /katalog/
2. Решения → /resheniya/
3. Блог → /blog/
4. Контакты → /kontakty/

### Footer «Разделы»
1. Опт → /postelnoe-bele-optom/
2. Гостиничное белье → /gostinichnoe-postelnoe-bele/
3. Белое белье → /beloe-postelnoe-bele/
4. Текстиль HoReCa → /tekstil-dlya-horeca/

---

## Яндекс.Метрика (НЕ УДАЛЯТЬ)

```html
<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=106791450', 'ym');
    ym(106791450, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/106791450" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->
```

---

## SEO: Семантическое ядро

Полное семантическое ядро в файле `semantic-core.md` в корне проекта.
Кластеризация: 11 кластеров, ~245 запросов.

### Правила SEO при создании страниц:
1. Уникальный `<title>` с основным ключом кластера (до 70 символов)
2. Уникальный `<meta description>` (до 160 символов) + УТП
3. `<h1>` — точное вхождение основного ключа (один H1 на страницу)
4. Canonical: `<link rel="canonical" href="index.html">`
5. Перелинковка между связанными разделами
6. SEO-текст 1500-3000 символов на страницах каталога
7. Статьи блога: 3000-7000 символов

---

## Формы и JS

- Все формы отправляются через `/mail.php` (POST, FormData)
- Fallback: mailto:89184623269@mail.ru
- Модалка прайса: класс `.js-price-popup` на кнопке
- Мобильное меню: `#mobile-menu-btn`, `#mobile-menu`
- Cookie-баннер: автоматически через `script.js`
- Год в копирайте: класс `.js-current-year`

---

## Деплой

1. Подключиться по FTP: `5.35.82.20`, логин `hotel_servic`
2. Загрузить файлы из `site-backup/hotel-service-krd.ru/` в корень FTP
3. Не удалять и не перезаписывать файл подтверждения Яндекс.Вебмастера в корне
4. Не удалять `mail.php` на сервере
