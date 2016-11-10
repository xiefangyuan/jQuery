(function ( w ) {
    /*
     * constructor { Coordinate } 坐标轴构造函数
     * param { paddings: Array } 坐标轴距离画布上、右、下、左的距离
     * param { arrow: Array } 里面存储坐标轴中箭头的宽高
     * param { points: Array } 里面存储的是相当于自定义坐标轴原点的位置
     * */
    function Coordinate( ctx, points, paddings, arrow  ) {

        // 绘图上下文
        this.ctx = ctx;

        // 要绘制的源数据
        this.points = points;
        // 根据源数据计算绘制的坐标
        this.pointsCoord = [];

        // 坐标轴与画布的路径
        paddings = paddings || [];
        this.paddingTop = paddings[0] || 10;
        this.paddingRight = paddings[1] || 10;
        this.paddingBottom = paddings[2] || 10;
        this.paddingLeft = paddings[3] || 10;

        // 坐标轴中箭头的宽高
        arrow = arrow || [];
        this.arrowWidth = arrow[0] || 10;
        this.arrowHeight = arrow[1] || 20;

        // 等比缩放源数据，并根据缩放后的数据计算绘制的坐标
        this.initPoint();

        // 初始化上顶点、圆点、右顶点的坐标
        this.init();
    }

    Coordinate.prototype = {

        // 拟补constructor丢失的问题
        constructor: Coordinate,

        // 初始化上顶点、圆点、右顶点的坐标
        init: function () {
            // 坐标轴中上顶点的坐标
            this.s = {
                x: this.paddingLeft,
                y: this.paddingTop
            }
            // 坐标轴中原点的坐标右顶点
            this.o = {
                x: this.paddingLeft,
                y: this.ctx.canvas.height - this.paddingBottom
            }
            // 坐标轴中右顶点的坐标
            this.h = {
                x: this.ctx.canvas.width - this.paddingRight,
                y: this.ctx.canvas.height - this.paddingBottom
            }

            // 根据数据转换为坐标
            var i = 0, len = this.points.length;
            for ( ; i < len; i+=2 ) {
                // this.pointsCoord = [ [转换后的x坐标,转换后的y坐标],[x,y]... ];
                this.pointsCoord.push( [ this.o.x + this.points[i], this.o.y - this.points[i+1] ] );
            }

        },

        // 转换坐标轴最大可显示的值
        initPoint: function () {

            var self = this;
            var i = 0, len = this.points.length,
                pointsX = [], pointsY = [],
                coordMaxX, coordMaxY;

            // 求坐标轴默认显示的最大刻度
            this.coordMaxX = this.ctx.canvas.width - this.paddingLeft - this.paddingRight - this.arrowHeight;
            this.coordMaxY = this.ctx.canvas.height- this.paddingTop - this.paddingBottom - this.arrowHeight;

            /*
             * 把坐标轴可显示的数据最大值进行转换：
             * 遍历所有的点，
             * 点中最大的x轴作为预期坐标轴的x最大值
             * 点中最大的y轴作为预期坐标轴的y最大值
             * */

            // 找出所有的x轴和y轴
            for ( ; i < len; i++ ) {
                if (i % 2 === 0 ) {
                    pointsX.push( this.points[i] );
                }else {
                    pointsY.push( this.points[i] );
                }
            }

            // 求出预期的坐标轴最大刻度
            coordMaxX = Math.max.apply( null, pointsX );
            coordMaxY = Math.max.apply( null, pointsY );

            /*
             * 现在求出的最大刻度，是我们预想坐标轴可显示的最大刻度，
             * 实际上坐标轴显示的刻度，没有任何变化，
             * 我们需要使用坐标轴默认刻度 / 预期刻度得到一个比值，
             * 然后通过这个比值对源数据进行缩放。
             * */
            this.points = this.points.map(function ( val, index ) {
                if ( index % 2 === 0 ) {
                    return self.coordMaxX / coordMaxX * val;
                }else {
                    return self.coordMaxY / coordMaxY * val;
                }
            });

        },

        // 折线图绘制方法
        draw: function () {
            this._drawLine();
            this._drawArrow();
            this._drawPoint();
            this._drawPerfline();
        },

        // 绘制坐标轴中的两条线
        _drawLine: function () {
            this.ctx.beginPath();
            this.ctx.moveTo( this.s.x, this.s.y );
            this.ctx.lineTo( this.o.x, this.o.y );
            this.ctx.lineTo( this.h.x, this.h.y );
            this.ctx.stroke();
        },

        // 绘制坐标轴中的两个箭头
        _drawArrow: function () {
            this.ctx.beginPath();

            // 先画上箭头
            this.ctx.moveTo( this.s.x, this.s.y );
            this.ctx.lineTo( this.s.x - this.arrowWidth / 2, this.s.y + this.arrowHeight );
            this.ctx.lineTo( this.s.x, this.s.y + this.arrowHeight / 2 );
            this.ctx.lineTo( this.s.x + this.arrowWidth / 2, this.s.y + this.arrowHeight );
            this.ctx.lineTo( this.s.x, this.s.y );

            // 再画右箭头
            this.ctx.moveTo( this.h.x, this.h.y );
            this.ctx.lineTo( this.h.x - this.arrowHeight, this.h.y - this.arrowWidth / 2 );
            this.ctx.lineTo( this.h.x - this.arrowHeight / 2, this.h.y );
            this.ctx.lineTo( this.h.x - this.arrowHeight, this.h.y + this.arrowWidth / 2 );
            this.ctx.lineTo( this.h.x, this.h.y );

            this.ctx.stroke();
        },

        // 在坐标轴中绘制点
        _drawPoint: function () {
            var self = this;
            this.ctx.beginPath();

            // 根据坐标绘制点
            // this.pointsCoord = [ [转换后的x坐标,转换后的y坐标],[x,y]... ];
            this.pointsCoord.forEach(function ( pointsCoord ) {
                self.ctx.fillRect( pointsCoord[0], pointsCoord[1], 2, 2);
            });

            this.ctx.stroke();
        },

        // 绘制折线
        _drawPerfline: function () {
            var self = this;
            this.ctx.beginPath();

            // 绘制折线
            this.pointsCoord.forEach(function ( pointsCoord ) {
                self.ctx.lineTo( pointsCoord[0], pointsCoord[1] );
            });

            this.ctx.stroke();
        }
    };

    // 把构造函数暴漏到全局
    w.Coordinate = Coordinate;

}( window ));