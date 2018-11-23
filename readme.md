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

リアルDOM操作に比べて無駄なレンダリングをしないので高速とされるが、最終的にはDOMを操作するので、量が多ければちゃんと遅くはなる  
  
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

## DEMO
https://yuki-sakaguchi.github.io/virtual-dom/counter.html  
https://yuki-sakaguchi.github.io/virtual-dom/todo.html