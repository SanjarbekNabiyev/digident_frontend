// eventBus.js
import { reactive, provide, inject } from 'vue';

const eventBusSymbol = Symbol();

function createEventBus() {
  const listeners = {};

  const $on = (event, callback) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  };

  const $emit = (event, ...args) => {
    if (listeners[event]) {
      listeners[event].forEach(callback => callback(...args));
    }
  };

  const eventBus = {
    listeners,
    $on,
    $emit
  };

  provide(eventBusSymbol, eventBus);
  return eventBus;
}

function useEventBus() {
  const eventBus = inject(eventBusSymbol);
  if (!eventBus) {
    throw new Error('useEventBus() must be called within a component wrapped with createEventBus().');
  }
  return eventBus;
}

export { createEventBus, useEventBus };
