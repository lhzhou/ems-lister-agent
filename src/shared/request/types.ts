export type ApiClient = {
  request: <T>(input: {
    method: string;
    path: string;
    query?: unknown;
    body?: unknown;
  }) => Promise<T>;
};
