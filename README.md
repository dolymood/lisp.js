JS-lisp---
==

<p>一个JavaScript版lisp解析器。</p>
<p>参考Peter Norvig的 <a href='http://norvig.com/lispy.html'>How to Write a (Lisp) Interpreter (in Python)</a>。</p>
<p>文件wangjianbo--lisp解析器--test.html和guanyuxin--Lisp词法分析.html为朋友写的。</p>
<p>Lispy支持的Scheme子集的语法和语义</p>
<p>Scheme的优美之处就在于我们只需要六种特殊形式，以及另外的三种语法构造——变量、常量和过程调用：</p>
<table border="1" cellspacing="0" cellpadding="3">
<tbody><tr style="background-color:#EEEEEE">
<th width="15%">形式 (Form)
</th><th width="20%">语法
</th><th>语义和示例<br>
</th></tr><tr>
<td align="center"><a href="http://www.schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-7.html#%_sec_4.1.1" target="_blank">变量引用</a>
</td><td><i>var</i>
</td><td>一个符号，被解释为一个变量名；其值就是这个变量的值。<br>示例: <code>x</code><br>
</td></tr><tr>
<td align="center"><a href="http://www.schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-7.html#%_sec_4.1.2" target="_blank">常量字面值</a>
</td><td><i>number</i>
</td><td>数字的求值结果为其本身<br>示例: <code>12</code> <i>或者</i><code>-3.45e+6</code><br>
</td></tr><tr>
<td align="center"><a href="http://www.schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-7.html#%_sec_4.1.2" target="_blank">引用</a>
</td><td>(<code>quote</code> <i>exp</i>)
</td><td>返回<i>exp</i>的字面值；不对它进行求值。<br>示例：<code>(quote (a b c)) ⇒ (a b c)</code><br>
</td></tr><tr>
<td align="center"><a href="http://www.schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-7.html#%_sec_4.1.5" target="_blank">条件测试</a>
</td><td>(<code>if</code> <i>test conseq alt</i>)
</td><td>对<i>test</i>进行求值；如果结果为真，那么对<i>conseq</i>进行求值并返回结果；否则对<i>alt</i>求值并返回结果。 <br>示例：<code>(if (&lt; 10 20) (+ 1 1) (+ 3 3)) ⇒ 2</code><br>
</td></tr><tr>
<td align="center"><a href="http://www.schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-7.html#%_sec_4.1.6" target="_blank">赋值</a>
</td><td>(<code>set!</code> <i>var</i> <i>exp</i>)
</td><td>对<i>exp</i>进行求值并将结果赋给<i>var</i>，<em>var</em>必须已经进行过定义 (使用<code>define</code>进行定义或者作为一个封闭过程的参数)。<br>示例：<code>(set! x2 (* x x))</code><br>
</td></tr><tr>
<td align="center"><a href="http://www.schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-8.html#%_sec_5.2" target="_blank">定义</a>
</td><td>(<code>define</code> <i>var</i> <i>exp</i>)
</td><td>在最内层环境 (environment) 中定义一个新的变量并将对<i>exp</i>表达式求值所得的结果赋给该变量。<br>示例：(<code>define r 3)</code> <i>或者</i> <code>(define square (lambda (x) (* x x)))</code><br>
</td></tr><tr>
<td align="center"><a href="http://www.schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-7.html#%_sec_4.1.4" target="_blank">过程</a>
</td><td>(<code>lambda</code> (<i>var…</i>) <i>exp</i>)
</td><td>创建一个过程，其参数名字为<i>var…</i>，过程体为相应的表达式。 <br>示例：<code>(lambda (r) (* 3.141592653 (* r r)))</code><br>
</td></tr><tr>
<td align="center"><a href="http://www.schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-7.html#%_sec_4.2.3" target="_blank">(表达式) 序列</a>
</td><td>(<code>begin</code> <i>exp…</i>)
</td><td>按从左到右的顺序对表达式进行求值，并返回最终的结果。<br>示例：<code>(begin (set! x 1) (set! x (+ x 1)) (* x 2)) ⇒ 4</code><br>
</td></tr><tr>
<td align="center"><a href="http://www.schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-7.html#%_sec_4.1.3" target="_blank">过程调用</a>
</td><td>(<i>proc exp…</i>)
</td><td>如果<i>proc</i>是除了<code>if, set!, define, lambda, begin,</code>或者<code>quote</code>之外的其它符号的话，那么它会被视作一个过程。它的求值规则如下：所有的表达式<i>exp</i>都将被求值，然后这些求值结果作为过程的实际参数来调用该相应的过程。<br>示例：<code>(square 12) ⇒ 144</code></td></tr></tbody></table>
