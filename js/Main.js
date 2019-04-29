/**
 * Created by Xiugang on 2018/6/15
 */

// 用于实现程序的主业务逻辑
/*V1.0 实现了游戏加载启动画面的功能
    可以显示图片资源加载的进度，注意这里实现的是逐个dom元素的隐藏效果
* V2.0 实现了游戏暂停画面的切换
*   如果玩家暂停游戏，会弹出一个相应的消息提示框（togglePaused() 方法）
*   通过按键P来实现暂停和继续游戏的功能
*   实现了一个小球的左右自由移动
*
* V3.0 实现一个按键监听器
* V4.0 游戏结束及高分榜
* GitHub源码：https://github.com/xiugangzhang/GameEngine
* */
// 创建一个游戏实例-------------------------------------------------------------------------------------------
var game = new Game("Game Engine", 'gameCanvas');


// 定义需要的全局变量------------------------------------------------------------------------------------------
var loadButton = document.getElementById('loadButton'),                             // 加载按钮
    loadingMessage = document.getElementById('loadingMessage'),                     // 进度信息
    progressDiv = document.getElementById('progressDiv'),                           // 进度条显示框
    progressbar = new COREHTML5.Progressbar(300, 25, 'rgba(0, 0, 0, 0.5)', 100, 130, 250),// 进度条对象
    gameTitle = document.getElementById('gameTitle'),                                   // 获取游戏标题
    loadingContents = document.getElementById('loadingContents'),                           // 获取游戏结介绍面板
    loadingToast = document.getElementById('loadingToast'),                                 // 游戏介绍的主面板
    gameTimerDiv = document.getElementById('gameTimerDiv'),                                           // 游戏的计时器
    leftLives = document.getElementById('leftLives'),                                       // 剩余生命值
    loseLifePanel = document.getElementById('loseLifePanel'),                               // 开杀控制面板
    lifeValue = document.getElementById('lifeValue'),                                       // 生命值
    loseLifeButton = document.getElementById('loseLifeButton'),                             // 开杀按钮
    pausedToast = document.getElementById('pausedToast'),                                   // 暂停的面板
    loseLifeButton = document.getElementById('loseLifeButton'),


    gameoverPan = document.getElementById('gameoverPan'),                                   // 游戏结束面板
    scoreText = document.getElementById('scoreText'),                                       // 本次得分的最高分数
    highScoreList = document.getElementById('highScoreList'),                               // 获取高分榜的列表信息
    addMyScoreButton = document.getElementById('addMyScoreButton'),                         // 获取添加按钮
    playerNickName = document.getElementById('playerName'),                                 // 玩家的名字
    newGameButton = document.getElementById('newGameButton');                               // 新游戏按钮





// 其他变量
var isLoadingFinished = false,                                                            // 是否进度条加载完
    lastKeyListenerTime = 0,                                                                // 上一次按键监听的时间
    isGameOver = false,                                                                 // 用于记录游戏是否结束

    score = 0,
    currentLifeValue,                                                               // 当前的生命值
    lastScore = 0,                                                                  // 上一次得分
    lastScoreUpdate = undefined,                                                    // 上一次更新
    HIGH_SCORE_DISPLAYED = 10;                                                      // 最多可显示的记录数


// 游戏资源的载入-----------------------------------------------------------------------------------------------------
loadButton.onclick = function (ev) {
    var loadingPercentComplete = undefined;

    // 1. 按钮隐藏起来
    loadButton.style.display = 'none';
    // 2. 显示出来进度信息
    loadingMessage.style.display = 'block';
    // 3. 展示出来进度条
    progressDiv.appendChild(progressbar.domElement);


    game.queueImage('');


    // 定义一个循环执行器(主循环16ms执行一次)
    var interval = setInterval(function (args) {
        loadingPercentComplete = game.loadImages();         // 循环调用该函数， 不断加载图片
        //console.log(loadingPercentComplete);

        if (loadingPercentComplete === 100) {
            // 如果加载完毕的话，就停止计时器
            clearInterval(interval);

            // 在图片加载的过程不断去执行更新进度条的操作
            setTimeout(function (e) {
                // 等500ms后隐藏进度条（初始化）
                loadingMessage.style.display = 'none';
                progressDiv.style.display = 'none';

                setTimeout(function (e) {
                    // 隐藏我的主要功能面板（500ms之后）
                    loadingContents.style.display = 'none';
                    gameTitle.style.display = 'none';

                    setTimeout(function (args2) {
                        // 1.隐藏功能介绍的面板
                        loadingToast.style.display = 'none';
                        // 2. 显示游戏生命面板（主界面）
                        leftLives.style.display = 'block';
                        loseLifePanel.style.display = 'block';
                        gameTimerDiv.style.display = 'block';

                        // 开始播放背景音乐(把Audio里面的id标签传进去)
                        game.playSound('pop');


                        // 再次延迟1s之后
                        setTimeout(function (args3) {
                            // 让按钮焦点聚集
                            loseLifeButton.focus();

                        }, 1000);


                    }, 500);
                }, 500);
            }, 500);
        } else {
            // 资源加载完毕
            isLoadingFinished = true;
        }
        // 这里的进度条实时都在显示（每隔16ms更新一次）
        progressbar.draw(loadingPercentComplete);
    }, 16);
}

startNewGame = function () {

}


// 游戏暂停与继续功能的实现-------------------------------------------------------------------------------
/**
 * 定义了一个函数状态切换函数
 */
var togglePaused = function () {
    // 切换状态
    game.togglePaused();
    pausedToast.style.display = game.paused ? 'block' : 'none';
}

/**
 * 鼠标点击之后
 * @param ev
 */
pausedToast.onclick = function (ev) {
    //pausedToast.style.display = 'none';
    // 切换状态
    togglePaused();
}

/**
 * window对象失去焦点的时候触发
 * @param ev
 */
window.onblur = function windowOnBlur(ev) {
    if (isLoadingFinished && !isGameOver) {
        togglePaused();
    }
    //pausedToast.style.display = 'block';
}

/**
 * 窗口有焦点(必须点击了)
 * @param ev
 */
window.onfocus = function windowOnFocus(ev) {
    if (game.paused) {
        //togglePaused();
        //pausedToast.style.display = game.paused ? 'block' : 'none';
    }
}



// 绘制方法--------------------------------------------------------------------------------------------------
// 1. 更新帧速率
// 2. 设置游戏时间
// 3. 清除屏幕内容
// 4. 开始动画
// 5. 绘制后面的，精灵， 前面的
// 6. 播放下一帧动画
/**
 * 定义一个小球对象
 * @param x
 * @param y
 * @constructor
 */
var Ball = function (x, y) {
    this.x = x;
    this.y = y;
    this.speedX = 2;
    this.speedY = 3;
    this.radius = 15;
    this.color = 'yellow';
}


/**
 * 小球对象的方法
 * @type {{paintBall: Ball.paintBall}}
 */
Ball.prototype = {
    paintBall: function (context) { 
        context.save();

        context.strokeStyle = 'orange';
        context.fillStyle = this.color;
        context.strokeStyle = 'orange';
        context.lineWidth = 1;

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        context.fill();
        context.stroke();

        context.stroke();
        context.restore();

        //this.color = 'yellow';
    },
    updateBall: function (context) {
        // 清空画布
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);


        // 默认向右移动
        this.x += this.speedX;
        this.y += this.speedY;


        if (this.x > context.canvas.width - 15) {
            this.speedX = -this.speedX;
        }

        if (this.x < 15) {
            this.speedX = -this.speedX;
        }

        if (this.y < 15) {
            this.speedY = -this.speedY;
        }

        if (this.y > context.canvas.height - 15) {
            this.speedY = -this.speedY;
        }

        // 重新绘制
        this.paintBall(context);
    }
}


/**
 * 更新精灵的位置，实现运动效果
 * @param context
 */
var ball = new Ball(50, 50);


/**
 * 绘制精灵上面的内容
 */
game.paintOverSprites = function () {

}


/**
 * 绘制精灵, 这个方法会不断地回调
 */
game.paintSprites = function () {
    if (!isGameOver && !game.paused) {
        // 更新精灵的位置
        ball.updateBall(game.context);
        // 更新的时候看一下小球的颜色
        if (ball.color != 'yellow') {
            ball.color = 'yellow';
            ball.radius = 15;
        }

        // 在这里同时更新我的计时器(保留0位小数)
        gameTimerDiv.innerText = (parseInt(game.gameTime)/1000).toFixed(0).toString();
        gameTimerDiv.id = 'gameTimerDiv';
    }

}

/**
 * 绘制精灵下面的内容
 */
game.paintUnderSprites = function () {

}


// 按键监听器-------------------------------------------------------------------------------------------------------
game.addKeyListener(
    {
        // 按键p用于切换游戏暂停状态
        key: 'p',
        listener: function () {
            game.togglePaused();
        }
    }
)

game.addKeyListener(
    {
        key: 'right arrow',
        listener: function () {
            var now = +new Date();
            if (now - lastKeyListenerTime > 200) {
                lastKeyListenerTime = now;
            }
        }
    }
)

game.addKeyListener(
    {
        key: 'left arrow',
        listener: function () {
            var now = +new Date();
            if (now - lastKeyListenerTime > 200) {
                lastKeyListenerTime = now;
            }
        }
    }
)




/**
 * 用户每次开杀一次，生命值下降10
 * @param ev
 */
loseLifeButton.onclick = function (ev) {
    currentLifeValue = parseInt(lifeValue.innerText.toString().split('：')[1]);
    // 每次点击一次，就让小球的颜色改变一下
    ball.color = 'red';
    ball.radius = 30;
    ball.paintBall(game.context);


    if (currentLifeValue != 10) {
        currentLifeValue -= 10;
        document.getElementById('lifeValue').innerText = "生命值：" + currentLifeValue.toString();
    } else {
        // 如果生命值为负数的话，就提示游戏结束
        gameOver();

        // 使用玩家的用时来作为成绩
        score = (60-parseInt(gameTimerDiv.innerText.toString()) + 100*0.4).toFixed(0) ;
        scoreText.innerText = score.toString();
    }
}




// 游戏结束-----------------------------------------------------------------------------------------------------
/**
 * 这里需要去本地的localStorage中进行修改更新
 */
updateHighScoreList = function () {
    var highScores = game.getHighScores(),
        length = highScores.length,
        highScore,
        li;



    // 通过动态创建元素的方式来创建节点（在ul标签下面创建li标签）
    var childs = highScoreList.childNodes;
    for (var i = 0; i < childs.length; i++){
        highScoreList.removeChild(childs[i]);
    }



    if (length > 0){
        // 数组的重新排序，从大到小-------------------------------------------------------
        // 如果在本地获取到了结果
        var maxScore;
        // 遍历数组，默认数组中的某一个元素为最大值，进行逐一比较大小
        for (var i = 0; i < length; i++){
            // 外层循环一次，和内层循环的一个进行比较
            for (var j = i; j < length; j++){
                if (highScores[i].score < highScores[j].score){
                    maxScore  = highScores[j];
                    highScores[j] = highScores[i];
                    highScores[i] = maxScore;
                }
            }

        }


        // 为了能把记录都显示出来，这里需要进行一下数据校正
        length = length > HIGH_SCORE_DISPLAYED ? HIGH_SCORE_DISPLAYED : length;

        // 实现数据的显示（不显示重复数据）【用于显示元素的去重】
        var currentItem, lastItem = '';

        for (var i= 0; i < length; i++){
            currentItem = highScores[i];
            if (lastItem != currentItem.name){
                // 这里需要对本地存储的结果进行二次处理排名后然后显示出来
                li = document.createElement('li');
                li.innerText = (i+1).toString()+'.'+currentItem.score + ' by ' + currentItem.name;
                highScoreList.appendChild(li);

                lastItem = currentItem.name;
            }

        }
    }else{
        // 如果没有获取到本地的结果
    }
}


/**
 *
 * @param ev
 */
addMyScoreButton.onclick = function (ev) {
    // 添加之前， 先移除所有的list
    // 通过动态创建元素的方式来创建节点（在ul标签下面创建li标签）
    var childs = highScoreList.childNodes;
    for (var i = 0; i < childs.length; i++){
        highScoreList.removeChild(childs[i]);
    }

    var playerName = playerNickName.value;
    if (playerName != ''){
        game.setHighScore({
            name : playerName,
            score : score
        });

        // 更新游戏高分榜的列表
        updateHighScoreList();

        // 灰度到初始的状态
        addMyScoreButton.disabled = 'true';
        playerNickName.value = '';
        playerName.value = '';
    }

}

/**
 * 显示最高分
 */
showHighScores = function () {
    gameoverPan.style.display = 'block';
    scoreText.innerText = score.toString();

    // 显示完毕之后，把本地存储的高分榜进行更新
    updateHighScoreList();

}


/**
 * 游戏结束
 */
gameOver = function () {
    // 返回一个JSON对象的字符串
    var highScore,
        highScores = game.getHighScores();              // 对于每一个不用游戏的名称的内容，都会分开来存储数据(拿到应该是一个对象数组)


    // 游戏结束的标志
    isGameOver = true;
    game.paused = true;


    // 隐藏之前的悬浮框
    pausedToast.style.display = 'none';
    loseLifePanel.style.display = 'none';
    lifeValue.innerText = '';


    // 只要系统里面存储的高分有内容， 获取我的本次得分高于系统里面存储的分数的话
    // 只有没有内容的时候，或者本次得分有高于系统的得分
    if (highScores.length === 0 || score > highScores.score) {
        // 先更新再显示
        showHighScores();
    } else {
        // 如果我的本次得分没有超过系统保存的最高分，就让用户输入姓名（但最多只能输入输入10个）
        gameoverPan.style.display = 'block';
    }

}


/**
 * 新游戏的按钮----------------------------------------------
 */
newGameButton.onclick = function (ev) {
    gameoverPan.style.display = 'none';
    loseLifePanel.style.display = 'block';
    leftLives.style.display = 'block';
    lifeValue.innerText = '生命值：100';

    game.paused = false;
    isGameOver = false;


    // 开始新游戏
    //startNewGame();
}





// 所有的场景准备完毕之后，启动游戏----------------------------------------------------------------------------------
game.start();



