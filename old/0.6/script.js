         /*
         * v.0.4.4   ¯\_(ツ)_/¯
         *
         * Release:  v.0.5
         * + новый дизайн
         * + таблыца статистики
         * + log функцию
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
         * pre-release: v.0.7
         * - Панель анализа данных
         * - функция психологической поддержки
         * - let const
         * - серверную часть
         * - уведомления на телеграм
         * - статигии на другие криптовалюты
         * - улучшение дизайна
         * - скриншоты графика и свеч для сравнения и анализа
         */

         /*
         *  статегия BTCUSDT 5m
         *  если предедужчая свеча больше 0.50%, не покупать
         *
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
            let url = new URL("https://api.binance.com/api/v1/klines");
            url.searchParams.set("symbol", setting("symbol"));
            url.searchParams.set("interval", setting("interval"));
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
            var c = a / b * 100 - 100;
            c = (-1) * c;
            debug(c);
            if (a > b) { // если цена упадет
                //document.querySelector(".signal").innerText = "отрицательная цена";
                //result === true ? (createElementDiv("detect: №" + number, antiDebugger())) : (createElementDiv("good"));
            }
            if (c >= setting("procent")) { // если цена вырастет до 0.80%
                //document.querySelector(".signal").innerText = "Покупать";
                //pushNotifications("Go", "BUY bitcoin");
                //createElem("Go", "BUY");
                soundNotifications();
            }
            if (c < -0.30) { // если цена урадет до -1.00%
                //document.querySelector(".signal").innerText = "убыток в торговле";
                //pushNotifications("warning", "SELL bitcoin");
                //createElem("warning", "SELL");
            }
            debug(setting("procent"));
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
            if (x === "symbol") { // BTC/USDT
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
                    return "1m";
                }
                if (elem(".interval_5m")) {
                    return "5m";
                }
                if (elem(".interval_15m")) {
                    return "15m";
                }
            }
            if (x === "procent") { // %
                if (elem(".procent_34")) {
                    return 0.34;
                }
                if (elem(".procent_85")) {
                    return 0.85;
                }
                if (elem(".procent_60")) {
                    return 0.60;
                }
                if (elem(".procent_74")) {
                    return 0.74;
                }
            } else {
                console.log("error setting");
            }
        };



        function debug(result){
            if (document.querySelector(".debug").checked) {
             console.log("debug: " +result);
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
                tableCreate(procent(price[0][1], price[0][4]) + "%", "$" + price[0][1], setting("procent"), "--", timeDate());
                //createElem(procent(price[0][1], price[0][4]) + "% [" + timeDate() + "]", price[0][1] + " ==> " + price[0][4] + "  [" + price + "]"); // расчет процентов
                //console.log(date);
                console.log(price);
                timer(60 * 5); // 15 минут
            });
        };

        function go() {
            run();
            setInterval(function() {
                run();
            }, 60000 * 5) // 15 минут
        };
        DOMLoaded(function() {
            //localStorage.clear();
            //console.log(setting("5m"));
            timeDate();
        });
