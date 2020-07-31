const { checkArguments, applyUpdates } = require('../../functions/shared/helpers');

describe('checkArguments()', () => {

  it('returns true when required parameter provided', async () => {
    const definitions = {
      items: { required: true },
    };
    const data = {
      items: [ 'item1' ],
    };
    const result = checkArguments(definitions, data);
    expect(result).toBe(true);
  });

  it('returns false when required parameter not provided', async () => {
    const definitions = {
      items: { required: true },
    };
    const data = {
    };
    const result = checkArguments(definitions, data);
    expect(result).toBe(false);
  });

  it('returns false when required parameter provided as empty string', async () => {
    const definitions = {
      items: { required: true },
    };
    const data = {
      items: '',
    };
    const result = checkArguments(definitions, data);
    expect(result).toBe(false);
  });

  it('returns false when required parameter provided as empty array', async () => {
    const definitions = {
      items: { required: true },
    };
    const data = {
      items: [],
    };
    const result = checkArguments(definitions, data);
    expect(result).toBe(false);
  });

  it('returns true when all arguments are known', async () => {
    const definition = {
      att1: { required: false },
      att2: { required: false },
      att3: { required: false },
    };
    const data = {
      att1: 'value',
    };
    const result = checkArguments(definition, data);
    expect(result).toBe(true);
  });

  it('returns false when an un-known argument is used', async () => {
    const definition = {
      att1: { required: false },
      att2: { required: false },
      att3: { required: false },
    };
    const data = {
      att1: 'value',
      bob: 'value',
    };
    const result = checkArguments(definition, data);
    expect(result).toBe(false);
  });

  it('returns false when one or more required arguments are missing', async () => {
    const definition = {
      att1: { required: true },
      att2: { required: true },
      att3: { required: false },
    };
    const data = {
      att1: 'value',
    };
    const result = checkArguments(definition, data);
    expect(result).toBe(false);
  });

  it('returns false when one or more required arguments has no value', async () => {
    const definition = {
      att1: { required: true },
      att2: { required: true },
      att3: { required: false },
    };
    const data = {
      att1: 'value',
      att2: '',
    };
    const result = checkArguments(definition, data);
    expect(result).toBe(false);
  });

  it('returns true when all required arguments are provided', async () => {
    const definition = {
      att1: { required: true },
      att2: { required: true },
      att3: { required: false },
    };
    const data = {
      att1: 'value',
      att2: 'value',
    };
    const result = checkArguments(definition, data);
    expect(result).toBe(true);
  });


});


describe('applyUpdates()', () => {
  let commandCount = 0;
  let commitCount = 0;
  let mockDb;

  beforeEach(() => {
    commandCount = 0;
    commitCount = 0;
    mockDb = {
      batch: () => {
        return {
          set: () => { commandCount++; },
          update: () => { commandCount++; },
          delete: () => { commandCount++; },
          commit: async () => {
            commitCount++;
            return commandCount;
          },
        };
      },
    };
  });

  it('successfully executes a small number of commands (in one batch)', async () => {
    const NUMBER_OF_COMMANDS = 10;
    const commands = [];
    for (let i = 0, len = NUMBER_OF_COMMANDS; i < len; ++i) {
      commands.push({
        command: 'set',
        ref: 'ref ' + i,
        data: 'data ' + i,
      });
    }
    const result = await applyUpdates(mockDb, commands);
    expect(result).toBe(NUMBER_OF_COMMANDS);
    expect(commandCount).toBe(NUMBER_OF_COMMANDS);
    expect(commitCount).toBe(1);
  });

  it('successfully executes a large number of commands (in multiple batches)', async () => {
    const NUMBER_OF_COMMANDS = 1567;
    const commands = [];
    for (let i = 0, len = NUMBER_OF_COMMANDS; i < len; ++i) {
      commands.push({
        command: 'set',
        ref: 'ref ' + i,
        data: 'data ' + i,
      });
    }
    const result = await applyUpdates(mockDb, commands);
    expect(result).toBe(NUMBER_OF_COMMANDS);
    expect(commandCount).toBe(NUMBER_OF_COMMANDS);
    expect(commitCount).toBe(4);  // commands are executed in batches of 500
  });

});
