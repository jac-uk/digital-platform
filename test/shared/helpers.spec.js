const { checkArguments, applyUpdates, convertStringToSearchParts } = require('../../functions/shared/helpers');

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
    expect(commitCount).toBe(8);  // commands are executed in batches of 200
  });

});


describe('convertStringToSearchParts()', () => {
  describe('single word', () => {
    const input = 'one';
    const output = ['o', 'on', 'one'];
    it('returns an array of correct length', () => {
      expect(convertStringToSearchParts(input).length).toEqual(output.length);
    });
    it('contains the correct parts of the word (left to right)', () => {
      const returnValue = convertStringToSearchParts(input);
      expect(returnValue).toContain('o');
      expect(returnValue).toContain('on');
      expect(returnValue).toContain('one');
    });
    it('search parts are all lower case', () => {
      expect(convertStringToSearchParts('One')).toContain('o');
      expect(convertStringToSearchParts('One')).not.toContain('O');
    });
  });
  describe('two words', () => {
    const input = 'one two';
    const output = ['o', 'on', 'one', 'one ', 'one t', 'one tw', 'one two', 't', 'tw', 'two'];
    it('returns an array of correct length', () => {
      expect(convertStringToSearchParts(input).length).toEqual(output.length);
    });
    it('contains the correct parts of the first word (left to right)', () => {
      const returnValue = convertStringToSearchParts(input);
      expect(returnValue).toContain('o');
      expect(returnValue).toContain('on');
      expect(returnValue).toContain('one');
    });
    it('contains the correct parts of the second word (left to right)', () => {
      const returnValue = convertStringToSearchParts(input);
      expect(returnValue).toContain('t');
      expect(returnValue).toContain('tw');
      expect(returnValue).toContain('two');
    });
    it('contains the correct parts of the sentence (left to right)', () => {
      const returnValue = convertStringToSearchParts(input);
      expect(returnValue).toContain('one ');
      expect(returnValue).toContain('one t');
      expect(returnValue).toContain('one tw');
      expect(returnValue).toContain('one two');
    });
  });
  describe('three words', () => {
    const input = 'one two three';
    const output = [
      'o', 'on', 'one',
      't', 'tw', 'two',
      't', 'th', 'thr', 'thre', 'three',
      'one ', 'one t', 'one tw', 'one two',
      'two ', 'two t', 'two th', 'two thr', 'two thre', 'two three',
      'one two ', 'one two t', 'one two th', 'one two thr', 'one two thre', 'one two three',
    ];
    it('returns an array of correct length', () => {
      expect(convertStringToSearchParts(input).length).toEqual(output.length);
    });
    it('contains the correct parts of the first word (left to right)', () => {
      const returnValue = convertStringToSearchParts(input);
      expect(returnValue).toContain('o');
      expect(returnValue).toContain('on');
      expect(returnValue).toContain('one');
    });
    it('contains the correct parts of the second word (left to right)', () => {
      const returnValue = convertStringToSearchParts(input);
      expect(returnValue).toContain('t');
      expect(returnValue).toContain('tw');
      expect(returnValue).toContain('two');
    });
    it('contains the correct parts of the third word (left to right)', () => {
      const returnValue = convertStringToSearchParts(input);
      expect(returnValue).toContain('t');
      expect(returnValue).toContain('th');
      expect(returnValue).toContain('thr');
      expect(returnValue).toContain('thre');
      expect(returnValue).toContain('three');
    });
    it('contains the correct parts of the sentence (left to right)', () => {
      const returnValue = convertStringToSearchParts(input);
      expect(returnValue).toContain('one ');
      expect(returnValue).toContain('one t');
      expect(returnValue).toContain('one tw');
      expect(returnValue).toContain('one two');
      expect(returnValue).toContain('one two ');
      expect(returnValue).toContain('one two t');
      expect(returnValue).toContain('one two th');
      expect(returnValue).toContain('one two thr');
      expect(returnValue).toContain('one two thre');
      expect(returnValue).toContain('one two three');
    });
    it('contains the correct parts of the sentence from second word (left to right)', () => {
      const returnValue = convertStringToSearchParts(input);
      expect(returnValue).toContain('two ');
      expect(returnValue).toContain('two t');
      expect(returnValue).toContain('two th');
      expect(returnValue).toContain('two thr');
      expect(returnValue).toContain('two thre');
      expect(returnValue).toContain('two three');
    });
  });
  describe('ten words', () => {
    const input = '0 1 2 3 4 5 6 7 8 9';
    const output = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '0 ', '1 ', '2 ', '3 ', '4 ', '5 ', '6 ', '7 ', '8 ',
      '0 1',
      '0 1 ',
      '0 1 2', '1 2',
      '0 1 2 ', '1 2 ',
      '0 1 2 3', '1 2 3', '2 3',
      '0 1 2 3 ', '1 2 3 ', '2 3 ',
      '0 1 2 3 4', '1 2 3 4', '2 3 4', '3 4',
      '0 1 2 3 4 ', '1 2 3 4 ', '2 3 4 ', '3 4 ',
      '0 1 2 3 4 5', '1 2 3 4 5', '2 3 4 5', '3 4 5', '4 5',
      '0 1 2 3 4 5 ', '1 2 3 4 5 ', '2 3 4 5 ', '3 4 5 ', '4 5 ',
      '0 1 2 3 4 5 6', '1 2 3 4 5 6', '2 3 4 5 6', '3 4 5 6', '4 5 6', '5 6',
      '0 1 2 3 4 5 6 ', '1 2 3 4 5 6 ', '2 3 4 5 6 ', '3 4 5 6 ', '4 5 6 ', '5 6 ',
      '0 1 2 3 4 5 6 7', '1 2 3 4 5 6 7', '2 3 4 5 6 7', '3 4 5 6 7', '4 5 6 7', '5 6 7', '6 7',
      '0 1 2 3 4 5 6 7 ', '1 2 3 4 5 6 7 ', '2 3 4 5 6 7 ', '3 4 5 6 7 ', '4 5 6 7 ', '5 6 7 ', '6 7 ',
      '0 1 2 3 4 5 6 7 8', '1 2 3 4 5 6 7 8', '2 3 4 5 6 7 8', '3 4 5 6 7 8', '4 5 6 7 8', '5 6 7 8', '6 7 8', '7 8',
      '0 1 2 3 4 5 6 7 8 ', '1 2 3 4 5 6 7 8 ', '2 3 4 5 6 7 8 ', '3 4 5 6 7 8 ', '4 5 6 7 8 ', '5 6 7 8 ', '6 7 8 ', '7 8 ',
      '0 1 2 3 4 5 6 7 8 9', '1 2 3 4 5 6 7 8 9', '2 3 4 5 6 7 8 9', '3 4 5 6 7 8 9', '4 5 6 7 8 9', '5 6 7 8 9', '6 7 8 9', '7 8 9', '8 9',
    ];
    it('returns an array of correct length', () => {
      expect(convertStringToSearchParts(input).length).toEqual(output.length);
    });
    it('contains the correct parts of the sentence (left to right)', () => {
      const returnValue = convertStringToSearchParts(input);
      output.forEach(item => {
        expect(returnValue).toContain(item);
      });
    });
  });
  describe('email address', () => {
    const input = 'email@domain.com';
    const output = [
      'e', 'em', 'ema', 'emai', 'email',
      'd', 'do', 'dom', 'doma', 'domai', 'domain', 'domain.', 'domain.c', 'domain.co', 'domain.com',
      'email@', 'email@d', 'email@do', 'email@dom', 'email@doma', 'email@domai', 'email@domain', 'email@domain.', 'email@domain.c', 'email@domain.co', 'email@domain.com',
    ];
    it('returns an array of correct length', () => {
      expect(convertStringToSearchParts(input, '@').length).toEqual(output.length);
    });
    it('contains the correct parts of the email (left to right)', () => {
      const returnValue = convertStringToSearchParts(input, '@');
      output.forEach(item => {
        expect(returnValue).toContain(item);
      });
    });
  });

});
