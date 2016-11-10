(function ( w ) {

    /*
     * constructor { Pie } 饼图构造函数
     * param { ctx: Context } 绘图上下文
     * param { x: number } 饼图圆心x轴坐标
     * param { y: number } 饼图圆心y轴坐标
     * param { r: number } 饼图半径
     * param { data: Array } 绘制饼图所需的数据
     * */
    function Pie( ctx, x, y, r, data ) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.r = r;
        this.data = data;

        this.textSpace = 15;

        // 扇形的颜色
        this.colors = [ 'skyblue', 'deeppink', 'orange', 'yellow', 'red', 'green' ];

        // 计算1数据所对应的角度值
        this.init();
    }

    /*
     * 给Pie添加一个静态方法，
     * 该方法会把角度转换为弧度
     * */
    Pie.angleToRadius = function( angle ) {
        // Math.PI / 180 得到1角度对应多少弧度
        return Math.PI / 180 * angle;
    };

    Pie.prototype = {

        // 拟补constructor丢失的问题
        constructor: Pie,

        // 求1数据对应的角度 = 360度 / 数据的总和
        init: function () {
            var num = 0;
            this.data.forEach(function ( dataObj ) {
                num += dataObj.val;
            });

            // 1数据所对应的角度值
            this.baseAngle = 360 / num;
        },

        // 绘制饼图
        draw: function () {
            var self = this,
                angle = 0, // 扇形的总角度
                startAngle = 0, // 扇形起点角度
                endAngle = 0; // 扇形结束点角度

            // 根据数据，画扇，共同组成一个饼图。
            this.data.forEach(function ( val, index ) {

                // 计算当前扇形的结束角度
                angle = self.baseAngle * self.data[index].val;
                endAngle = startAngle + angle;

                // 画扇
                self.ctx.beginPath();
                self.ctx.moveTo( self.x, self.y );
                self.ctx.arc( self.x, self.y, self.r, Pie.angleToRadius(startAngle), Pie.angleToRadius(endAngle));
                self.ctx.closePath();
                self.ctx.fillStyle = self.colors[index];
                self.ctx.fill();

                /*
                 * 在扇形中间画线:
                 * 需要先求出扇形中间的角度 = 扇形的起点角度 + 扇形的角度 / 2
                 * 然后求出扇形中间在圆上的点坐标：
                 * x坐标 = 圆心x坐标 + 半径 * Math.cos( angleToRadian(扇形中间的角度) );
                 * y坐标 = 圆心y坐标 + 半径 * Math.sin( angleToRadian(扇形中间的角度) );
                 * 有了该坐标，从圆心拉一条线到该点即可。
                 * */

                // 求扇形中间的角度
                self.ctx.beginPath();
                // 求扇形中间在圆上点的坐标
                var temAngle = startAngle + angle / 2;
                var temX = self.x + (self.r + self.textSpace) * Math.cos( Pie.angleToRadius(temAngle) );
                var temY = self.y + (self.r + self.textSpace) * Math.sin( Pie.angleToRadius(temAngle) );
                // 从圆心画一条扇形分隔线，用来标识文字所表示的扇形区域
                self.ctx.moveTo( self.x, self.y );
                self.ctx.lineTo( temX, temY );

                // 绘制文字
                if ( temAngle > 90 && temAngle < 270 ) {
                    self.ctx.textAlign = 'right';
                    self.ctx.lineTo( temX - self.ctx.measureText(self.data[index].msg).width, temY );
                }else {
                    self.ctx.textAlign = 'left';
                    self.ctx.lineTo( temX + self.ctx.measureText(self.data[index].msg).width, temY );
                }
                self.ctx.stroke();
                self.ctx.textBaseline = 'bottom';
                self.ctx.fillText( self.data[index].msg, temX, temY - 5 );

                // 下一个扇形的起点，是当前扇形的结束点
                startAngle = endAngle;

            });
            //this.drawText();
        },

        // 绘制文本
        drawText: function () {

        },
    };

    //给jQuery扩展一个饼图的插件
    $.fn.extend({
        //给我一些数据，我展示成饼图
        drawPieChart: function (data, textSpace) {
            var $target, $targetWidth, $targetHeight,
                cvs, ctx, pie, x, y, r,
                textSpace = textSpace || 60;//这个是写文字的空间
            //获取第一个元素，以及这个元素的宽高
            $target = this.first();
            $targetWidth = parseInt($target.css('width'));
            $targetHeight = parseInt($target.css("height"));

            //画布初始化
            cvs = $('<canvas></canvas>').get(0);
            cvs.width = $targetWidth;
            cvs.height = $targetHeight;
            ctx = cvs.getContext('2d');

            //计算饼图的圆心（在元素的中心）
            //计算饼图的半径（按照宽高中比较短的来计算）
            x = $targetWidth / 2;
            y = $targetHeight / 2;
            r = $targetWidth > $targetHeight ? ($targetHeight / 2 - textSpace) : ($targetWidth / 2 - textSpace);

            //调用上面的构造函数，创建饼图实例，并绘制
            pie = new Pie(ctx, x, y, r, data);
            pie.draw();

            //把canvas标记添加到第一个元素中，这样就可以在页面中浏览饼图了
            $target.append(cvs);
        }
    });


}( window ));