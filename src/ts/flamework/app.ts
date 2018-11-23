/**
 * APP
 *    ActionでStoreが更新されたらViewの更新処理を実行するController部
 */
import { ActionTree } from './action';
import { View, VNode, createElement, updateElement } from './view';

/**
 * Appのインターフェース
 */
interface AppConstructor<State, Actions> {
  el: HTMLElement | string; // 親ノード
  view: View<State, ActionTree<State>>; // Viewの定義
  state: State; // 状態管理
  actions: ActionTree<State>; // Actionの定義
}

/**
 * Appクラス
 */
export class App<State, Actions> {
  private readonly el: HTMLElement;
  private readonly view: View<State, ActionTree<State>>;
  private readonly state: State;
  private readonly actions: ActionTree<State>;
  private oldNode: VNode;
  private newNode: VNode;
  private skipRender: boolean;

  /**
   * コンストラクタ
   * @param {AppConstructor<State, Actions>} params 
   * @constructor
   */
  constructor(params: AppConstructor<State, Actions>) {
    this.el = typeof params.el === "string" ? document.querySelector(params.el) : params.el;
    this.view = params.view;
    this.state = params.state;
    this.actions = this.dispatchAction(params.actions);
    this.resolveNode();
  }

  /**
   * ActionにStateを渡し、新しい仮想DOMを作る
   * @param {ActionTree<State>} actions 
   */
  private dispatchAction(actions: ActionTree<State>) {
    const dispatched = {} as ActionTree<State>;
    for (let key in actions) {
      const action = actions[key];
      dispatched[key] = (state: State, ...data: any) => {
        const ret = action(state, ...data);
        this.resolveNode();
        return ret;
      }
    }
    return dispatched;
  }

  /**
   * 仮想DOMを再構築する
   */
  private resolveNode(): void  {
    this.newNode = this.view(this.state, this.actions);
    this.scheduleRender();
  }

  /**
   * レンダリングのスケジューリング
   * （連続でActionが実行された時に何度もDOMツリーを書き換えないため）
   */
  private scheduleRender(): void  {
    if (!this.skipRender) {
      this.skipRender = true;
      setTimeout(this.render.bind(this));
    }
  }

  /**
   * 描画
   */
  private render(): void {
    if (this.oldNode) {
      updateElement(this.el, this.oldNode, this.newNode);
    } else {
      this.el.appendChild(createElement(this.newNode));
    }
    this.oldNode = this.newNode;
    this.skipRender = false;
  }
}