import "./index.css"
import {useContext} from "@/context.tsx";
import {MusicList} from "../../types/playList.ts";
import React, {useImperativeHandle, useState} from "react";

function Left(prop, ref: Ref<any>) {
    const { musicList } = useContext()
    // 设置索引（播放到指定音乐甚至高亮样式）
    const [index, setIndex] = useState<number>(-1);
    useImperativeHandle(ref, () => {
        return {
            setLight
        }
    })
    const setLight = (currentIndex: number) => {
        setIndex(currentIndex);
    }
    return (
        <div className="music-list">
            <ul>
                { musicList.map((music: MusicList, ind: number) => (
                    <li key={music.id} className={index === ind ? 'highlight' : ''}>{music.name}</li>
                )) }
            </ul>
        </div>
    )
}

export default React.forwardRef(Left);
