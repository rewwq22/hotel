document.addEventListener('DOMContentLoaded', () => {

    // --- Dynamic Content Logic ---
    const updateDynamicElements = () => {
        // Update Year
        const currentYear = new Date().getFullYear();
        const yearElements = document.querySelectorAll('.js-current-year');
        yearElements.forEach(el => el.textContent = currentYear);
    };

    updateDynamicElements();

    // --- Mobile Menu Logic ---
    const initMobileMenu = () => {
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', () => {
            const isHidden = menu.classList.contains('hidden');
            if (isHidden) {
                menu.classList.remove('hidden');
                btn.querySelector('span').textContent = 'close';
            } else {
                menu.classList.add('hidden');
                btn.querySelector('span').textContent = 'menu';
            }
        });
    };

    initMobileMenu();

    // --- Price Modal Logic ---
    const initPriceModal = () => {
        const modalHTML = `
            <div id="price-modal" class="fixed inset-0 z-[100] flex items-center justify-center opacity-0 pointer-events-none transition-all duration-300">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm js-close-modal"></div>
                <div class="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden transform scale-95 transition-all duration-300">
                    <button class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors js-close-modal">
                        <span class="material-icons">close</span>
                    </button>
                    <div class="p-8">
                        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                            <span class="material-icons text-3xl">picture_as_pdf</span>
                        </div>
                        <h3 class="text-2xl font-bold text-slate-900 mb-2">Получить оптовый прайс</h3>
                        <p class="text-slate-600 mb-6 text-sm">Укажите ваши контакты, и мы вышлем актуальный каталог с ценами для отелей.</p>
                        <form id="modal-price-form" class="space-y-4">
                            <div>
                                <input type="text" name="name" required placeholder="Ваше имя"
                                    class="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                            </div>
                            <div>
                                <input type="tel" name="phone" required placeholder="Телефон для связи"
                                    class="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                            </div>
                            <button type="submit" 
                                class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98]">
                                Получить прайс-лист
                            </button>
                            <div class="flex items-start gap-2 pt-2 text-xs text-slate-400 justify-center">
                                <input type="checkbox" id="modal-privacy" required checked class="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary">
                                <label for="modal-privacy">Я согласен с <a href="/politika-konfidencialnosti/index.html" class="underline hover:text-slate-600">политикой обработки персональных данных</a></label>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('price-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        const modal = document.getElementById('price-modal');
        const modalContent = modal.querySelector('.relative');

        const openModal = () => {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            modal.classList.add('opacity-0', 'pointer-events-none');
            modalContent.classList.remove('scale-100');
            modalContent.classList.add('scale-95');
            document.body.style.overflow = '';
        };

        document.addEventListener('click', (e) => {
            if (e.target.closest('.js-price-popup')) {
                e.preventDefault();
                openModal();
            }
            if (e.target.closest('.js-close-modal')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    };

    initPriceModal();

    // --- Form Handling Logic ---
    const initForms = () => {
        document.addEventListener('submit', async (e) => {
            const form = e.target;
            if (form.tagName !== 'FORM') return;

            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : 'Отправить';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'Отправка...';
            }

            const formData = new FormData(form);
            formData.append('page_url', window.location.href);

            try {
                // Try to send via PHP from root
                const response = await fetch('/mail.php', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');
                    form.reset();
                    // Close modal if open
                    const modal = document.getElementById('price-modal');
                    if (modal && !modal.classList.contains('opacity-0')) {
                        modal.classList.add('opacity-0', 'pointer-events-none');
                        document.body.style.overflow = '';
                    }
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                console.error('PHP mail failed, falling back to mailto:', error);
                let body = `Заявка со страницы: ${window.location.href}\n\n`;
                formData.forEach((value, key) => {
                    if (key !== 'page_url') body += `${key}: ${value}\n`;
                });
                const subject = encodeURIComponent('Заявка с сайта ОТЕЛЬ-СЕРВИС ЮГ');
                const bodyEncoded = encodeURIComponent(body);
                window.location.href = `mailto:89184623269@mail.ru?subject=${subject}&body=${bodyEncoded}`;
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        });
    };

    initForms();

    // --- Cookie Banner Logic ---
    const initCookieBanner = () => {
        const bannerHTML = `
            <div id="cookie-banner" class="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-700 p-4 z-[60] transform translate-y-full transition-transform duration-500 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                <div class="text-sm text-slate-300 text-center sm:text-left max-w-4xl mx-auto">
                    Мы используем файлы cookie для улучшения работы сайта. Продолжая использование сайта, вы соглашаетесь с нашей <a href="/politika-konfidencialnosti/index.html" class="text-primary hover:underline">политикой обработки персональных данных</a>.
                </div>
                <button id="accept-cookies" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap shadow-lg shadow-black/20">
                    Хорошо
                </button>
            </div>
        `;

        if (!localStorage.getItem('cookiesAccepted')) {
            document.body.insertAdjacentHTML('beforeend', bannerHTML);
            const banner = document.getElementById('cookie-banner');
            const btn = document.getElementById('accept-cookies');

            // Show banner after short delay
            setTimeout(() => {
                banner.classList.remove('translate-y-full');
            }, 1000);

            btn.addEventListener('click', () => {
                localStorage.setItem('cookiesAccepted', 'true');
                banner.classList.add('translate-y-full');
                setTimeout(() => {
                    banner.remove();
                }, 500);
            });
        }
    };

    initCookieBanner();

});
