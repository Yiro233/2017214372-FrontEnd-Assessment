window.addEventListener('load',()=>{
    setLocation();
    $('.ct-aqi').click(() => {
        $('.ct-pop-window')[0].className = "ct-pop-window show";
        document.body.className = "modal-open";
        document.body.style.top = "0px";
    })
    $('.bg-cover').click(() => {
        $('.ct-pop-window.show')[0].className = "ct-pop-window hide";
        document.body.className = "";
    })
    $('#icon-close').click(() => {
        $('.ct-pop-window.show')[0].className = "ct-pop-window hide";
        document.body.className = "";
    })
    $('.btn-close').click(()=>{
        $('.ct-pop-window.show')[0].className = "ct-pop-window hide";
        document.body.className = "";
        window.scrollTo(0,667);
    })
    $('#txt-location').click()
})
function getWeather(province,city,county) {
    $.ajax({
        type: "GET",
        url: "https://wis.qq.com/weather/common?source=xw&weather_type=observe|rise",
        data: {"province": province,"city": city,"county": county},
        dataType: "jsonp",
        enctype: "multipart/form-data",
        success: (res)=> {
            setDegree(res.data.observe.degree);
            setBackground(res.data.observe.weather);
            setTxtWeather(res.data.observe.weather);
            setHumiWind(res.data.observe);
        }
    })
}
function getAir(province, city, county) {
    $.ajax({
        type: "GET",
        url: "https://wis.qq.com/weather/common?source=xw&weather_type=air",
        data: {
            "province": province,
            "city": city,
            "county&": county
        },
        dataType: "jsonp",
        enctype: "multipart/form-data",
        success: (res) => {
            setAir(res);
        }
    })
}
function setBackground(weatherData) {
    weatherObj = {
        "yin": "url(overcast.jpg)",
        "qing": "url(clear.jpg)",
        "duoyun": "url(cloud.jpg)",
        "lei": "url(thunder.jpg)",
        "yu": "url(rain.jpg)",
        "xue": "url(snow.jpg)"
    }
    let weatherTable = (weather)=>{
        if (weather.match(/lei.*/)){
            weather = 'lei';
        } else if (weather.match(/.*yu/)){
            weather = 'yu';
        } else if (weather.match(/.*xue/)) {
            weather = 'xue';
        }
        return weatherObj[weather];
    };
    document.getElementById("sec-main").style.backgroundImage = weatherTable(pinyin.getFullChars(weatherData).toLowerCase());
    document.getElementById("sec-main").style.backgroundSize = "100%";
}
function setDegree(degree) {
    let txtTemp = document.querySelector('#txt-temperature');
    txtTemp.textContent = degree;
}
function setTxtWeather(weather) {
    let txtWeather = document.querySelector('#txt-weather');
    txtWeather.textContent = weather;
}
function getForecastEtc(province,city,county) {
    $.ajax({
        type: "GET",
        url: "https://wis.qq.com/weather/common?source=xw&weather_type=forecast_1h|forecast_24h|index|alarm|limit|tips",
        data: {"province": province,"city": city,"county": county},
        dataType: "jsonp",
        enctype: "multipart/form-data",
        success: (res)=>{
            let maxDegree = new Array();
            let minDegree = new Array();
            document.querySelector('#txt-tips').textContent = res.data.tips.observe[randArray(1,0,1)];
            for (let i = 0;i < 8;i++){
                maxDegree.push(parseInt(res.data.forecast_24h[i].max_degree));
                minDegree.push(parseInt(res.data.forecast_24h[i].min_degree));
            }
            setForecast(res);
            drawChart(maxDegree,minDegree)
        }
    })
}
function setAir(air) {
    document.querySelector('#til').textContent = air.data.air.aqi;
    document.querySelector('#value').textContent = air.data.air.aqi_name;
    document.querySelector('#val').textContent = air.data.air.aqi;
    document.querySelector('#level').textContent = air.data.air.aqi_name;
    let detail = document.querySelector('#detail').innerHTML;
    document.querySelector('#detail').innerHTML = replaceFunc(detail,air.data.air);
}
function replaceFunc(html,air) {
    for (const val in air) {
        html = html.replace(`${val}`,air[`${val}`]);
    }
    return html;
}
function setForecast(weatherData) {
    let date = new Date();
    let todat = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
    let html = document.querySelector('#sec-tomorrow').innerHTML;
    let forecast_24h = weatherData.data.forecast_24h;
    let forecast_1h = weatherData.data.forecast_1h;
    let index = weatherData.data.index;
    let count = 0;
    let newObj = {};
    let week = {
        "0":"周日",
        "1":"周一",
        "2":"周二",
        "3":"周三",
        "4":"周四",
        "5":"周五",
        "6":"周六"
    }
    html = html.replace('TdDegree', forecast_24h[2].max_degree + '/' + forecast_24h[2].min_degree);
    html = html.replace('TdWth', forecast_24h[2].day_weather == forecast_24h[2].night_weather ? forecast_24h[2].day_weather : forecast_24h[2].day_weather + '转' + forecast_24h[2].night_weather);
    html = html.replace('todayWeather', `icon-d-${pinyin.getFullChars(forecast_24h[2].day_weather).toLowerCase()}`);
    html = html.replace('TmDegree', forecast_24h[3].max_degree + '/' + forecast_24h[3].min_degree);
    html = html.replace('TmWth', forecast_24h[3].day_weather == forecast_24h[3].night_weather ? forecast_24h[3].day_weather : forecast_24h[3].day_weather + '转' + forecast_24h[3].night_weather);
    html = html.replace('tomorrowWeather', `icon-d-${pinyin.getFullChars(forecast_24h[3].day_weather).toLowerCase()}`);
    document.querySelector('#sec-tomorrow').innerHTML = html;
    for (let i = 0;i < 48;i++){
        let time;
        if(i <= 1){
            time = forecast_1h[i].update_time.slice(8, 10) + ":00";
        }else{
            time = forecast_1h[i].update_time.slice(8, 10) == '00' ? '明天' : forecast_1h[i].update_time.slice(8, 10) + ":00";
        }
        
        let degree = forecast_1h[i].degree;
        let weather = pinyin.getFullChars(forecast_1h[i].weather).toLowerCase();
        $('#ls-hours-weather').append(`<li class = "item" style = "width: 2%;">
                                        <p class = "txt-time">${time}</p> 
                                        <i class = "iconfont icon icon-d-${weather}"></i>
                                        <p class = "txt-degree positive">${degree}</p>
                                        </li>`)
    }
    for (let i = 0;i < 8;i++){
        let time = new Date(forecast_24h[i].time);
        let today = week[new Date().getDay()];
        let date = forecast_24h[i].time.slice(5, 7) + '/' + forecast_24h[i].time.slice(8,10);
        let day;
        let day_weather = forecast_24h[i].day_weather;
        let dayWthIcon = 'icon-d-' + pinyin.getFullChars(day_weather).toLowerCase();
        let night_weather = forecast_24h[i].night_weather;
        let nightWthIcon = 'icon-n-' + pinyin.getFullChars(night_weather).toLowerCase();
        let wind_dir = forecast_24h[i].night_wind_direction;
        let wind_pow = forecast_24h[i].night_wind_power;
        if (week[time.getDay()] == today){
            day = '今天';
        }else{
            day = week[time.getDay()];
        }
        $('#ls-days').append(
            `<li class = "item" style = "width: 62.5px;">
                <p class = "day" >${day}</p>
                <p class = "date" >${date}</p>
                <div class = "ct-daytime">
                    <p class = "weather">${day_weather}</p>
                    <i class = "iconfont ${dayWthIcon} icon"></i>
                </div>
                <div class = "ct-night" >
                    <i class = "iconfont ${nightWthIcon} icon"></i>
                    <p class = "weather">${night_weather}</p>
                </div>
                <p class = "wind">${wind_dir}</p>
                <p class = "wind" >${wind_pow}级</p>
            </li>`
        );
        
    }
    for (let key in index){
        if (index.hasOwnProperty(key) && key!=='time') {
            newObj[count++] = key;
        }
    }
    randArray(16,0,21).map((i)=>{
        let prop= newObj[i];
        let info = index[newObj[i]].info;
        let name = index[newObj[i]].name;
        let indexPass = JSON.stringify(index).replace(/\"/g, "'");
        let propPass = JSON.stringify(prop).replace(/\"/g, "'");
        $('#ls-living').append(`<li onclick = "setIndex(${indexPass},${propPass})" class = "item"><span class = "iconfont icon icon-${prop}"></span>
                                    <p class = "content">${info}</p>
                                    <p class = "title">${name}</p>
                                </li>`)
    })
    
}
function randArray(num,begin,end) {
    let res = new Array();
    
    while (res.length!=num){
        let con = parseInt((Math.random() * (end - begin + 1) + begin),10);
        if (!res.includes(con)){
            res.push(con);
        }
    }
    return res;
}
function setIndex(index,prop) {
    document.body.className = "modal-open";
    document.body.style.top = "-655px";
    $('.ct-window .title')[0].textContent = index[prop].name;
    $('.ct-window .txt-info')[0].textContent = index[prop].detail;
    $('.ct-pop-window')[1].className = "ct-pop-window show";
}
function setHumiWind(observe) {
    let HwTxt = $('#ct-wind-humidity .txt')
    let wind_dir = {
        0 : "微风",
        1 : "东北风",
        2 : "东风",
        3 : "东南风",
        4 : "南风",
        5 : "西南风",
        6 : "西风",
        7 : "西北风",
        8 : "北风"
    };
    HwTxt[0].textContent = '湿度 '+(observe.humidity+'%');
    HwTxt[1].textContent = (wind_dir[observe.wind_direction] + ' ') + (observe.wind_power == 0 ? '' : (observe.wind_power + '级'));
    setInterval(() => {
        if (HwTxt[0].className != "show txt"){
            HwTxt[0].className = "show txt";
            HwTxt[1].className = "txt";
        }else{
            HwTxt[0].className = "txt";
            HwTxt[1].className = "show txt";
        }
    }, 3000);
}
function setLocation(...args) {
    let paramNum = args.length;
    let location = document.querySelector('#txt-location');
    switch (paramNum) {
        case 0:
            location.innerHTML = `<span id="icon-location"></span>重庆市 渝北区`;
            getWeather('重庆市', '重庆市', '渝北区');
            getForecastEtc('重庆市', '重庆市', '渝北区');
            getAir('重庆市', '重庆市', '渝北区');
            break;
        case 1:
            location.innerHTML = `<span id="icon-location"></span>${args[0]}`;
            getWeather(args[0], args[0]);
            getForecastEtc(args[0], args[0]);
            getAir(args[0], args[0]);
            break;
        case 2:
            location.innerHTML = `<span id="icon-location"></span>${args[0]} ${args[1]}`;
            getWeather(args[0], args[1]);
            getForecastEtc(args[0], args[1]);
            getAir(args[0], args[1]);
            break;
        case 3:
            location.innerHTML = `<span id="icon-location"></span>${args[0]} ${args[1]} ${args[2]}`;
            getWeather(args[0], args[1], args[2]);
            getForecastEtc(args[0], args[1], args[2]);
            getAir(args[0], args[1], args[2]);
            break;
    }
}
function getInput() {
    let args = new Array();
    args.push($('#province').val());
    args.push($('#city').val());
    args.push($('#county').val());
    setLocation(args[0],args[1],args[2]);
}
function drawChart(maxDegree,minDegree) {
    let maxDegreeChart = document.getElementById("DegreeChart").getContext('2d');
    let DegreeData = {
        datasets: [{
            data: maxDegree,
            backgroundColor: 'transparent',
            borderColor: 'orange',
            borderWidth: 1,
            pointBackgroundColor: 'orange',
        },
        {
            data: minDegree,
            backgroundColor: 'transparent',
            borderColor: 'rgb(79, 295, 247)',
            borderWidth: 1,
            pointBackgroundColor: 'rgb(79, 295, 247)',
        }]
    }
    let option = {
        legend: {
            position: 'bottom',
            display: false
        },
        layout: {
            padding: {
                left: 15,
                right: 0,
                top: 0,
                bottom: 0
            }
        },
        scaleShowLabels: false,
        scales: {
            
            xAxes: [{
                labels: ['', '', '', '', '', '', '', '', ''],
                display: false,
                ticks: {
                    min: '0'
                },
                gridLines: {
                    display: false,
                }
            }],
            yAxes: [{
                display: false,
                ticks: {
                    display: false,
                    min: -30,
                    max: 50
                },
                gridLines: {
                    display: false,
                }
            }]
        },
        animation: {
            onComplete: function () {
                let chartInstance = this.chart,
                ctx = chartInstance.ctx;
                ctx.fillStyle = Chart.defaults.global.defaultFontColor;
                ctx.font = Chart.helpers.fontString(16, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                this.data.datasets.forEach(function (dataset, i) {
                    let meta = chartInstance.controller.getDatasetMeta(i);
                    
                    if (dataset.borderColor == 'rgb(79, 295, 247)') {
                        meta.data.forEach(function (bar, index) {
                            let data = dataset.data[index];
                            ctx.fillText(data + '°', bar._model.x, bar._model.y + 20);
                        });
                    }else{
                        meta.data.forEach(function (bar, index) {
                            let data = dataset.data[index];
                            ctx.fillText(data + '°', bar._model.x, bar._model.y - 20);
                        });
                    }
                });
            }
        }
    }
    new Chart(maxDegreeChart, {
        type: 'line',
        data: DegreeData,
        options: option
    });
}
