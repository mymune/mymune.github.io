         /*
         * Changelog
         *
         * v.0.4.4   ¯\_(ツ)_/¯
         *
         *
         * Release:  v.0.5
         * + новый дизайн
         * + таблыца статистики
         * + log функция
         * +- панель управления настройками и стратегиями
         *
         *
         * Release:  v.0.6.2
         * + панель управления: настройки стратегий (с переключателями)
         * + добавлено SOL/USDT
         * + debug функция
         * + пофиксина таблица (данные вставлялись в конце)
         * + кнопка остановки музыки
         *
         *
         * Release:  v.0.7.3
         * + улучшиние стратегий (додано BTC [$10] 0.25% (1m))
         * + добавлено ETH/USDT
         * + добавлено автонастройка статегий (signal) (для каждий статегий разные оповещение)
         * + мелкие правки кода
         *
         *
         * pre-release: v.0.8
         * - улучшить и переписать код
         * - запуск одновременно 2 и болие стратегий (нужна база даных)
         * - панель анализа данных
         * - функция психологической поддержки
         * - let const
         * - сервернуя часть
         * - уведомления на телеграм
         * - статигии на другие криптовалюты
         * - улучшение дизайна
         * - скриншоты графика и свеч для сравнения и анализа
         */

         /*
         *  - статегия BTC/USDT -- ETH/USDT 5m
         *  1. если предедужчая свеча больше 0.50%, не покупать.(нужна база даных)
         *  2. если 1m стратегия не сработала, не покупать.
         *
         *  - статегия SOL/USDT 1m-5m
         *  3. если за последние 1 часа был сигнал и сработала покупка (в пределах 1 ч),
         *     следующий сигнал  в премижутку 1 часа, не покупать.
         *  4. если сиглал свеча више 1.80%(5м), 1.50%(1м), не покупать.
         *  5. если цена близко до круглих значений 115, 120, 125, не покупать.
         *  6. если тренд низходящий, не покупать.
         *  7. если предудущая свеча с большим минусом (-0.40%)(1m), покупать, но не болие (-1.0%).
         *
         *
         *  - стратегия по убиткам:
         *   1. если после сигнала, следуючие 2 свечи -0.30% -- сигнал на убыток = продавать
         */


        function DOMLoaded(callback) {
            if (document.readyState != "loading") {
                callback();
            } else {
                document.addEventListener("DOMContentLoaded", callback)
            }
        };


        /*
         * urlPrice(x) возвращает url с параметрамы.
         * x впемя в unix. пример: 1629108000000 --> 10:00:00 2021-08-16
         */
        function urlPrice(x) {
            let url = new URL("https://api.binance.com/api/v1/klines"); // https://api.binance.com/api/v3/time
            url.searchParams.set("symbol", setting("symbol"));
            url.searchParams.set("interval", setting("interval") + "m");
            url.searchParams.set("startTime", x);
            debug(url);
            return url;
        };

        /*
         * localStorageTime() добавлеет в localStorage и возвращает 2 значения.
         * ключ «startTime» : значение «1629276300000» начальное(временное) время.
         * ключ «endTime» : значение «актульние(последнее)» время.
         * для хренения и передачи в urlPrice() параметра актуального unix времени.
         */
        function localStorageTime() {
            if (localStorage.getItem("startTime")) { // если есть начальное время
                return localStorage.getItem("endTime"); // возращает последнее время у функцию
            } else { // если начальное(временное) времени нет
                localStorage.setItem("startTime", timeUnix()); // установлает начальное время
                return localStorage.getItem("startTime"); // возращает начальное время у функцию
            }
            debug("получить з хранилища ...");
        };

        /*
         * procent(x, y) расчет процентнои разници между двумя числами.
         * var c - % от x, y.
         * также следит за изменении цены.
         * c.toFixed уберает ненужние числа.
         */
        function procent(a, b) {
            let c = a / b * 100 - 100;
            c = (-1) * c;
            debug(c);
            return c.toFixed(2);
        };

         /*
         * getPrice() GET запрос, тип ответа - JSON-строка.
         * price[0][1] Многомерные массивы, [0] = первое число. [1] = второе.
         */
        const getPrice = function(callback) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", urlPrice(localStorageTime()));
            xhr.responseType = "json"; // возвращает тип ответа
            xhr.addEventListener("load", callback);
            xhr.send(null); // запрос

            xhr.onload = function() {
                debug("xhr.response.length: " +xhr.response.length);
                if (xhr.response.length > 2) { //
                    log("not lost time");
                    //localStorage.clear();
                    //localStorage.removeItem("endTime");
                }
                if (xhr.response.length < 2) { // если ошибка в url «startTime» неверное время
                    log("not correct url time ");
                }
                if (xhr.status != 200) { // если ошибка url «endTime» == null
                    log("error url: " + xhr.status);
                    localStorage.removeItem("startTime"); // перезапускает функцию localStorageTime()
                }
            };
            xhr.onerror = function() { // если ошибка в соединения
                //createElem("Error internet connection");
                log("error internet");
            };
        };

         /*
         * timer(x) для визуального учета времени 15 минут.
         */
        function timer(time) {
            var t = time, min, sec;
            let timerId = setInterval(function() {
                min = parseInt(t / 60, 10)
                sec = parseInt(t % 60, 10);
                min = min < 10 ? "0" + min : min;
                sec = sec < 10 ? "0" + sec : sec;
                document.querySelector(".minutes").textContent = min + ":" + sec;
                document.title = min + ":" + sec; // Изменить title страницы
                if (--t < 0) {
                    clearTimeout(timerId);
                }
            }, 1000);
        };

         /*
         * Оповещения в браузере  Notifications не работают.
         * Необходимо перевести сайт на HTTPS. Или включить флаг
         * chrome://flags/#unsafely-treat-insecure-origin-as-secure
         * и занести ресурс в список исключений. Для localhost.
         * pushNotifications(x, x) уведомления через браузер.
         * «a» заголовок, «b» основной текс оповещения.
         */
        function pushNotifications(a, b) {
            if ("Notification" in window) { // если браузер поддерживает Notifications
                var notification = new Notification(a, {
                    tag: "status", // заменит текущее уведомление с таким же тегом
                    body: b,
                    icon: "http://habrastorage.org/storage2/cf9/50b/e87/cf950be87f8c34e63c07217a009f1d17.jpg"
                });
                notification.onclick = function() { // Выполнять код при нажатии на оповещении
                    window.open("https://www.binance.com/ru/trade/BTC_USDT?layout=basichttps://www.binance.com/ru/trade/BTC_USDT?layout=basic");
                };
            };
        };

         /*
         * soundNotifications() звуковое уведомления
         */
        function soundNotifications() {
            //const audio = document.querySelector(".audio");
            audio.play(); //    «audio» по id селектера
            //var audio = new Audio();
            // audio.src = "alarm.mp3";
            //audio.autoplay = true; // Автоматически запускаем
        };

         /*
         * window.onbeforeunload Предупреждение при закрытии страницы
         *
        window.onbeforeunload = function() {
            console.log("Предупреждение при закрытии страницы");
            return false;
        };
        *
        */

         /*
         * timeUnix() установлает начальное время кнопкой и возращает время unix формат
         */
        function timeUnix() { // 10:00:00 2021-08-16 --> 1629108000000
            const input = document.querySelector(".inputTime").value; // берет с поля время
            debug(input);
            const unix = Date.parse(input); // время в unix формат
            //localStorage.setItem("startTime", unix); // установлает начальное время
            return unix;
        };

         /*
         * timeDate() возращает время и дату
         */
        function timeDate() {
            const time = new Date().toLocaleTimeString();
            const date = new Date().toISOString().slice(0, 10);
            document.querySelector(".inputTime").value = time.slice(0, 6) + "00 " + date; // вставляет в поле актуальне время hh/mm
            return time + " " + date;
        };

         /*
         * openLink(x) откривает силку в новой вкладке.
         * визивается в <button onclick=openLink(x)
         */
        function openLink(url) {
            window.open(url, "_blank");
            //console.log(open);
        };

        function tableCreate(a, b, c, d, e) {
            var tbody = document.getElementById("tBody");
            var tr = document.createElement("tr");
            tr.setAttribute("id", "new_tr");
            tr.appendChild(document.createElement("td")).appendChild(document.createTextNode(a));
            tr.appendChild(document.createElement("td")).appendChild(document.createTextNode(b));
            tr.appendChild(document.createElement("td")).appendChild(document.createTextNode(c));
            tr.appendChild(document.createElement("td")).appendChild(document.createTextNode(d));
            tr.appendChild(document.createElement("td")).appendChild(document.createTextNode(e));
            tbody.prepend(tr); // вставляеи в начало таблицы новие дание
        };

         /*
         * log(x) создает и возращает лог.
         */
        function log(x) {
            const elem = document.querySelector(".log");
            const data = document.createTextNode(" [" +x+ "] ");
            elem.appendChild(data);
        };

         /*
         * setting(x) возращает в коде настроийки (x) которие вибраны пользивателем
         * через флажки «checkbox»
         */
        function setting(x) {
            function elem(s) {
                return document.querySelector(s).checked;
            };
            if (x === "symbol") { // криптовалюты
                if (elem(".BTC_USDT")) {
                    return "BTCUSDT";
                }
                 if (elem(".SOL_USDT")) {
                    return "SOLUSDT";
                }
                if (elem(".ETH_USDT")) {
                    return "ETHUSDT";
                }
            }
            if (x === "interval") { // время
                if (elem(".interval_1m")) {
                    return 1;
                }
                if (elem(".interval_5m")) {
                    return 5;
                }
                if (elem(".interval_15m")) {
                    return 15;
                }
            }
            if (x === "procent") { // %
                if (elem(".procent_25")) { // btc
                    return 0.25;
                }
                if (elem(".procent_34")) { // btc
                    return 0.34;
                }
                if (elem(".procent_85")) { // btc
                    return 0.85;
                }
                if (elem(".procent_61")) { // sol
                    return 0.61;
                }
                if (elem(".procent_74")) { // sol
                    return 0.74;
                }
                if (elem(".procent_40")) { // eth
                    return 0.40;
                }
            } else {
                console.log("error setting");
            }
        };


         /*
         * debug(x) debug функция.
         *
         *
         */
        function debug(result){
            if (document.querySelector(".debug").checked) {
             console.log("debug: " +result);
            }
        };

         /*
         * clearTime() чистить только localStorage время
         * нужно, чтобы не удаляло localStorage.getItem("BUY")
         *
         */
        function clearTime() {
            localStorage.removeItem("startTime");
            localStorage.removeItem("endTime");
        };


        function signal(x) {
            const BUY = localStorage.getItem("BUY");
            debug(BUY);
            // strategy3(x, x) проверяет сколько времени пройшло от последной покупки
            function strategy3(start, end) {
                const currDate = new Date(start);
                const oldDate = new Date(end);
                let result = (oldDate - currDate) / 60000;
                return result.toFixed(0)
            };
            if (x >= setting("procent")) { // если цена болеше x %
                console.log("цена болеше x % ");
                if (x < 1.50) { // и если strategy(4) цена менша xx %
                    console.log("цена менша за xx %");
                    console.log(strategy3(BUY, timeDate()) + " минути");
                    if (strategy3(BUY, timeDate()) >= 60) { // и если за последние 1 час (15) нет покупок
                        localStorage.setItem("BUY", timeDate());
                        pushNotifications("Go", "BUY bitcoin");
                        soundNotifications();
                        return "BUY";
                    }
                    console.log("за последние 60 мин была покупка потому не покупать");
                }
                return "not recommend";
            }
            if (x < -0.30) { // если цена критически упадет
                return "warning";

            } else {
                return "---";
            }

        };

         /*
         * run(x) главная функция.
         *
         *
         */
        function run() {
            getPrice(function(event) {
                const price = event.currentTarget.response; // возвращает массив
                //document.querySelector(".log").innerText = price[0][1];
                //document.querySelector(".log2").innerText = price[0][4];
                //var txt = document.querySelector(".log").textContent;
                //var txt2 = document.querySelector(".log2").textContent;
                localStorage.setItem("endTime", price[1][0]); // установлает актульние(последнее) время
                //document.querySelector(".procent").innerText = procent(price[0][1], price[0][4]) + "%"; // расчет процентов
                //pushNotifications("Покупать", procent(price[0][1], price[0][4]) + "%");
                tableCreate(procent(price[0][1], price[0][4]) + "%", "$" + price[0][1], setting("procent"), signal(procent(price[0][1], price[0][4])), timeDate());
                //createElem(procent(price[0][1], price[0][4]) + "% [" + timeDate() + "]", price[0][1] + " ==> " + price[0][4] + "  [" + price + "]"); // расчет процентов
                //console.log(date);
                console.log(price);
                timer(60 * setting("interval")); // 15 минут
            });
        };

        function go() { // запуск через кнопку
            run();
            setInterval(function() {
                run();
            }, 60000 * setting("interval")) // 15 минут
        };
        DOMLoaded(function() {
            //localStorage.clear();
            //console.log(setting("5m"));
            timeDate();
        });
