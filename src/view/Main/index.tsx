import './index.css';
import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {useContext} from "@/context.tsx";
import Retangle from "./Retangle.ts";

interface Context {
    audioContext?: AudioContext;
    analyser?: AnalyserNode;
    gain?: GainNode;
}
interface Prop {
    onIndexFromChild: (keyof: number) => void;
}

function Main({ onIndexFromChild }: Prop, ref: Ref<any>) {
    const cas = useRef<HTMLCanvasElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    // 音频源
    let audioSource: MediaElementAudioSourceNode | null = null;
    // buffer源
    let bufferSource: AudioBufferSourceNode | null = null;
    // 当前播放的音乐索引
    const [nowIndex, setNowIndex] = useState<number>(0);
    // 音频相关对象{ 音频上下文, 实时频域和时域分析节点, 音量相关节点 }
    const [context, setContext] = useState<Context>({});
    const { musicList, singleLoop } = useContext();
    // 计时器
    const RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
    const rt_array: Retangle[] = []; // 用于存储柱形条对象
    const rt_length = 30; // 规定有多少个柱形条
    // 缓存了音频相关对象,单曲循环会导致该组件重新render一次(意味着context,analyser,gain对象还需要重新新建实例没有必要)
    useMemo<Context>(() => {
        return context;
    }, [singleLoop]);
    useEffect(() => {
        if (context.audioContext) {
            trigger(0);
            const ctx = cas.current!.getContext("2d")!;
            const ocas = document.createElement("canvas");
            const octx = ocas.getContext("2d")!;
            ocas.width = cas.current!.width;
            ocas.height = cas.current!.height / 2;
            const grd = ctx.createLinearGradient(0, 110, 0, 270);
            grd.addColorStop(0, "red");
            grd.addColorStop(0.3, "yellow");
            grd.addColorStop(1, "#00E800");
            initAnimation();
            animate(ctx, octx, grd, ocas)();
        }
    }, [context]);
    useImperativeHandle(ref, () => {
        return {
            initContext,
            togglePause,
            toggleMute
        }
    })

    /**
     * @description 初始化.创建音频上下文
     */
    const initContext = () => {
        // 创建音频上下文实例
        const audioContext = new AudioContext();
        // analyser为analysernode，具有频率的数据，用于创建数据可视化
        const analyser = audioContext.createAnalyser();
        // gain为gainNode，音频的声音处理模块（1为音量最大，0为静音）
        const gain = audioContext.createGain();
        gain.gain.value = 1;
        setContext({ ...context, audioContext, analyser, gain });
    }
    /**
     * @description 音频节点播放完毕触发,进行单曲循环或者列表播放
     */
    const handleMusicPlayEnd = () => {
        trigger(singleLoop ? nowIndex : nowIndex + 1);
    };
    const trigger = (index: number) => {
        index = index >= musicList.length ? 0 : index;
        if (musicList[index].decoding) return;
        stop();
        setNowIndex(index);
        // todo: 给父组件传递索引，给兄弟组件传递索引修改样式
        onIndexFromChild(index);
        if (musicList[index].src) {
            chooseMusic(musicList[index].src);
        } else if (musicList[index].buffer) {
            playMusic(musicList[index].buffer);
        }
    };
    /**
     * @description 停止播放,断开节点时域
     */
    const stop = () => {
        const audioContext = context.audioContext!;
        const analyser = context.analyser!;
        const gain = context.gain!;
        const ismuti = !!gain.gain.value;

        if (!ismuti) {
            gain.gain.value = 0;
        }

        if (!audioRef.current?.ended || !audioRef.current?.paused) audioRef.current!.pause();

        if (bufferSource && ('stop' in bufferSource)) bufferSource.stop();
        try {
            if (bufferSource) {
                bufferSource.disconnect(analyser);
                bufferSource.disconnect(audioContext.destination);
            }
            if (audioSource) {
                audioSource.disconnect(analyser);
                audioSource.disconnect(audioContext.destination);
            }
        } catch (e) {
            console.log(e);
        }
        if (!ismuti) {
            gain.gain.value = 1;
        }
    }
    /**
     * @description 音频加载
     * @param {string} src 路径名称
     */
    const chooseMusic = (src: string) => {
        import(`../../assets/mp3/${src.split('.')[0]}.mp3`).then(res => {
            // setMusicSrc(res.default);
            audioRef.current!.src = res.default;
            audioRef.current!.load();
            playMusic(audioRef.current as HTMLAudioElement);
        })
    }
    /**
     * @description 播放音乐
     * @param {HTMLAudioElement} arg 音频节点实例
     */
    const playMusic = (arg: HTMLMediaElement | AudioBuffer) => {
      let source: MediaElementAudioSourceNode | AudioBufferSourceNode;
      const audioContext = context.audioContext!;
      const analyser = context.analyser!;
      const gain = context.gain!;
      // 如果arg是audio的dom对象，则转为相应的源
        if ((arg as HTMLMediaElement).nodeType) {
            audioSource = audioSource || audioContext.createMediaElementSource(arg as HTMLMediaElement);
            // console.log(audioSource);
            source = audioSource;
        } else {
            bufferSource = audioContext.createBufferSource();
            bufferSource.buffer = arg as AudioBuffer;
            bufferSource.onended = () => {
                trigger(singleLoop ? nowIndex : (nowIndex + 1));
            }
            // 播放音频
            setTimeout(() => {
                bufferSource?.start();
            }, 0);
            source = bufferSource;
        }
        // 连接analyserNode
        source.connect(analyser);
        // 再连接到gainNode
        analyser.connect(gain);
        // 最终输出到音频播放器
        gain.connect(audioContext.destination);
    }
    /**
     * @description 切换暂停/继续播放
     * @param {string} pause pause代表暂停,continue代表继续
     */
    const togglePause = (pause: string) => {
        if (pause === 'pause') {
            audioRef.current!.pause();
        } else {
            audioRef.current!.play();
        }
    }
    /**
     * @description 设置静音
     * @param {boolean} isMulti true设置静音,false取消静音
     */
    const toggleMute = (isMulti: boolean) => {
        const gain = context.gain!;
        gain.gain.value = isMulti ? 0 : 1;
    }
    /**
     * @description 动画初始化
     */
    const initAnimation = () => {
        const aw = cas.current!.width / rt_length;
        const w = aw - 5;
        for (let i = 0; i < rt_length; i++) {
            rt_array.push(new Retangle(w, 5, i * aw, cas.current!.height / 2));
        }
    }
    const animate = (ctx: CanvasRenderingContext2D, octx: CanvasRenderingContext2D, grd: CanvasGradient, ocas: HTMLCanvasElement) => {
        return () => {
            if (!musicList[nowIndex].decoding) {
                ctx.clearRect(0, 0, cas.current!.width, cas.current!.height);
                octx.clearRect(0, 0, cas.current!.width, cas.current!.height);

                // 出来的数组是8bit的整型数组，0~256
                const array_length = context.analyser!.frequencyBinCount;
                const array = new Uint8Array(array_length);
                // 将音频节点的数据拷贝到unit8array中
                // if (contextOne.analyser) {
                //     contextOne.analyser!.getByteFrequencyData(array);
                // } else {
                    context.analyser!.getByteFrequencyData(array);
                // }
                const ratio = array_length / cas.current!.width;
                for (let j = 0; j < rt_array.length; j++) {
                    const rt = rt_array[j];
                    // 根据比例计算应该获取第几个频率值，并且缓存起来减少计算
                    rt.index = ('index' in rt) ? rt.index : Math.floor(rt.x * ratio);
                    rt.update(array[rt.index], octx, grd);
                }
                draw(ctx, ocas);
            } else {
                showTxt("音频解码中...", ctx)
            }
            RAF(animate(ctx, octx, grd, ocas));
        }
    }

    /**
     * @description 音频预加载文字
     * @param {string} msg 文字
     * @param {CanvasRenderingContext2D} ctx canvas上下文
     */
    const showTxt = (msg: string, ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, cas.current!.width, cas.current!.height);
        ctx.save();
        ctx.fillStyle = "#FFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "20px 微软雅黑";
        ctx.fillText(msg, cas.current!.width / 2, cas.current!.height / 2);
        ctx.restore();
    }
    /**
     * @description 制造半透明投影
     * @param {CanvasRenderingContext2D} ctx canvas上下文
     * @param {HTMLCanvasElement} ocas 画布上显示柱图区域的canvas元素
     */
    const draw = (ctx: CanvasRenderingContext2D, ocas: HTMLCanvasElement) => {
        ctx.drawImage(ocas, 0, 0);
        ctx.save();
        ctx.translate(cas.current!.width / 2, cas.current!.height / 2);
        ctx.rotate(Math.PI);
        ctx.scale(-1, 1);
        ctx.drawImage(ocas, -cas.current!.width / 2, -cas.current!.height / 2);
        ctx.restore();
        ctx.fillStyle = "rgba(0, 0, 0, .8)";
        ctx.fillRect(0, cas.current!.height / 2, cas.current!.width, cas.current!.height / 2);
    }

    return (
        <div className="graphical-player">
            <audio ref={audioRef} autoPlay={true} className="music-player" onEnded={handleMusicPlayEnd}></audio>
            <canvas ref={cas} width="900" height="540"></canvas>
        </div>
    )
}

const CanvasMain = React.forwardRef(Main);

export default CanvasMain;
