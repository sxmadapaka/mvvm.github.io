import dep from "./dep";

export default class observer {
    constructor(data) {
        this.data = data;
        //遍历对象,进行数据劫持
        this.walk(this.data);
    }

    /**
     * 遍历数据对象
     * @param data
     */
    walk(data) {
        if (!data || typeof data !== 'object') {
            return;
        }
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key]);
        })
    }

    /**
     * 设置响应式数据
     * @param data
     * @param key
     * @param value
     */
    defineReactive(data, key, value) {
        let Dep = new dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false, //不可再配置
            get: () => {
                //在用到动态数据时将watcher加入dep的监听列表
                dep.target && Dep.addSub(dep.target);
                return value;
            },
            set: (newValue) => {
                console.log('set');
                value = newValue;
                //向监听者通知变更
                Dep.notify();
            }
        })
        this.walk(value); //深度遍历数据中的对象，直到无数据或数据不是对象退出递归
    }
}