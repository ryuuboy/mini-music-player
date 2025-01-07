import React, {useState} from "react";
import {MusicList} from "./types/playList.ts";

interface Prop {
    children: React.ReactNode;
}

const PlayerContext = React.createContext({});

function useContext() {
    return React.useContext(PlayerContext);
}

function Context({ children }: Prop) {
    // 设置单曲循环播放，true单曲循环，false列表播放
    const [singleLoop, setSingleLoop] = useState<boolean>(false);
    // 音乐列表
    const [musicList, setMusicList] = useState<MusicList[]>([
        { id: 1, name: 'Fate Stay Night', src: 'music2.mp3' },
        { id: 2, name: 'Two Steps From Hell', src: 'music.mp3' },
    ]);
    return (
        <PlayerContext.Provider value={{ singleLoop, setSingleLoop, musicList, setMusicList }}>
            { children }
        </PlayerContext.Provider>
    )
}

export { useContext, Context }
