/**
 * @description: 引擎的设计与实现
 * @user: xiuxiu
 * @time: 2018/03/24
 */

/*
* V1.0: 引擎实现的基本模块思路
*       1.创建一个游戏引擎对象及精灵对象
*       2.将精灵对象添加到引擎中去，并实现播放动画效果以及需要用到的回调方法
*       3.启动引擎
* */

/*
* V2.0: 实现游戏循环模块
*       1.如果游戏暂停了，就跳过以下各步骤，并在100毫秒后再次执行游戏循环
*       2.更新帧速率
*       3.设置游戏时间
*       4.清除屏幕内容
*       5.在播放动画前，调用startAnimate的方法（可以进行碰撞检测）
*       6.绘制精灵背后的内容（绘制背景）
*       7.更新精灵
*       8.绘制精灵
*       9.绘制精灵前方的内容
*       10.动画播放完毕之后，调用endAnimate方法
*       11.请求浏览器播放下一帧动画
*
* */


/**
 * V3.0: 实现在暂停状态与运行状态之间的切换togglePaused
 */

/**
 * V4.0：实现基于时间的运动效果 ：pixelPerFrame
 * 计算公式：(pixels / second) * (second / frame) = pixeld / second【单位：每一秒移动的像素数】
 */

/**
 * V5.0: 实现加载图像的功能：
 * queueImage(imageUrl): 将图像放入到加载队列中去
 * loadImages(): 开发者需要持续调用该方法，知道返回100位置（方法的返回值表示图像加载完成的百分比）
 * getImage(imageUrl):返回图像对象， 只有咋loadImages()返回100之后，才可以调用该方法
 */

/**
 * V6.0：实现同时播放多个声音的功能
 * canPlay(): 用于查询浏览器是否能够播放某种特定格式的声音文件
 * playSound():用于播放声音
 */


/**
 * V7.0: 键盘事件的处理
 * addKeyListener(): 用于向游戏注册按键监听器
 */


/**
 * V8.0： 高分榜的维护：游戏的高分榜数组以json格式存档在本地
 */

/**
 * V9.0: 实现了一个比较完整的游戏引擎，开始使用这个简单的游戏引擎去制作一个小游戏
 * 需求分析：
 * 1.资源加载的画面
 * 2.游戏资源的管理
 * 3.声音的播放
 * 4.具有视差动画的滚动背景
 * 5.生命数量的显示
 * 6.高分榜的维护
 * 7.按键的监听与处理
 * 8.暂停功能与自动暂停机制实现
 * 9.游戏结束的流程处理
 */


/**
 * 游戏类
 * @param gameName  游戏名称
 * @param canvasId  画布ID
 * @returns {Game}  游戏实例
 * @constructor
 */
var Game = function (gameName, canvasId) {
    // 获取canvas画布
    var canvas = document.getElementById(canvasId);
    console.log(canvas);
    var self = this;


    //----------------------------------------基本属性
    this.context = canvas.getContext('2d');                 // 定义游戏中的基本需要的属性
    this.sprites = [];                                       // 游戏中的精灵对象
    this.gameName = gameName;                               // 游戏的名字


    //----------------------------------------时间管理
    this.startTime = 0;                                     // 游戏开始时间
    this.lastTime = 0;                                      // 游戏上一次的时间
    this.gameTime = 0;                                      // 游戏总时间
    this.fps = 0;                                          // 游戏帧速率(实时更新的)
    this.STARTING_FPS = 60;                                 // 默认启动的时候的帧速率

    this.paused = false;                                     // 游戏是否暂停
    this.startedPauseAt = 0;
    this.PAUSE_TIMEOUT = 100;                               // 游戏暂停的持续时间


    //---------------------------------------图像加载
    this.imageLoadingProgressCallback;                         // 图像加载过程的回调函数
    this.images = {};                                           // 图像对象
    this.imageUrls = [];                                        // 图像的Urls
    this.imagesLoaded = 0;                                      // 已加载完成的图像个数
    this.imagesFailedToLoad = 0;                                // 加载失败的图像个数
    this.imagesIndex = 0;                                       // 图像数组的下标， 从0开始的



    //-----------------------------------------声音加载播放
    this.soundOn = true;
    this.soundChannels = [];                                    // 初始化一个播放信道数组
    this.audio = new Audio();                                   // 这里的Audio实际上是JavaScript内置的DOM对象， 不需要自己手动去创建一个Audio对象
    this.NUM_SOUND_CHANNELS = 10;                               // 设置初始信道的数量



    //----------------------------------------键盘事件的监听
    this.keyListeners = [];                                     // 用于存放keyandListener的键值对

    window.onkeypress = function (ev) {                         // 这里的对象处理的是DOM Window这个窗体对象，添加了一个监听事件
        self.keyPressed(ev);
    }
    window.onkeydown = function (ev) {
        self.keyPressed(ev);
    }


    //-----------------------------------------高分榜的维护
    this.HIGH_SCORES_SUFFIX = '_highscores';                    // 后缀名字
    this.highScores = [];                                       // 用于存储游戏分数的数组



    // 构造10个Audio对象，将其加入到数组中去， 当调用playSound()方法，游戏引擎会找出第一个未被占用的声道，并用它来播放指定的声音文件
    for (var i = 0; i < this.NUM_SOUND_CHANNELS; i++){
        var audio = new Audio();
        this.soundChannels.push(audio);
    }

    return this;                                            // 把当前的游戏对象返回
}




/**
 * 游戏的成员方法
 * @type {{start: Game.start, animate: Game.animate, tick: Game.tick, updateFrameRate: Game.updateFrameRate, clearScreen: Game.clearScreen, startAnimate: Game.startAnimate, paintUnderSprites: Game.paintUnderSprites, updateSprites: Game.updateSprites, paintSprites: Game.paintSprites, paintOverSprites: Game.paintOverSprites, endAnimate: Game.endAnimate}}
 */
Game.prototype = {
    // 游戏加载图像的模块-------------------------------------------------------
    /**
     * 通过图像的Url地址，获取这个图像(json格式对象取出值的方法)对象
     * @param imageUrl
     */
    getImage : function (imageUrl) {
        return this.images[imageUrl];
    },



    /**
     *  图像加载完成的回调函数
     */
    imageLoadedCallback : function (e) {
        // 每次加载完成一个图像，次数加一
        this.imagesLoaded++;
    },



    /**
     * 当一个图像加载失败的回调函数
     */
    imageLoadErrorCallback : function (e) {
        this.imagesFailedToLoad++;
    },


    /**
     * 正式加载一张图像
     * @param imageUrl
     */
    loadImage : function (imageUrl) {
        var self = this;
        var image = new Image();

        image.src = imageUrl;

        // 图像加载完成的回调函数

        image.addEventListener("load", function (e) {
            self.imageLoadedCallback(e);

            // 显示出来, 测试成功
            //self.context.drawImage(image, 0, 0);
        });


        // 图像加载失败的回调函数
        image.addEventListener("error", function (e) {
            self.imageLoadErrorCallback(e);
        });


        // 把所有的加载的Images存起来
        this.images[imageUrl] = image;
    },

    /**
     * 加载图像的过程中反复调用这个函数， 这个函数返回已经处理完成的图像百分比
     * 当图像返回100%的时候， 表示所有的图像已经全部加载完毕
     * @returns {number}
     */
    loadImages : function () {
        //  如果还有图像没有加载【图像的url个数多余已经加载完成的图像下标】
        if (this.imagesIndex < this.imageUrls.length){
            // 再次把当前这个图像去加载(把没有加载的全部加载进来)
            this.loadImage(this.imageUrls[this.imagesIndex]);
            this.imagesIndex ++;
        }


        // 返回已经加载完成的图像百分比(加载成功的个数+加载失败的个数 占整个事先提供的所有URL个数的百分比)
        var percentage = (this.imagesLoaded + this.imagesFailedToLoad) / this.imageUrls.length * 100;
        console.log(percentage);
        return (this.imagesLoaded + this.imagesFailedToLoad) / this.imageUrls.length * 100;
    },

    /**
     *  用于把所有的图像URL放在一个队列里面【数组】
     * @param imageUrl
     */
    queueImage : function (imageUrl) {
        this.imageUrls.push(imageUrl);
    },





    // 游戏循环模块---------------------------------------------------------------
    start: function () {
        var self = this;

        this.startTime = +new Date();                  // 获取游戏当前的时间
        console.log("游戏启动成功, 当前时间：", this.startTime);


        // 开始游戏循环(这是一个系统实现的帧速率方法)
        window.requestNextAnimationFrame(
            function (time) {
                // self is the game, and this is the window
                console.log(self, this);
                // 每次把游戏实例对象的引用和当前的时间传过去
                self.animate.call(self, time);  // self is the game
            }
        );
    },

    animate: function (time) {
        // 这里的this 指向的是Game对象
        var self = this;

        if (this.paused) {
            // 如果用户暂停了游戏，然后每隔100ms的时间检查一次去看一下有没有开始循环
            // （由于游戏暂停的情况不会频繁出现，因此使用setTimeout()方法就可以满足我们的需求， 每隔100ms去看一次）

            setTimeout(function () {
                self.animate.call(self, time);
            }, this.PAUSE_TIMEOUT);
        }
        // 没有暂停的话
        else {
            this.tick(time);                    // 1.更新帧速率， 设置游戏时间
            this.clearScreen();                 // 2.清空屏幕内容

            // 碰撞检测代码

            this.startAnimate(time);            // 3.开始游戏动画
            this.paintUnderSprites();           // 4.绘制精灵后面的内容---背景

            this.updateSprites(time);           // 5.更新精灵的位置
            this.paintSprites(time);            // 6.绘制精灵

            this.paintOverSprites();            // 7.绘制精灵前方的内容
            this.endAnimate();                  // 8.动画结束


            // 回调这个方法， 开始进入到下一帧动画
            window.requestNextAnimationFrame(
                function (time) {
                    console.log(self, this);
                    // 注意这里不能直接传过去哈， 如果直接传过去的话，第一个参数就是就会把time 的指向修改为Game这个类
                    // self.animate(self, time);
                    // 第一个参数是用来校正animate函数内部的this的指向， 第二个参数是用来传递animate()函数执行需要的参数
                    self.animate.call(self, time);
                }
            );
        }
    },
    togglePaused : function () {
        // 这是一个游戏暂停的方法
        var now = +new Date();                      // 获取游戏暂停的那个时间点

        this.paused = !this.paused;                 // 每次在暂停与不暂停之间来回切换

        if (this.paused){
            // 如果游戏暂停了(暂停的那个时间点就是当前的时间)
            this.startedPauseAt = now;
        }else{
            // 没有暂停的话:调整开始的时间， 使得游戏开始是从点击开始游戏之后就开始计时的
            // this.startTime 记录的是：开始时间 + 当前时间 - 游戏上一次暂停的时间点
            // now - this.startedPauseAt = 游戏暂停的时长, 然后再加上游戏开始的时候的时间，就能从原来的暂停位置处继续执行下去
            this.startTime = this.startTime + now - this.startedPauseAt;
            this.lastTime = now;
        }
    },
    // 实现动画中需要实现的功能
    /**
     * // 1.更新帧速率（实现基于时间的运动效果）
     * @param time
     */
    tick: function (time) {
        // 1. 更新帧帧速率
        this.updateFrameRate(time);

        // 2. 设置游戏时间(每一帧间隔的时间)
        this.gameTime = (+new Date()) - this.startTime;
        console.log("设置游戏的时间：" + this.gameTime);
        this.lastTime = time;

    },
    updateFrameRate: function (time) {
        // 启动时候的帧速率
        if (this.lastTime === 0) {
            this.fps = this.STARTING_FPS;
        }
        else {
            // 计算当前的帧速率（每秒执行的帧数）
            this.fps = 1000 / (time - this.lastTime);
            console.log("实时更新游戏当前的帧速率", this.fps);
        }

    },
    /**
     * 实现基于时间的运动效果
     * @param time
     * @param velocity
     */
    pixelsPerFrame : function (time, velocity) {
        // 是动画平滑地运动起来
        // 计算公式：(pixels / second) * (second / frame) = pixeld / second【单位：每一秒移动的像素数】
        return velocity / this.fps;
    },

    /**
     * // 2.清空屏幕内容
     */
    clearScreen: function () {
        // 注意this.context.canvas.width, this.context.canvas.height 用于获取画布的宽度和高度
        //        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        console.log("画布屏幕清空成功！");
    },


    /**
     * // 3.开始游戏动画
     * @param time
     */
    startAnimate: function (time) {
        console.log(time, "开始游戏动画………………");
    },
    /**
     * // 4.绘制精灵后面的内容
     */
    paintUnderSprites: function () {
        console.log("绘制精灵后面的内容！");
    },
    /**
     * // 5. 更新精灵的位置
     * @param time
     */
    updateSprites: function (time) {
        console.log("更新所有精灵的位置！");
        for (var i = 0; i < this.sprites.length; i++) {
            var sprite = this.sprites[i];
            // 重新绘制精灵(调用每一个精灵自己的方法去绘制显示)
            sprite.update(this.context, time);
        }
    },

    // 6.绘制所有可见的精灵对象
    paintSprites: function (time) {
        console.log("绘制所有可见的精灵对象");
        for (var i = 0; i < this.sprites.length; i++) {
            var sprite = this.sprites[i];
            // 绘制之前需要先判断一下
            if (sprite.visible) {
                sprite.paint(this.context);                         //绘制精灵的时候需要拿到绘制精灵的绘图句柄
            }
        }
    },

    // 7. 绘制精灵前方的内容
    paintOverSprites: function () {
        console.log("绘制精灵前面的内容！");
    },
    // 8. 绘制动画结束
    endAnimate: function () {
        console.log("绘制动画结束！");
    },




    // 声音文件加载播放的模块----------------------------------------------------------
    /**
     * 浏览器是否支持ogg格式的文件
     * @returns {boolean}
     */
    canPlayOggVorbis : function () {
        // 只要返回的有内容，就说明浏览器支持这个文件格式
        return "" != this.audio.canPlayType('audio/ogg; codecs="vorbis"');
    },

    /**
     * 浏览器是否支持MP3格式的音乐播放
     * @returns {boolean}
     */
    canPlayMp3 : function () {
        // 返回的内容不为空，说明支持
        return "" != this.audio.canPlayType('audio/mpeg');
    },

    /**
     * 用于返回当前系统中可以使用的信道
     * @returns {*}
     */
    getAvailableSoundChannel : function () {
        var audio;

        // 遍历初始化中的所有信道
        for (var i = 0; i < this.NUM_SOUND_CHANNELS; i++){
            audio = this.soundChannels[i];
            // 如果当前的audio信道已经开始播放了（而且已经播放的信道数量不为空）
            if (audio.played && audio.played.length > 0){
                // 如果当前的信道已经播放完毕了音乐
                if (audio.ended){
                    return audio;
                }
            } else{
                // 如果当前的信道已经播放完毕音乐了， 就返回当前的这个audio对象
                if (!audio.ended)
                    return audio;
            }
        }

        // 如果所有的信道都在使用的话，就返回undifined
        return undefined;
    },
    /**
     * 用于播放指定ID的音乐
     * @param id
     */
    playSound : function (id) {
        // 获取当前可以使用的一个信道
        var track = this.getAvailableSoundChannel(),
            element = document.getElementById(id);


        // 如果不为空（undefined）
        if (track && element){
            // 获取当前选中的媒体资源的URL地址
            track.src = element.src === '' ? element.currentSrc : element.src;

            // 加载并播放音乐
            track.load();
            track.play();

        }
    },



    // 键盘事件的监听与处理操作---------------------------------------------
    /**
     * 把一个键值对添加到监听数组中去
     * @param keyAndListener
     */
    addKeyListener : function (keyAndListener) {
        this.keyListeners.push(keyAndListener);
    },

    /**
     * 通过key来查找相应的listener对象
     * @param key
     * @returns {undefined}
     */
    findKeyListener : function (key) {
        var listener = undefined;

        // 遍历所有的keyListeners数组
        for (var i = 0; i < this.keyListeners.length; i++){
            // 拿到当前的键值监听对象及按键的key值
            var keyAndListener = this.keyListeners[i],
                currentKey = keyAndListener.key;

            // 如果按下的按键是在我今天按下的所有keyAndListener中，就得到了这个listener
            if (currentKey === key){
                listener = keyAndListener.listener;
            }
        }

        return listener;
    },

    /**
     * 键盘按下的回调事件
     * @param e
     */
    keyPressed : function (e) {
        var listener = undefined,
            key = undefined;

        switch (e.keyCode){
            // 添加一些常用的按键处理键值对
            case 32:
                key = 'space';
                break;
            case 65:
                key = 'a';
                break;
            case 83:
                key = 's';
                break;
            case 80:
                key = 'p';
                break;
            case 87:
                key = 'w';
                break;
            // 记忆：左上右下的顺序，依次为：37 38 39 40
            case 37:
                key = 'left arrow';
                break;
            case 39:
                key = 'right arrow';
                break;
            case 38:
                key = 'up arrow';
                break;
            case 40:
                key = 'down arrow';
                break;
        }

        // 获取当前按下的按键的监听事件
        listener = this.findKeyListener(key);
        if (listener){
            listener();             // 这里的listener是一个监听函数，如果按下的按键有监听事件的处理，就去处理这个监听事件
        }

    },



    // 高分榜的维护管理模块----------------------------------------------------
    /**
     * 从本地存储中获取存储的数据（返回的是一个本地存储的高分列表）
     * @returns {any}
     */
    getHighScores : function () {
        // 把key的值存储起来
        var key = this.gameName + this.HIGH_SCORES_SUFFIX,
            highScoresString = localStorage[key];


        // 如果为空的话，返回一个空的Json数据
        if (highScoresString == undefined){
            localStorage[key] = JSON.stringify([]);
        }

        // 使用JSON解析字符串内容（返回的是一个JSon与key相对应的数值内容）
        return JSON.parse(localStorage[key]);
    },
    /**
     * 存储内容到本地存储
     * @param highScore
     */
    setHighScore : function (highScore) {
        // unshift() 方法不创建新的创建，而是直接修改原有的数组【会在数组的头部插入新的元素】
        var key = this.gameName + this.HIGH_SCORES_SUFFIX,
            highScoresString = localStorage[key];



        // 主要目的是把每一次最高分放在数组的第一位置，方便查看和管理
        // 这里的highScores数组，是一个用户初始化的数组（全局变量）【数组的第一个元素始终是最高分】
        //this.highScores.unshift(highScore);(每次都在原理的基础上添加数据)
        if (this.highScores.length === 0){
            this.highScores = this.getHighScores();
        }
        this.highScores.unshift(highScore);


        // 游戏的key始终是惟一的，每一次都将会修改为最新的状态
        localStorage[key] = JSON.stringify(this.highScores);
    },

    /**
     * 清空高分榜（清空浏览器的本地存储）
     */
    clearHighScores : function () {
        // 直接把相应的键对应的值设置为空即可
        localStorage[this.name + this.HIGH_SCORES_SUFFIX] = JSON.stringify([]);
    }

}
