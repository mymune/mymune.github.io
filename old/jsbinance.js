  var date = new Date().toLocaleString("uk", {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timezone: 'UTC',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        });

        var startTime = "1629401400000";
        //var unixTime = Date.parse("17:00 " + date + " GMT"); // 10:00:00 2021-08-16 --> 1629108000000
        //var timeUnix = Date.parse("17:00:00 2021-08-17 GMT"); // 10:00:00 2021-08-16 --> 1629108000000
        //console.log(unixTime);

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
            url.searchParams.set("symbol", "BTCUSDT");
            url.searchParams.set("interval", "15m");
            url.searchParams.set("startTime", x);
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
                return localStorage.getItem("endTime"); // возращаем последнее время у функцию
            } else { // если начальное(временное) времени нет
                localStorage.setItem("startTime", startTime); // установлает начальное время
                return localStorage.getItem("startTime"); // возращаем начальное время у функцию
            }
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
            if (a > b) { // если цена упадет
                //document.querySelector(".signal").innerText = "отрицательная цена";
                //result === true ? (createElementDiv("detect: №" + number, antiDebugger())) : (createElementDiv("good"));
            }
            if (c >= 0.80) { // если цена вырастет до 0.80%
                document.querySelector(".signal").innerText = "Покупать";
                pushNotifications("Покупать", "цена вырасла");
                soundNotifications();
            }
            if (c < -1.00) { // если цена урадет до -1.00%
                document.querySelector(".signal").innerText = "убыток в торговле";
                pushNotifications("Продавать", "убыток в торговле");
            }
            return c.toFixed(2);
        };

        /*
         * getPrice() GET запрос, тип ответа - JSON-строка.
         * price[0][1] Многомерные массивы, [0] = первое число. [1] = второе.
         */
        const getPrice = function(callback) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", urlPrice(localStorageTime()));
            xhr.onload = function() {
                if (xhr.response.length == 2) { // если ошибка в url «startTime» неверное время
                    console.log("Ошибка в «startTime» " + xhr.response.length);
                    //localStorage.clear();
                    //localStorage.removeItem("endTime");
                }
                if (xhr.status != 200) { // если ошибка url «endTime» == null
                    console.log("Ошибка: " + xhr.status);
                    localStorage.removeItem("startTime"); // перезапускает функцию localStorageTime()
                }
            };
            xhr.onerror = function() { // если ошибка в соединения
                console.log("ошибка соединения");
            };
            xhr.responseType = "json"; // возвращает тип ответа
            xhr.addEventListener("load", callback);
            xhr.send(null); // запрос
        };

        /*
         * timer(x) для визуального учета времени 15 минут.
         */
        function timer(time) {
            var t = time,
                min, sec;
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
         *
         */
        function soundNotifications() {
            var audio = new Audio();
            audio.src = "https://sound-pack.net/download/Sound_19341.mp3";
            audio.autoplay = true; // Автоматически запускаем
        };

        /*
         * window.onbeforeunload Предупреждение при закрытии страницы
         */
        window.onbeforeunload = function() {
            console.log("Предупреждение при закрытии страницы");
            return false;
        };

        /*
         * run(x) главная функция.
         *
         *
         */
        function run() {
            getPrice(function(event) {
                const price = event.currentTarget.response; // возвращает массив
                document.querySelector(".log").innerText = price[0][1];
                document.querySelector(".log2").innerText = price[0][4];
                //var txt = document.querySelector(".log").textContent;
                //var txt2 = document.querySelector(".log2").textContent;
                localStorage.setItem("endTime", price[1][0]); // установлает актульние(последнее) время
                document.querySelector(".procent").innerText = procent(price[0][1], price[0][4]) + "%"; // расчет процентов
                //pushNotifications("Покупать", procent(price[0][1], price[0][4]) + "%");
                console.log(procent(price[0][1], price[0][4]) + "%"); // расчет процентов
                console.log(date);
                console.log(price);
                timer(60 * 15); // 15 минут
            });
        };


        DOMLoaded(function() {
            run();
            setInterval(function() {
                run();
            }, 60000 * 15) // 15 минут
        });