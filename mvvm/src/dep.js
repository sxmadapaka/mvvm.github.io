export default class dep{
    constructor() {
        //存放监听者
        this.subs={};
    }

    addSub(target){
        this.subs[target.uid] = target;
    }

    /**
     * 数据更新时触发update
     */
    notify(){
        for (let uid in this.subs){
            this.subs[uid].update();
        }
    }
}