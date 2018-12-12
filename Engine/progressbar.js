/**
 * Created by Xiugang on 2018/6/15
 */

// 用于展现的进度条
/**
 * 定义一个命名空间
 * @type {{}}
 */
var COREHTML5 = COREHTML5 || {}


/**
 * 进度条的类
 * @param w 宽度
 * @param h 高度
 * @param strokeStyle 线样式
 * @param red
 * @param green
 * @param blue
 * @returns {COREHTML5.Progressbar}
 * @constructor
 */
COREHTML5.Progressbar = function (w, h, strokeStyle, red, green, blue) {
    this.domElement = document.createElement('div');                            // 创建div的DOM节点
    this.context = document.createElement('canvas').getContext('2d');           // 创建canvas，获取绘图句柄
    this.domElement.appendChild(this.context.canvas);                           // 将canvas添加到div内部

    this.context.canvas.width = w + h;                                          // 设置canvas的宽度和高度
    this.context.canvas.height = h;


    this.setProgressbarProperties(w, h);                                    // 设置进度条的宽度和高度信息(自定义函数)
    this.background.globalAlpha = 0.3;                                      // 设置背景的透明度
    this.drawToBuffer(this.background, strokeStyle, red, green, blue);
    this.drawToBuffer(this.foreground, strokeStyle, red, green, blue);

    this.percentComplete = 0;                                               // 已经完成的任务进度

    return this;
}


COREHTML5.Progressbar.prototype = {
    // 属性与方法
    LEFT: 0,
    TOP: 0,

    /**
     * 设置进度条的属性
     * @param w
     * @param h
     */
    setProgressbarProperties: function (w, h) {
        this.w = w;                                     // 进度条的宽度
        this.h = h;                                     // 进度条的高度
        this.cornerRadius = this.h / 2;                 // 进度条的角弧度

        this.right = this.LEFT + this.cornerRadius + this.w + this.cornerRadius;        // 进度条最右边的位置
        this.bottom = this.TOP + this.h;                                                // 进度条最下面的位置

        this.background = document.createElement('canvas').getContext('2d');            // 背景
        this.foreground = document.createElement('canvas').getContext('2d');            // 前景


        this.background.canvas.width = w + h;                                           // 背景canvas的宽度和高度
        this.background.canvas.height = h;

        this.foreground.canvas.width = w + h;                                           // 前景canvas的宽度和高度
        this.background.canvas.height = h;

    },


    /**
     * 绘制进度条
     * @param percentComplete
     */
    draw : function (percentComplete) {
        this.erase();                           // 绘制之前先清空画布


        // 先来绘制背景
        this.context.drawImage(this.background.canvas, 0, 0);


        // 绘制前景
        if (percentComplete > 0) {
            this.context.drawImage(this.foreground.canvas, 0, 0,
                this.foreground.canvas.width*(percentComplete/100),                 // 使得进度条的宽度随着任务的百分比来改变
                this.foreground.canvas.height,
                0, 0,
                this.foreground.canvas.width*(percentComplete/100),
                this.foreground.canvas.height);
        }
    },

    /**
     * 绘制进度条的整个形状
     * @param context
     * @param strokeStyle
     * @param red
     * @param green
     * @param blue
     */
    drawToBuffer: function (context, strokeStyle, red, green, blue) {
        // 先把canvas的当前的绘图句柄状态保存起来
        context.save();

        // 设置填充样式
        context.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        context.strokeStyle = strokeStyle;

        // 开始绘制
        context.beginPath();

        context.moveTo(this.LEFT + this.cornerRadius, this.TOP);
        context.lineTo(this.right - this.cornerRadius, this.TOP);

        context.arc(this.right - this.cornerRadius,
            this.TOP + this.cornerRadius, this.cornerRadius, -Math.PI/2, Math.PI/2);

        context.lineTo(this.LEFT + this.cornerRadius,
            this.TOP + this.cornerRadius*2);

        context.arc(this.LEFT + this.cornerRadius,
            this.TOP + this.cornerRadius, this.cornerRadius, Math.PI/2, -Math.PI/2);

        context.fill();

        context.shadowColor = undefined;

        var gradient = context.createLinearGradient(this.LEFT, this.TOP, this.LEFT, this.bottom);
        gradient.addColorStop(0, 'rgba(255,255,255,0.4)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.7)');
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0.1)');

        context.fillStyle = gradient;
        context.fill();

        context.lineWidth = 0.4;
        context.stroke();

        context.restore();
    },


    /**
     * 清空画布
     */
    erase : function () {
        this.context.clearRect(this.LEFT, this.TOP, this.context.canvas.width, this.context.canvas.height);
    }
} 
