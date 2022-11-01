export const alertAndThrow = (err: unknown) => {
  alert((err as Error).message);
  throw err;
};
