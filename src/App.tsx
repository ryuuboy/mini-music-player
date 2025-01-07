// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import Header from "./view/Header";
import Left from "./view/Left";
import Main from "./view/Main";
import {Context} from "./context.tsx";
import {useRef} from "react";

function App() {
    const main = useRef(null);
    const left = useRef(null);
    /**
     * @description 点击初始化播放按钮时触发事件
     */
    const initChildContext = () => {
        main.current!.initContext();
    }
    /**
     * @description 点击暂停/继续播放时触发事件
     * @param {string} pause 当前状态continue代表继续，pause代表暂停
     */
    const handleTogglePause = (pause: string) => {
        main.current!.togglePause(pause);
    }
    /**
     * @description 点击静音/取消静音按钮时触发事件
     * @param {boolean} mute 为true时设置静音，为false时取消静音
     */
    const handleToggleMute = (mute: boolean) => {
        main.current!.toggleMute(mute);
    }
    /**
     * @description 当歌曲自动播放到下一首时触发事件
     * @param {number} index 当前歌曲的索引
     */
    const handleMusicListIndex = (index: number) => {
        left.current!.setLight(index);
    }
    return (
        <Context>
            <Header onEventFromChild={initChildContext} togglePause={handleTogglePause} toggleMute={handleToggleMute} />
            <div className="main">
                <Left ref={left} />
                <Main ref={main} onIndexFromChild={handleMusicListIndex} />
            </div>
        </Context>
    )
}

export default App
