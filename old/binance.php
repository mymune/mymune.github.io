<?php
//header("Content-Type: text/plain; charset=utf-8");
 /**
     * candlesticks get the candles for the given intervals
     * 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
     *
     * $candles = $api->candlesticks("BNBBTC", "5m");
     *
     * @param $symbol string to query
     * @param $interval string to request
     * @param $limit int limit the amount of candles
     * @param $startTime string request candle information starting from here
     * @param $endTime string request candle information ending here
     * @return array containing the response
     * @throws \Exception
     */
     function candlesticks(string $symbol, string $interval = "5m", int $limit = null, $startTime = null, $endTime = null)
    {
        if (!isset($this->charts[$symbol])) {
            $this->charts[$symbol] = [];
        }

        $opt = [
            "symbol" => $symbol,
            "interval" => $interval,
        ];

        if ($limit) {
            $opt["limit"] = $limit;
        }

        if ($startTime) {
            $opt["startTime"] = $startTime;
        }

        if ($endTime) {
            $opt["endTime"] = $endTime;
        }

        $response = $this->httpRequest("v1/klines", "GET", $opt);

        if (is_array($response) === false) {
            return [];
        }

        if (count($response) === 0) {
            echo "warning: v1/klines returned empty array, usually a blip in the connection or server" . PHP_EOL;
            return [];
        }

        $ticks = $this->chartData($symbol, $interval, $response);
        $this->charts[$symbol][$interval] = $ticks;
        return $ticks;
    }




/*============================================================
 * время сервера
 * 21:24:24 15.08.2021
 */
$time = time();
$serverTime = date("H:i:s d-m-Y", $time);
//echo "{$serverTime} server time \n";


/*============================================================
 * время сервера
 * 21:24:24 15.08.2021
 */
$date = date("d-m-Y"); //15.08.2021
$timeUnix = strtotime("09:00 $date"); //20:30:00 15.08.2021
//echo "{$timeUnix}\n";
$unixTime = date("H:i d-m-Y", 1629735242);
echo "{$unixTime}\n";

/*
$eos_usdt = "https://data.gateio.co/api2/1/ticker/eos_usdt";
$get = file_get_contents($eos_usdt);
$decod = json_decode($get, true);
 /*  vardump1($decod);

 */
?>
    <!DOCTYPE HTML>
    <html>

    <head>
        <title>tranding</title>
        <!--
         <meta http-equiv="pragma" content="no-cache" />
        <meta http-equiv="no-cache" />
        <meta http-equiv="cache-control" content="no-cache" />
        <meta http-equiv='expires' content='-1' />
        <meta id="robots" content="noindex,nofollow" />
        <script type="text/javascript" src="/jsbinance.js"></script>
          -->
    </head>

    <body>
        <button class="btn-binance" onclick=" window.open('https://www.binance.com/ru/trade/BTC_USDT?layout=basichttps://www.binance.com/ru/trade/BTC_USDT?layout=basic','_blank')">Binance</button>
        <div class="timer">Time: <span class="minutes">15:00</span><br></div>
        <div class="log"></div>
        <div class="log2"></div>
        <div class="procent"></div>
        <div class="signal"></div>
        <script>
  var date = new Date().toLocaleString("uk", {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timezone: 'UTC',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        });

        var startTime = "1629452700000";
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
            localStorage.clear();
            run();
            setInterval(function() {
                run();
            }, 60000 * 15) // 15 минут
        });


        </script>
    </body>

    </html>