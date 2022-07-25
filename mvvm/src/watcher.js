import dep from "./dep";

var $uid = 0;
export default class watcher{
    constructor(exp,scope,cb) {
        this.exp=exp;
        this.scope=scope;
        this.cb=cb;
        this.uid=$uid++;
        this.update();
    }

    /**
     * 计算表达式
     */
    get(){
        dep.target = this;
        let newValue = watcher.computeExpression(this.exp,this.scope);
        dep.target = null;
        return newValue;
    }

    /**
     * 执行回调函数
     */
    update() {
        let newValue = this.get();
        this.cb && this.cb(newValue);
    }

    static computeExpression(exp,scope){
        let fn = new Function('scope','with(scope){return '+exp+'}');
        return fn(scope);
    }
}