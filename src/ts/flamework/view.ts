/**
 * View
 *    仮想DOMを作成するh関数を定義
 */

type NodeType = VNode | string | number;
type Attributes = { [key: string]: string | Function };

export interface View<State, Actions> {
  (state: State, actions: Actions): VNode;
}

/**
 * 仮想DOMインターフェース
 */
export interface VNode {
  nodeName: keyof ElementTagNameMap;
  attributes: Attributes;
  children: NodeType[];
}

/**
 * 仮想DOMを作成する関数
 * @param {ElementTagNameMap} nodeName タグ名
 * @param {Attributes} attributes 属性オブジェクト
 * @param {Array<NodeType>} children 子要素
 */
export function h(nodeName: keyof ElementTagNameMap, attributes: Attributes, ...children: NodeType[]): VNode {
  return {
    nodeName,
    attributes,
    children
  };
}

/**
 * リアルDOMを生成する関数
 * @param {NodeType} node
 */
export function createElement(node: NodeType): HTMLElement | Text {
  if (!isVNode(node)) {
    return document.createTextNode(node.toString());
  }
  const el = document.createElement(node.nodeName);
  setAttributes(el, node.attributes);
  node.children.forEach(child => el.appendChild(createElement(child)));
  return el;
}

/**
 * 仮想DOMかどうかを確認する関数
 * @param {NodeType} node 
 * @return {boolean} 引数が仮想DOMだった場合true, それ以外はfalse
 */
function isVNode(node: NodeType): node is VNode {
  return typeof node !== "string" && typeof node !== "number";
}

/**
 * 属性を追加する関数
 * @param {HTMLElement} target 属性を追加する要素
 * @param {Attributes} attrs 属性オブジェクト
 */
function setAttributes(target: HTMLElement, attrs: Attributes): void {
  for (let attr in attrs) {
    if (isEventAttr(attr)) {
      const eventName = attr.slice(2);
      target.addEventListener(eventName, attrs[attr] as EventListener);
    } else {
      target.setAttribute(attr, attrs[attr] as string);
    }
  }
}

/**
 * 引数がイベントを表す文字列かどうか判定
 * @param {string} attr 属性名
 * @return {boolean} 引数がイベントの時true, それ以外の時false
 */
function isEventAttr(attr: string): boolean {
  return /^on/.test(attr);
}

/**
 * 変更があった場合の処理タイプ
 */
enum ChangedType {
  None, // 差分なし
  Type, // nodeの型が違う
  Text, // テキストノードが違う
  Node, // ノード名（タグ名）が違う
  Value, // inputのvalueが違う
  Attr // 属性が違う
}

/**
 * ２つの仮想DOMの差分を検知する（他のフレームワークだとここの処理はもっと複雑かも）
 * @param {NodeType} before 変更前
 * @param {NodeType} after 変更後
 */
function hasChanged(a: NodeType, b: NodeType): ChangedType {
  // different type
  if (typeof a !== typeof b) {
    return ChangedType.Type;
  }

  // different string
  if (!isVNode(a) && a !== b) {
    return ChangedType.Text;
  }

  // 簡易的比較()
  if (isVNode(a) && isVNode(b)) {
    if (a.nodeName !== b.nodeName) {
      return ChangedType.Node;
    }
    if ((a.attributes !== null && b.attributes !== null) && a.attributes.value !== b.attributes.value) {
      return ChangedType.Value;
    }
    if (JSON.stringify(a.attributes) !== JSON.stringify(b.attributes)) {
      return ChangedType.Attr;
    }
  }
  return ChangedType.None;
}

/**
 * 仮想DOMの差分を検知し、リアルDOMに反映する
 * @param {HTMLElement} parent 
 * @param {NodeType} oldNode 
 * @param {NodeType} newNode 
 * @param {number} index 
 */
export function updateElement(parent: HTMLElement, oldNode: NodeType, newNode: NodeType, index:number = 0): void {
  // 古いNodeがなければ新しく作る
  if (oldNode == null) {
    parent.appendChild(createElement(newNode));
    return;
  }

  const target = parent.childNodes[index];

  // 新しいNodeがなければ削除
  if (newNode == null) {
    parent.removeChild(target);
    return;
  }

  // どちらもあれば差分をチェックし、処理を行う
  const changeType = hasChanged(oldNode, newNode);

  switch(changeType) {
    case ChangedType.Type:
    case ChangedType.Text:
    case ChangedType.Node:
      parent.replaceChild(createElement(newNode), target);
      return;
    case ChangedType.Value:
      updateValue(target as HTMLInputElement, (newNode as VNode).attributes.value as string);
      return;
    case ChangedType.Attr:
      updateAttributes(target as HTMLElement, (oldNode as VNode).attributes, (newNode as VNode).attributes);
      return;
  }

  // 再帰的に子要素の更新を行う
  if (isVNode(oldNode) && isVNode(newNode)) {
    for (let i = 0; i < newNode.children.length || i < oldNode.children.length; i++) {
      updateElement(target as HTMLElement, oldNode.children[i], newNode.children[i]);
    }
  }
}

/**
 * targetのvalueを更新
 * @param {HTMLInputElement} target 
 * @param {string} newValue 
 */
function updateValue(target: HTMLInputElement, newValue: string): void {
  target.value = newValue;
}

/**
 * targetの属性値を更新
 * 単純にNodeごとreplaceしてしまうとinputのフォーカスが外れてしまうので値だけ更新
 * @param {HTMLElement} target 
 * @param {Attributes} oldAttributes 
 * @param {Attributes} newAttributes 
 */
function updateAttributes(target: HTMLElement, oldAttributes: Attributes, newAttributes: Attributes): void {
  // 古いのは消す
  for (let attr in oldAttributes) {
    if (!isEventAttr(attr)) {
      target.removeAttribute(attr);
    }
  }
  // 新しいものを追加する
  for (let attr in newAttributes) {
    if (!isEventAttr(attr)) {
      target.setAttribute(attr, newAttributes[attr] as string);
    }
  }
} 