/**
 * 
 */
var lisp = (function() {
    var toString = Object.prototype.toString,
        slice = Array.prototype.slice;
    
    // + - * /
    function arithmetic(type) {
        return function() {
            var result = 0, len = arguments.length, i = 1, num;
            result = evl(arguments[0], this);
            for (; i < len; i++) {
                num = evl(arguments[i], this);
                switch (type) {
                    case '+':
                        result += num;
                        break;
                    case '-':
                        result -= num;
                        break;
                    case '*':
                        result *= num;
                        break;
                    case '/':
                        result /= num;
                        break;
                    default:
                        throw 'The arithmetic:' + type + ' can not be identified.';
                        break;
                }
            }
            return result;
        };
    }
    
    function compare(type) {
        return function(a, b) {
            a = evl(a, this);
            b = evl(b, this);
            switch (type) {
                case '<':
                    return a < b;
                    break;
                case '>':
                    return a > b;
                    break;
                case '<=':
                    return a <= b;
                    break;
                case '>=':
                    return a >= b;
                    break;
                case 'equal?':
                    return a == b;
                    break;
                default:
                    throw 'The comparison arithmetic:' + type + ' can not be identified.';
                    break;
            }
        };
    }
    
    //全局的默认需要解析函数（需拓展）全局作用域
    var defaultMap = {
        '+': arithmetic('+'),
        '-': arithmetic('-'),
        '*': arithmetic('*'),
        '/': arithmetic('/'),
        '<': compare('<'),
        '>': compare('>'),
        '<=': compare('<='),
        '>=': compare('>='),
        'equal?': compare('equal?'),
        // 引用
        'quote': function(exp) {
                return exp;
            },
        // 条件
        'if': function(test, conseq, alt) {
                if (evl(test, this)) {
                    if (conseq !== undefined) return evl(conseq, this);
                } else {
                    if (alt !== undefined) return evl(alt, this);
                }
            },
        // 赋值
        'set!': function(val, exp) {
                var obj = findObjByKey(val, this);
                if (obj) {
                    obj.variables[val] = evl(exp, this);
                }
            },
        // 定义
        'define': function(val, exp) {
                this.variables[val] = evl(exp, this); 
            },
        // 过程（函数）
        'lambda': function(vars, exp) {
                var func_map = {};
                func_map.variables = {};
                func_map._parent_ = this;
                return function() {
                    var args = arguments;
                    vars.forEach(function(item, index, ary) {
                        func_map.variables[item] = args[index];
                    });
                    return evl(exp, func_map);
                };
            },
        // 序列
        'begin': function() {
                var args = slice.call(arguments), returnVal;
                args.forEach(function(item, index, ary) {
                    returnVal = evl(item, this);
                }, this);
                return returnVal;
            },
        // 过程（函数）调用
        'proc': function(funcName) {
                var func = this.variables[funcName],
                    args = slice.call(arguments, 1);
                args.forEach(function(item, index, ary) {
                    ary[index] = evl(item, this);
                }, this);
                return func.apply(null, args);
            }
    };
    defaultMap.variables = {};//作用域中的定义的变量
    
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(fn, scope) {
            scope = scope || null;
            for (var i = 0, len = this.length; i < len; i++) {
                fn.call(scope, this[i], i, this);
            }
        };
    }
    if (!Array.prototype.filter) {
        Array.prototype.filter = function(fn, scope) {
            scope = scope || null;
            var result = [];
            for (var i = 0, len = this.length; i < len; i++) {
                if (!fn.call(scope, this[i], i, this)) continue;
                result.push(this[i]);
            }
            return result;
        };
    }
    
    // '(+ 1 +2 (- 3 5.6) -8.7)'→
    // ["(", "+", "1", "+2", "(", "-", "3", "5.6", ")", "-8.7", ")"]
    function toArray(str) {
        str = str.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').split(' ');
        str = str.filter(function(item, index, ary) {
            return item !== '';
        });
        return str;
    }
    
    // 
    // ["(", "+", "1", "2", "(", "-", 3, 5.6, ")", "-8.7", ")"] →
    // ["+", 1, 2, ["-", 3, 5.6], -8.7]
    // check
    function read_from(strAry) {
        if (strAry.length == 0) throw '缺少右括号.';
        var token = strAry.shift(), result = [], reVal;
        if (token == '(') {
            if (strAry.length > 0) {
                while (strAry[0] !== ')') {
                    result.push(read_from(strAry));
                }
                strAry.shift();
                return result;//maybe todo:可以加上长度的判断 ["+", 2]这样的可以考虑是不对的
            } else {
                throw '括号中没内容.';
            }
            
        } else if (token == ')') {
            throw 'unexpected )'
        } else {
            return parseVal(token);
        }
    }
    
    // parse value
    function parseVal(val) {
        if (val == 'true') return true;
        if (val == 'false') return false;
        var reVal = +val;
        if (isNaN(reVal)) {//非数字
            reVal = val;
        }
        return reVal;
    }
    
    // '(+ 1 +2 (- 3 5.6) -8.7)'→
    // ["+", 1, 2, ["-", 3, 5.6], -8.7]
    function parse(str) {
        str = str.replace(/[\r\t\n]/g, " ");
        return read_from(toArray(str));
    }
    
    // 查找包含key的对象
    function findObjByKey(key, obj) {
        var rVal = obj.variables.hasOwnProperty(key);
        if (rVal === true) {//已定义
            return obj;
        } else {
            if (obj._parent_) {
                return findObjByKey(key, obj._parent_);
            } else {//未定义
                throw 'undefined: ' + key;
            }
        }
    }
    
    // 查找对象（对象的_parent_）变量的值
    function find(key, obj) {
        var rVal = obj.variables[key];
        if (rVal !== undefined) {
            return rVal;
        } else {
            if (obj._parent_) {
                return find(key, obj._parent_);
            }
        }
        return null;
    }
    
    // 查找对象（对象的_parent_）默认key值
    function findDefault(key, obj) {
        var rVal = obj[key];
        if (rVal !== undefined) {
            return rVal;
        } else {
            if (obj._parent_) {
                return findDefault(key, obj._parent_);
            }
        }
        return null;
    }
    
    // 处理lisp的9种情况
    // 常量 变量 引用 条件 赋值 定义 过程 序列 过程调用
    function evl(array, obj) {
        switch (toString.call(array)) {
            case '[object Array]': //进一步解析
                var startStr = array[0];
                var startStrVal = find(startStr, obj);
                var startStrValD = findDefault(startStr, obj);
                if (startStrVal || startStrValD) {
                    if (startStrValD) {//基本函数调用
                        return startStrValD.apply(obj, array.slice(1));
                    } else {//自定义函数调用（过程调用）
                        return findDefault('proc', obj).apply(obj, array);
                    }
                } else {
                    throw startStr + '未定义';
                }
            break;
            case '[object String]': //定义的变量||字符串
                var returnValue = find(array, obj);//自定义变量
                if (!returnValue) {//字符串
                    returnValue = array;
                }
                return returnValue;
                break;
            case '[object Number]': //常量数字
            case '[object Undefined]': //undefined
            case '[object Null]': //null
            case '[object Boolean]': //boolean
                return array;
                break;
            default:
                throw 'evl: arguments error';
                break;
        }
    }
    
    // 调用parse得到的结果Array
    function compute(ary) {
        if (arguments.length < 1) throw 'function compute must have one argument';
        if (toString.call(ary) == '[object String]') ary = parse(ary);
        if (ary.length <= 0) throw '长度为0.';
        //计算 转换
        return evl(ary, defaultMap);
    }
    
    return {
        //首先调用的是parse，解析，然后调用compute计算
        parse: parse,
        compute: compute
    };
    
})();