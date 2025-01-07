import "./index.css"
import {useContext} from "../../context.tsx";
import {useState} from "react";

interface Prop {
    onEventFromChild: () => void;
    togglePause: (keyof: string) => void;
    toggleMute: (keyof: boolean) => void;
}

function Header({ onEventFromChild, togglePause, toggleMute }: Prop) {
    const { singleLoop, setSingleLoop } = useContext();
    // 设置状态，空字符串代表音乐暂未播放，不为空代表audiocontext已经建立，播放音乐
    const [status, setStatus] = useState<string>("");
    // 暂停/继续播放状态
    const [pause, setPause] = useState<string>("continue");
    // 设置是否静音
    const [isMulti, setIsMulti] = useState<boolean>(false);
    const repeatPlay = () => {
      setSingleLoop((c: boolean) => !c);
    }
    const startPlay = () => {
        setStatus("init-play");
        onEventFromChild();
    }
    const pauseContinue = () => {
        setPause(prevState => {
            const currState = prevState === 'continue' ? 'pause' : 'continue';
            togglePause(currState);
            return currState
        });
    }
    const toggleMulti = () => {
        setIsMulti(prevState => {
            const currentState = !prevState;
            toggleMute(currentState);
            return currentState;
        });
    }

    return (
        <div className="control">
            <button disabled={status === ''} className="play-type" onClick={repeatPlay}>{ singleLoop ? '列表播放' : '单曲循环' }</button>
            <button disabled={status === 'init-play'} className="start-play" onClick={startPlay}>初始化播放</button>
            {/*<button className="add-music" >本地歌曲</button>*/}
            {/*<input type="file" className="music-file" accept="audio/mp3" multiple={true} />*/}
            <button disabled={status === ''} className="pause" onClick={pauseContinue}>{ pause === 'continue' ? '暂停' : '继续' }</button>
            <button disabled={status === ''} className="muti" onClick={toggleMulti}>{ isMulti ? '取消静音' : '静音' }</button>
            {/*<button className="record">录音</button>*/}
        </div>
    )
}

export default Header;
