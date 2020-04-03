const { Loggly } = require('../lib/winston-loggly');
const winston = require('winston');

const client = {
  log: () => {}
};

const createLoggly = () =>
  new Loggly(
    {
      token: 'does-not-matter', //required
      subdomain: 'does-not-matter', //required
      timestamp: false //generating timestamps would break the tests
    },
    client
  );

const loggly = createLoggly();

describe('loggly adapter', () => {
  test('calls logging', () => {
    const spy = jest.spyOn(client, 'log');
    loggly.log();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('handles undefined event', () => {
    const spy = jest.spyOn(client, 'log');
    loggly.log(undefined);
    expect(spy).toHaveBeenCalledWith({}, expect.any(Function));
    spy.mockRestore();
  });

  test('handles boolean event', () => {
    const spy = jest.spyOn(client, 'log');
    const bool = true;
    loggly.log(bool);
    expect(spy).toHaveBeenCalledWith({ metadata: bool }, expect.any(Function));
    spy.mockRestore();
  });

  test('handles number event', () => {
    const spy = jest.spyOn(client, 'log');
    const number = 123;
    loggly.log(number);
    expect(spy).toHaveBeenCalledWith(
      { metadata: number },
      expect.any(Function)
    );
    spy.mockRestore();
  });

  test('handles string event', () => {
    const spy = jest.spyOn(client, 'log');
    const string = 'Hello world!';
    loggly.log(string);
    expect(spy).toHaveBeenCalledWith(
      { metadata: string },
      expect.any(Function)
    );
    spy.mockRestore();
  });

  test('handles object event', () => {
    const spy = jest.spyOn(client, 'log');
    const data = { prop: 'Hello world' };
    loggly.log(data);
    expect(spy).toHaveBeenCalledWith(data, expect.any(Function));
    spy.mockRestore();
  });
});

describe('winston integration', () => {
  test('logs level and message', () => {
    const spy = jest.spyOn(client, 'log');
    const level = 'info';
    const message = 'Hello world';
    const loggly = createLoggly(); //requires to create new loggly instance for each test
    winston.add(loggly);
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
    winston.remove(loggly);
    spy.mockRestore();
  });

  test('logs object', () => {
    const spy = jest.spyOn(client, 'log');
    const level = 'info';
    const message = "Hello world";
    const loggly = createLoggly(); //requires to create new loggly instance for each test
    winston.add(loggly);
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
    winston.remove(loggly);
    spy.mockRestore();
  });

  test('logs message as object', () => {
    const spy = jest.spyOn(client, 'log');
    const level = 'info';
    const message = { message: "Hello world" };
    const loggly = createLoggly(); //requires to create new loggly instance for each test
    winston.add(loggly);
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
    winston.remove(loggly);
    spy.mockRestore();
  });

  test('logs metadata', () => {
    const spy = jest.spyOn(client, 'log');
    const level = 'info';
    const message = "Hello world";
    const meta = { data: "test" };
    const loggly = createLoggly(); //requires to create new loggly instance for each test
    winston.add(loggly);
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
    winston.remove(loggly);
    spy.mockRestore();
  });

  test('logs metadata as primitive type', () => {
    const spy = jest.spyOn(client, 'log');
    const level = 'info';
    const message = "Hello world";
    const meta = 12345;
    const loggly = createLoggly(); //requires to create new loggly instance for each test
    winston.add(loggly);
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
    winston.remove(loggly);
    spy.mockRestore();
  });

  test('logs multiple metadata starting with primitive type', () => {
    const spy = jest.spyOn(client, 'log');
    const level = 'info';
    const message = "Hello world";
    const meta = [
      12345,
      { custom: true },
      "foo",
      { "bar": "baz" }
    ];
    const loggly = createLoggly(); //requires to create new loggly instance for each test
    winston.add(loggly);
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
    winston.remove(loggly);
    spy.mockRestore();
  });

  test('logs multiple metadata starting with object', () => {
    const spy = jest.spyOn(client, 'log');
    const level = 'warn';
    const message = "Hello world";
    const meta = [
      { custom: true, secret: "foo" },
      { "bar": "baz" }
    ];
    const loggly = createLoggly(); //requires to create new loggly instance for each test
    winston.add(loggly);
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
    winston.remove(loggly);
    spy.mockRestore();
  });
});
