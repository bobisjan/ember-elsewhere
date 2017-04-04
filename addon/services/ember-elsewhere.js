import Ember from 'ember';
const { Service, run, Object: EmObject, A: emArray } = Ember;

export default Service.extend({
  fastboot: Ember.computed(function() {
    return Ember.getOwner(this).lookup('service:fastboot');
  }),

  isFastBoot: Ember.computed('fastboot', function() {
    return this.get('fastboot.isFastBoot');
  }),

  init() {
    this._super();
    this.set('actives', EmObject.create());
    this._alive = {};
    this._counter = 1;
  },

  show(sourceId, name, component) {
    this._alive[sourceId] = {
      target: name || 'default',
      component,
      order: this._counter++
    };
    this._schedule();
  },

  clear(sourceId) {
    delete this._alive[sourceId];
    this._schedule();
  },

  _schedule() {
    if (this.get('isFastBoot')) {
      this._process();
    } else {
      run.scheduleOnce('afterRender', this, this._process);
    }
  },

  _process() {
    let newActives = {};
    let alive = this._alive;

    Object.keys(alive).forEach((sourceId) => {
      let { target, component, order } = alive[sourceId];
      newActives[target] = newActives[target] || emArray();
      let newActive = component ? { component, order } : null;

      newActives[target].push(newActive);
    });
    Object.keys(newActives).forEach((target) => {
      newActives[target] = newActives[target].sortBy('order');
    });

    this.set('actives', EmObject.create(newActives));
  }
});
