import { View, h } from './flamework/view';
import { ActionTree } from './flamework/action';
import { App } from './flamework/app';

type State = typeof state;
type Actions = typeof actions;

/**
 * フレームワークを元にアプリケーションを作成する
 */
const state = {
  count: 0
};

const actions: ActionTree<State> = {
  increment: (state: State) => {
    state.count++;
  }
};

const view: View<State, Actions> = (state, actions) => {
  return h('div', null, 
           h('p', null, state.count),
           h('button', { type: 'button', onclick: () => actions.increment(state) }, 'count up')
         );
};

new App<State, Actions>({
  el: '#app',
  state,
  view,
  actions
});