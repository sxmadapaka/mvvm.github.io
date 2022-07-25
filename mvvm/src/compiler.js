import watcher from "./watcher";

export default class compiler {
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
    }

    /**
     * 把所有元素转为文档片段
     * @param node
     */
    nodeToFragment(node) {
        let fragment = document.createDocumentFragment();
        if (node.childNodes && node.childNodes.length) {
            node.childNodes.forEach(child => {
                if (!this.ignorable(child)) {
                    fragment.appendChild(child);
                }
            });
        }
        return fragment;
    }

    /**
     * 判断一个节点是否需要添加到文档片段
     * @param node
     * @returns {boolean}
     */
    ignorable(node) {
        let reg = /^[\t\n\r]+/;
        return (
            node.nodeType === 8 || (node.nodeType === 3 && reg.test(node.textContent))
        );
    }

    /**
     * 模板编译
     * @param node
     */
    compiler(node) {
        if (node.childNodes && node.childNodes.length) {
            node.childNodes.forEach(child => {
                if (child.nodeType === 1) {
                    //元素节点
                    this.compileElementNode(child);
                } else if (child.nodeType === 3) {
                    //文本节点
                    this.compileTextNode(child);
                }
            })
        }
    }

    /**
     * 编译元素节点
     * @param node
     */
    compileElementNode(node) {
        let attrs = [...node.attributes];
        attrs.forEach(attr => {
            let {name: attrName, value: attrValue} = attr;
            if (attrName.indexOf('v-') === 0) {
                let dirName = attrName.slice(2); //实际指令名称
                switch (dirName) {
                    case 'text':
                        new watcher(attrValue, this.context, newValue => {
                            node.textContent = newValue;
                        })
                        break;
                    case 'model':
                        new watcher(attrValue, this.context, newValue => {
                            node.value = newValue;
                        });
                        node.addEventListener('input', e => {
                            this.context[attrValue] = e.target.value;
                        })
                        break;
                }
            }
            if (attrName.indexOf('@') === 0) {
                this.compilerMethods(this.context, node, attrName, attrValue);
            }
        })
        this.compiler(node);
    }

    /**
     * 函数编译
     * @param scope
     * @param node
     * @param attrName
     * @param attrValue
     */
    compilerMethods(scope, node, attrName, attrValue) {
        let type = attrName.slice(1);
        let fn = scope[attrValue];
        node.addEventListener(type, fn.bind(scope));
    }

    /**
     * 编译文本节点
     * @param node
     */
    compileTextNode(node) {
        let text = node.textContent.trim();
        if (text) {
            let exp = this.parseTextExp(text);
            console.log(exp);
            new watcher(exp, this.context, newValue => {
                node.textContent = newValue;
            })
        }
    }

    /**
     * 双括号内文本到表达式的转换
     * @param text
     */
    parseTextExp(text) {
        let regText = /\{\{(.+?)\}\}/g;
        //分割插值表达式前后内容
        let pieces = text.split(regText);
        console.log(pieces);
        //匹配插值表达式
        let matches = text.match(regText);
        //表达式数组
        let tokens = [];
        pieces.forEach(item => {
            if (matches && matches.indexOf("{{" + item + "}}" > -1)) {
                tokens.push("(" + item + ")");
            } else {
                tokens.push("`" + item + "`");
            }
        })
        return tokens.join('+');
    }
}