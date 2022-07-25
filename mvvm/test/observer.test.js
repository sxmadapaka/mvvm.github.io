import observer from "../src/observer";
import {get} from "jsdom/lib/jsdom/named-properties-tracker";

describe('observer模块测试',()=>{
    let ob = new observer({});
    test('defineReactive方法测试',()=>{
        let data = {test:'test'}
        ob.defineReactive({test:'test'},'test',data["test"]);
        expect(data.test).toBe(data["test"]);
    })
})

