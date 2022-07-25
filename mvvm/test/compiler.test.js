import compiler from "../src/compiler";

describe('compiler测试', () => {
    let c = new compiler({});
    test('parseTextExp函数测试1',()=>{
        expect(c.parseTextExp('111{{msg}}222')).toBe("(111)+(msg)+(222)");
    })
    test('parseTextExp函数测试2',()=>{
        expect(c.parseTextExp('1{{msg+1}}2')).toBe("(1)+(msg+1)+(2)");
    })
})