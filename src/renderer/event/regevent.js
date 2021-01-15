/*
 * @Author: your name
 * @Date: 2020-12-27 11:59:10
 * @LastEditTime: 2020-12-27 12:19:02
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\src\renderer\event\regevent.js
 */

import {ipcRenderer} from 'electron';

class RegisterEvent {
    constructor(){
        this.regEvent({
            message: 'messageEvent',
            downloadProgress: 'downloadProgress',
            isUpdateNow: 'isUpdateNow'
        });
    }
    regEvent(events){
        for(let ev in events){
            ipcRenderer.on(ev, this[events[ev]])
        }
    }
    messageEvent(event, text){
        console.log(text);
    }
    downloadProgress(event, progress){
        console.log(progress);
    }
    isUpdateNow(){
        ipcRenderer.send('isUpdateNow')
    }
}

export default RegisterEvent;