class Retangle {
    w: number
    h: number
    x: number
    y: number
    jg: number
    power: number
    dy: number
    num: number
    public constructor(w: number, h: number, x: number, y: number) {
        this.w = w // 柱图宽度
        this.h = h // 红块高度
        this.x = x //柱图开始绘制的x轴
        this.y = y //y轴固定值,画布高度/2
        this.jg = 3 // 被分割开的高度
        this.power = 0 // 采样点频率
        this.dy = y // 红块位置
        this.num = 0
    }

    /**
     * @description 根据频率更新画布
     * @param {Number} power 采样点频率
     * @param {Object} ctx 画布上下文
     * @param {Object} grd 音频柱图渐变对象
     */
    update(power: number, ctx: CanvasRenderingContext2D, grd: CanvasGradient) {
        this.power = power;
        this.num = Math.floor(this.power / this.h + 0.5);
        // 红块当前位置，如果点频率（音频条长度）高于红块位置，则红块位置就是音频调高度，否则红块下降+1
        const nh = this.dy + this.h;
        if (this.power >= this.y - nh) {
            this.dy = this.y - this.power - this.h - (this.power == 0 ? 0 : 1);
        } else if (nh > this.y) {
            this.dy = this.y - this.h;
        } else {
            this.dy += 1;
        }
        this.draw(ctx, grd);
    }

    draw(ctx: CanvasRenderingContext2D, grd: CanvasGradient) {
        ctx.fillStyle = grd;
        const h = Math.floor(this.power / (this.h + this.jg)) * (this.h + this.jg);
        ctx.fillRect(this.x, this.y - h, this.w, h);
        for (let i = 0; i < this.num; i++) {
            const y = this.y - i * (this.h + this.jg);
            ctx.clearRect(this.x - 1, y, this.w + 2, this.jg);
        }
        ctx.fillStyle = "#950000";
        ctx.fillRect(this.x, Math.floor(this.dy), this.w, this.h);
    }
}

export default Retangle;
