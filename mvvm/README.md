# myVue说明文档

## 1.简介

此程序为使用js实现的简单mvvm框架，实现了数据劫持、发布订阅模式、数据双向绑定功能，使用jest进行单元测试，webpack进行打包。主要分为以下几个模块：index.js、observer.js、compiler.js、watcher.js、dep.js。其中index.js为总框架和程序对外出口，observer.js进行数据劫持，compiler.js用于编译模板，watcher.js和dep.js用于实现发布订阅模式。

## 2.index模块

构造函数：

```javascript
constructor(options) {
        //获取元素的dom对象
        this.$el = document.querySelector(options.el);
        //转存数据
        this.$data = options.data || {};
        //数据和函数代理
        this._proxyData(this.$data);
        this._proxyMethods(options.methods);
        //数据劫持
        new observer(this.$data);
        //模板编译
        new compiler(this);
    }
```

_proxyData和_proxyMethods两函数分别用于数据代理和函数代理，使得$data和$methods中的数据可以直接通过myVue实例进行访问，例如vm.$data.msg可以直接通过vm.msg获取。

## 3.observer模块

动态设置响应式数据，主要通过defineReactive函数实现：

```javascript
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
                value = newValue;
                //向监听者通知变更
                Dep.notify();
            }
        })
        this.walk(value); //深度遍历数据中的对象，直到无数据或数据不是对象退出递归
    }
```

使用defineProperty()函数设置每个属性的get、set函数，使得get时将请求动态数据的watcher添加到对应数据的订阅者列表中，每次set时向所有订阅者通知变更。

## 4.compiler模块

构造函数：

```javascript
constructor(context) {
        this.$el = context.$el;
        this.context = context;
        if (this.$el) {
            //将原始dom转为文档片段
            this.$fragment = this.nodeToFragment(this.$el);
            //编译模板
            this.compiler(this.$fragment);
            //把文档片段添加到页面中
            this.$el.appendChild(this.$fragment);
        }
```

该模块用于将dom转为文档片段并对页面进行渲染。nodeToFragement函数用于判断需要进行渲染的dom节点，并将其转为文档片段添加至fragment中。 parseTextExp函数通过正则表达式将双括号内的字符串转为表达式形式。compileElementNode方法会解析指令，并添加相应的数据绑定。

## 5.watcher模块

订阅者类，包含get和update方法，get方法用于计算动态表达式的值，并将用到动态数据的订阅者加入对应数据的订阅列表。而update方法则用于在数据变更时通知watcher更新数据。

```javascript
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
```

## 6.dep模块

```javascript
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
```

响应式数据的订阅列表，addSub用于添加订阅者，notify用于发布变更。

