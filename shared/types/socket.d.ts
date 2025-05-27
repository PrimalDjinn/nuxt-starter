export type SocketTemplate<T = any> = {
  statusCode: number;
  type: TYPE;
  value?: T;
  channel?: string;
};
