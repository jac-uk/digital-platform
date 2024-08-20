import {
  checkArguments,
  applyUpdates,
  convertStringToSearchParts,
  getEarliestDate,
  getLatestDate,
  removeHtml,
  normaliseNIN,
  normaliseNINs,
  objectHasNestedProperty,
  replaceCharacters,
  formatAddress,
  formatPreviousAddresses,
  isValidDate
} from '../../functions/shared/helpers.js';

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

describe('getEarliestDate()', () => {
  describe('two dates', () => {
    const earlyDate = new Date(2022, 3, 10);
    const laterDate = new Date(2022, 9, 11);
    const arrayOfDates1 = [earlyDate, laterDate ];
    const arrayOfDates2 = [laterDate, earlyDate ];
    it('returns earliest date, no matter what order dates are in the original array', () => {
      expect(getEarliestDate(arrayOfDates1)).toBe(earlyDate);
      expect(getEarliestDate(arrayOfDates2)).toBe(earlyDate);
    });
  });
  describe('three dates', () => {
    const earlyDate = new Date(2022, 3, 10);
    const middleDate = new Date(2022, 5, 4);
    const laterDate = new Date(2022, 9, 11);
    const arrayOfDates1 = [earlyDate, middleDate, laterDate];
    const arrayOfDates2 = [middleDate, laterDate, earlyDate];
    const arrayOfDates3 = [laterDate, earlyDate, middleDate];
    it('returns earliest date, no matter what order dates are in the original array', () => {
      expect(getEarliestDate(arrayOfDates1)).toBe(earlyDate);
      expect(getEarliestDate(arrayOfDates2)).toBe(earlyDate);
      expect(getEarliestDate(arrayOfDates3)).toBe(earlyDate);
    });
  });
  describe('consecutive days', () => {
    const earlyDate = new Date(2022, 3, 1);
    const middleDate = new Date(2022, 3, 2);
    const laterDate = new Date(2022, 3, 3);
    const arrayOfDates1 = [earlyDate, middleDate, laterDate];
    const arrayOfDates2 = [middleDate, laterDate, earlyDate];
    const arrayOfDates3 = [laterDate, earlyDate, middleDate];
    it('returns earliest date, no matter what order dates are in the original array', () => {
      expect(getEarliestDate(arrayOfDates1)).toBe(earlyDate);
      expect(getEarliestDate(arrayOfDates2)).toBe(earlyDate);
      expect(getEarliestDate(arrayOfDates3)).toBe(earlyDate);
    });
  });
  describe('same day, different time', () => {
    const earlyDate = new Date(2022, 3, 1, 10, 30);
    const middleDate = new Date(2022, 3, 1, 10, 31);
    const laterDate = new Date(2022, 3, 1, 11, 0);
    const arrayOfDates1 = [earlyDate, middleDate, laterDate];
    const arrayOfDates2 = [middleDate, laterDate, earlyDate];
    const arrayOfDates3 = [laterDate, earlyDate, middleDate];
    it('returns earliest date, no matter what order dates are in the original array', () => {
      expect(getEarliestDate(arrayOfDates1)).toBe(earlyDate);
      expect(getEarliestDate(arrayOfDates2)).toBe(earlyDate);
      expect(getEarliestDate(arrayOfDates3)).toBe(earlyDate);
    });
  });
});

describe('getLatestDate()', () => {
  describe('two dates', () => {
    const earlyDate = new Date(2022, 3, 10);
    const laterDate = new Date(2022, 9, 11);
    const arrayOfDates1 = [earlyDate, laterDate];
    const arrayOfDates2 = [laterDate, earlyDate];
    it('returns earliest date, no matter what order dates are in the original array', () => {
      expect(getLatestDate(arrayOfDates1)).toBe(laterDate);
      expect(getLatestDate(arrayOfDates2)).toBe(laterDate);
    });
  });
  describe('three dates', () => {
    const earlyDate = new Date(2022, 3, 10);
    const middleDate = new Date(2022, 5, 4);
    const laterDate = new Date(2022, 9, 11);
    const arrayOfDates1 = [earlyDate, middleDate, laterDate];
    const arrayOfDates2 = [middleDate, laterDate, earlyDate];
    const arrayOfDates3 = [laterDate, earlyDate, middleDate];
    it('returns earliest date, no matter what order dates are in the original array', () => {
      expect(getLatestDate(arrayOfDates1)).toBe(laterDate);
      expect(getLatestDate(arrayOfDates2)).toBe(laterDate);
      expect(getLatestDate(arrayOfDates3)).toBe(laterDate);
    });
  });
  describe('consecutive days', () => {
    const earlyDate = new Date(2022, 3, 1);
    const middleDate = new Date(2022, 3, 2);
    const laterDate = new Date(2022, 3, 3);
    const arrayOfDates1 = [earlyDate, middleDate, laterDate];
    const arrayOfDates2 = [middleDate, laterDate, earlyDate];
    const arrayOfDates3 = [laterDate, earlyDate, middleDate];
    it('returns earliest date, no matter what order dates are in the original array', () => {
      expect(getLatestDate(arrayOfDates1)).toBe(laterDate);
      expect(getLatestDate(arrayOfDates2)).toBe(laterDate);
      expect(getLatestDate(arrayOfDates3)).toBe(laterDate);
    });
  });
  describe('same day, different time', () => {
    const earlyDate = new Date(2022, 3, 1, 10, 30);
    const middleDate = new Date(2022, 3, 1, 10, 31);
    const laterDate = new Date(2022, 3, 1, 11, 0);
    const arrayOfDates1 = [earlyDate, middleDate, laterDate];
    const arrayOfDates2 = [middleDate, laterDate, earlyDate];
    const arrayOfDates3 = [laterDate, earlyDate, middleDate];
    it('returns earliest date, no matter what order dates are in the original array', () => {
      expect(getLatestDate(arrayOfDates1)).toBe(laterDate);
      expect(getLatestDate(arrayOfDates2)).toBe(laterDate);
      expect(getLatestDate(arrayOfDates3)).toBe(laterDate);
    });
  });
});

describe('removeHtml', () => {
  it('remove HTML tags from a given string', () => {
    expect(removeHtml('<div>title</div>')).toBe('title');
    expect(removeHtml('<br>1. answer')).toBe('1. answer');
    expect(removeHtml('<br/>1. answer')).toBe('1. answer');
    expect(removeHtml('<br />1. answer')).toBe('1. answer');
  });
});

  //  '	 ',
  //  ' ',                  // 30
  //  'AA 123456       V',  // 0
  //  'TR768534A',          // 12
  //  'BN678987G',          // 47 
  //  'A B  1 2 3 4 5 6 C', // 32
  //  'GG010 203D',         // 0
  //  'QQ 12 34 56 C',      // 44 => 9 normalized
  //  'PP005897 C',         // 1 normalized
  //  'PP 060953 C',        // 2 normalized
  //  'PP024177C',          //1 normalized
  //  'PP024174C',          // 0
  //  'PP-012189C',         // 1 normalized
  //  'PP024177C',          // 1
  //  'PP 060953 C',        // 2 normalized
  
describe('normaliseNIN', () => {
  it('remove HTML tags from a given string', () => {
    expect(normaliseNIN('	 ')).toBe('');
    expect(normaliseNIN(' ')).toBe('');
    expect(normaliseNIN('AA 123456       V')).toBe('aa123456v');
    expect(normaliseNIN('TR768534A')).toBe('tr768534a');
    expect(normaliseNIN('A B  1 2 3 4 5 6 C')).toBe('ab123456c');
    expect(normaliseNIN('GG010 203D')).toBe('gg010203d');
    expect(normaliseNIN('PP005897 C')).toBe('pp005897c');
    expect(normaliseNIN('QQ 12 34 56 C')).toBe('qq123456c');
  });
});

describe('normaliseNINs', () => {
  it('remove HTML tags from a given string', () => {
    expect(normaliseNINs(['AA 123456       V', 'QQ 12 34 56 C'])).toStrictEqual(['aa123456v','qq123456c']);
  });
});

describe('objectHasNestedProperty()', () => {
  describe('empty dotPath arg', () => {
    const obj = {
      test1: {
        test2: 'test3',
      },
      test4: {
        test5: {
          test6: null,
          test7: undefined,
        },
      },
    };
    // FALSY
    it('returns false if no dotPath arg', () => {
      expect(objectHasNestedProperty(obj)).toBe(false);
    });
    it('returns false if empty string dotPath arg', () => {
      expect(objectHasNestedProperty(obj, '')).toBe(false);
    });
    it('returns false if wrong type for dotPath arg', () => {
      expect(objectHasNestedProperty(obj, [])).toBe(false);
    });
    //TRUTHY
    it('returns true if match for depth 1 dotPath arg', () => {
      expect(objectHasNestedProperty(obj, 'test1')).toBe(true);
    });
    it('returns true if match for depth 2 dotPath arg', () => {
      expect(objectHasNestedProperty(obj, 'test1.test2')).toBe(true);
    });

    it('returns true if match for null value at valid path', () => {
      expect(objectHasNestedProperty(obj, 'test4.test5.test6')).toBe(true);
    });
    it('returns true if match for undefined value at valid path', () => {
      expect(objectHasNestedProperty(obj, 'test4.test5.test7')).toBe(true);
    });
  });
});

describe('replaceCharacters()', () => {
  describe('replaces characters according to map', () => {
    const inputStr = 'test-\'&/\\|[].@';
    const characterMap = {
      '[': 'a',
      ']': 'b',
      '.': 'c',
      '@': 'd',
      '*': 'e',
      '/': 'f',
      '\\': 'g',
    };
    it('returns string with replacements', () => {
      expect(replaceCharacters(inputStr, characterMap)).toStrictEqual('test-\'&fg|abcd');
    });
  });
});

describe('formatAddress()', () => {
  it('should return a formatted address string with all fields present', () => {
    const address = {
      street: '123 Main St',
      street2: 'Apt 4B',
      town: 'New York',
      county: 'Manhattan',
      postcode: '10001',
    };
    const result = formatAddress(address);
    expect(result).toBe('123 Main St Apt 4B New York Manhattan 10001');
  });

  it('should return a formatted address string with only required fields present', () => {
    const address = {
      street: '123 Main St',
      town: 'New York',
      postcode: '10001',
    };
    const result = formatAddress(address);
    expect(result).toBe('123 Main St New York 10001');
  });

  it('should return an empty string when no fields are present', () => {
    const address = {};
    const result = formatAddress(address);
    expect(result).toBe('');
  });

  it('should return a formatted address string with only one field present', () => {
    const address = {
      street: '123 Main St',
    };
    const result = formatAddress(address);
    expect(result).toBe('123 Main St');
  });
});

describe('formatPreviousAddresses()', () => {
  it('should return an empty string when given an empty array', () => {
    const previousAddresses = [];
    const result = formatPreviousAddresses(previousAddresses);
    expect(result).toEqual('');
  });

  it('should return a formatted string when given an array with one element', () => {
    const previousAddresses = [
      {
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-02-01'),
        street: '123 Main St',
        town: 'City',
        postcode: '12345',
      },
    ];
    const result = formatPreviousAddresses(previousAddresses);
    expect(result).toEqual('2022-01-01 - 2022-02-01 123 Main St City 12345');
  });

  it('should return a formatted string when given an array with multiple elements', () => {
    const previousAddresses = [
      {
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-02-01'),
        street: '123 Main St',
        town: 'City',
        postcode: '12345',
      },
      {
        startDate: new Date('2022-03-01'),
        endDate: new Date('2022-04-01'),
        street: '456 Elm St',
        town: 'Town',
        postcode: '67890',
      },
    ];
    const result = formatPreviousAddresses(previousAddresses);
    expect(result).toEqual('2022-01-01 - 2022-02-01 123 Main St City 12345\n\n2022-03-01 - 2022-04-01 456 Elm St Town 67890');
  });
});

describe('isValidDate()', () => {
  it('should return true when given a valid date string in ISO format', () => {
    expect(isValidDate('2021-01-01')).toBe(true);
  });

  it('should return false when given a non-string input', () => {
    expect(isValidDate(123)).toBe(false);
  });

  it('should return false when given an empty string input', () => {
    expect(isValidDate('')).toBe(false);
  });
});
