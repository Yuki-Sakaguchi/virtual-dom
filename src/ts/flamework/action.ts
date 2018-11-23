/**
 * Action
 *    基本ユーザが定義するものなので型定義だけ
 */
export type ActionType<State> = (state: State, ...data: any) => void | any;
export type ActionTree<State> = { [action: string]: ActionType<State> };
