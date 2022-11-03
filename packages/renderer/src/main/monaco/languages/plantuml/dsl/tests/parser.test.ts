import { parse } from '../parser';
import usecases from './fixtures/usecases';

for (const usecase of usecases) {
  it(usecase.desc, () => {
    expect(parse(usecase.input)).toEqual(usecase.expect);
  });
}
