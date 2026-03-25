/**
 * image-loader.js — Подстановка фото из admin-панели в страницы сайта
 *
 * Как работает:
 * 1. Читает localStorage (ключ 'hotel-admin-images') — там base64 фото
 * 2. Находит все img с атрибутом data-img-slot="slot-id"
 * 3. Подставляет загруженное фото вместо placeholder
 *
 * Подключается на каждой странице: <script src="RELATIVE/js/image-loader.js"></script>
 */
(function() {
    'use strict';

    var DB_KEY = 'hotel-admin-images';

    try {
        var saved = localStorage.getItem(DB_KEY);
        if (!saved) return;

        var data = JSON.parse(saved);
        var images = data.images;
        if (!images) return;

        // Find all img tags with data-img-slot attribute
        var imgs = document.querySelectorAll('img[data-img-slot]');
        for (var i = 0; i < imgs.length; i++) {
            var slotId = imgs[i].getAttribute('data-img-slot');
            if (slotId && images[slotId]) {
                imgs[i].src = images[slotId];
            }
        }
    } catch(e) {
        // Silently fail — don't break the page
    }
})();
