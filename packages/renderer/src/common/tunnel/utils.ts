import { uniqueId } from 'lodash';

export function uuid(prefix = '') {
  return [
    uniqueId(prefix),
    Math.random().toString(36).toString().slice(2),
  ].join('-');
}
