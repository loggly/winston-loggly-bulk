const { Loggly } = require('../lib/winston-loggly');
const winston = require('winston');

const client = {
  log: () => {}
};

const createLoggly = () => {
  const loggly = new Loggly({
    token: 'does-not-matter', //required
    subdomain: 'does-not-matter', //required
    timestamp: false //generating timestamps would break the tests
  });
  loggly.client = client;
  return loggly;
};

const loggly = createLoggly();

describe('loggly adapter', () => {
  let spy;

  afterEach(() => {
    spy.mockRestore();
  });

  beforeEach(() => {
    spy = jest.spyOn(client, 'log');
  });

  test('calls logging', () => {
    loggly.log();
    expect(spy).toHaveBeenCalled();
  });

  test('handles undefined event', () => {
    loggly.log(undefined);
    expect(spy).toHaveBeenCalledWith({}, expect.any(Function));
  });

  test('handles boolean event', () => {
    const bool = true;
    loggly.log(bool);
    expect(spy).toHaveBeenCalledWith({ metadata: bool }, expect.any(Function));
  });

  test('handles number event', () => {
    const number = 123;
    loggly.log(number);
    expect(spy).toHaveBeenCalledWith(
      { metadata: number },
      expect.any(Function)
    );
  });

  test('handles string event', () => {
    const string = 'Hello world!';
    loggly.log(string);
    expect(spy).toHaveBeenCalledWith(
      { metadata: string },
      expect.any(Function)
    );
  });

  test('handles object event', () => {
    const data = { prop: 'Hello world' };
    loggly.log(data);
    expect(spy).toHaveBeenCalledWith(data, expect.any(Function));
  });
});

describe('winston integration', () => {
  let spy, loggly;

  afterEach(() => {
    winston.remove(loggly);
    spy.mockRestore();
  });

  beforeEach(() => {
    spy = jest.spyOn(client, 'log');
    loggly = createLoggly(); //requires to create new loggly instance for each test
    winston.add(loggly);
  });

  test('logs level and message', () => {
    const level = 'info';
    const message = 'Hello world';
    winston.log(level, message);
    expect(spy).toHaveBeenCalledWith(
      {
        level,
        message,
        [Symbol.for('level')]: level,
        [Symbol.for('message')]: JSON.stringify({ level, message })
      },
      expect.any(Function)
    );
  });

  test('logs object', () => {
    const level = 'info';
    const message = 'Hello world';
    winston.log({ level, message });
    expect(spy).toHaveBeenCalledWith(
      {
        level,
        message,
        [Symbol.for('level')]: level,
        [Symbol.for('message')]: JSON.stringify({ level, message })
      },
      expect.any(Function)
    );
  });

  test('logs message as object', () => {
    const level = 'info';
    const message = { message: 'Hello world' };
    winston.log(level, message);
    expect(spy).toHaveBeenCalledWith(
      {
        level,
        ...message,
        [Symbol.for('level')]: level,
        [Symbol.for('message')]: JSON.stringify({ ...message, level })
      },
      expect.any(Function)
    );
  });

  test('logs metadata', () => {
    const level = 'info';
    const message = 'Hello world';
    const meta = { data: 'test' };
    winston.log(level, message, meta);
    expect(spy).toHaveBeenCalledWith(
      {
        ...meta,
        level,
        message,
        [Symbol.for('level')]: level,
        [Symbol.for('message')]: JSON.stringify({ ...meta, level, message }),
        [Symbol.for('splat')]: [meta]
      },
      expect.any(Function)
    );
  });

  test('logs metadata as primitive type', () => {
    const level = 'info';
    const message = 'Hello world';
    const meta = 12345;
    winston.log(level, message, meta);
    expect(spy).toHaveBeenCalledWith(
      {
        details: [meta],
        level,
        message,
        [Symbol.for('level')]: level,
        [Symbol.for('message')]: JSON.stringify({ level, message }),
        [Symbol.for('splat')]: [meta]
      },
      expect.any(Function)
    );
  });

  test('logs multiple metadata starting with primitive type', () => {
    const level = 'info';
    const message = 'Hello world';
    const meta = [12345, { custom: true }, 'foo', { bar: 'baz' }];
    winston.log(level, message, ...meta);
    expect(spy).toHaveBeenCalledWith(
      {
        details: meta,
        level,
        message,
        [Symbol.for('level')]: level,
        [Symbol.for('message')]: JSON.stringify({ level, message }),
        [Symbol.for('splat')]: meta
      },
      expect.any(Function)
    );
  });

  test('logs multiple metadata starting with object', () => {
    const level = 'warn';
    const message = 'Hello world';
    const meta = [{ custom: true, secret: 'foo' }, { bar: 'baz' }];
    winston.log(level, message, ...meta);
    expect(spy).toHaveBeenCalledWith(
      {
        details: [meta[1]],
        level,
        message,
        ...meta[0],
        [Symbol.for('level')]: level,
        [Symbol.for('message')]: JSON.stringify({ ...meta[0], level, message }),
        [Symbol.for('splat')]: meta
      },
      expect.any(Function)
    );
  });

  test('handles "details" prop duplicity', () => {
    const level = 'warn';
    const message = 'Hello world';
    const meta = [{ details: true, secret: 'foo' }, { bar: 'baz' }];
    winston.log(level, message, ...meta);
    expect(spy).toHaveBeenCalledWith(
      {
        details: [{ details: true }, meta[1]],
        secret: "foo",
        level,
        message,
        [Symbol.for('level')]: level,
        [Symbol.for('message')]: JSON.stringify({ ...meta[0], level, message }),
        [Symbol.for('splat')]: meta
      },
      expect.any(Function)
    );
  });

});
