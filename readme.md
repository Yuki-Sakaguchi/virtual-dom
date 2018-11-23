# Virtual DOMを作る
以下の記事を元に仮想DOMのフレームワークを作成する  

## 参考
### Virtual DOM
https://kuroeveryday.blogspot.com/2018/11/how-to-create-virtual-dom-framework.html  
https://kuroeveryday.blogspot.com/2018/11/difference-between-dom-and-node-and-element.html
### TypeScript
http://wakame.hatenablog.jp/entry/2016/12/24/232110

## 仮想DOMとは
通常DOMAPIを使ってHTMLを操作するの`リアルDOM`と対になる単語  
ReactもVueがこれと同じような仕様で作られている  

リアルDOM操作にくれべて無駄なレンダリングをしないので高速とされるが、最終的にはDOMを操作するので、量が多ければちゃんと遅くはなる  
  
JavaScriptに仮想DOMという仕様はなく、DOMツリーをjsonのような形式で保持しておく処理を自作する    
DOMに何か変更があった場合には、変更前と変更後の差分を確認し、差分だけをリアルDOM操作する

## Flux
上記フレームワークはFluxアーキテクチャ風の単方向データフローを採用
* View
  * Storeのデータを元に仮想DOMツリーを構築し、レンダリングする
* Action
  * Viewなどから呼ばれるイベントで唯一Storeを更新できる
* Store
  * データの保管庫

## 普通に作ったらこんな感じ
```
<div id="app">
  <p id="counter">0</p>
  <button id="increment">+1</button>
</div>

<script>
  const state = { count: 0 };
  const counter = document.getElementById('counter');
  const btn = document.getElementById('increment');
  btn.addEventListener('click', () => {
    counter.innerText = ++state.count;
  });
</script>
```