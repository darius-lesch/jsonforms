/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import test from 'ava';
import {
  AndCondition,
  ControlElement,
  createAjv,
  getRules,
  hasEnableRule,
  hasReadonlyRule,
  hasShowRule,
  isEnabled,
  isInherentlyEnabled,
  isInherentlyReadonly,
  isReadonly,
  isVisible,
  JsonFormsCore,
  LeafCondition,
  OrCondition,
  Rule,
  RuleEffect,
  SchemaBasedCondition,
  ValidateFunctionCondition,
  ValidateFunctionContext,
} from '../../src';
import {
  evalEnablement,
  evalReadonly,
  evalVisibility,
} from '../../src/util/runtime';

test('evalVisibility show valid case', (t) => {
  const leafCondition: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue',
    expectedValue: 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.SHOW,
      condition: leafCondition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };
  t.is(evalVisibility(uischema, data, undefined, createAjv(), undefined), true);
});

test('evalVisibility show valid case based on AndCondition', (t) => {
  const leafCondition1: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue1',
    expectedValue: 'bar',
  };
  const leafCondition2: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue2',
    expectedValue: 'foo',
  };
  const condition: AndCondition = {
    type: 'AND',
    conditions: [leafCondition1, leafCondition2],
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.SHOW,
      condition: condition,
    },
  };
  const data = {
    value: 'hello',
    ruleValue1: 'bar',
    ruleValue2: 'foo',
  };
  t.is(evalVisibility(uischema, data, undefined, createAjv(), undefined), true);
});

test('evalVisibility show invalid case based on AndCondition', (t) => {
  const leafCondition1: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue1',
    expectedValue: 'bar',
  };
  const leafCondition2: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue2',
    expectedValue: 'bar',
  };
  const condition: AndCondition = {
    type: 'AND',
    conditions: [leafCondition1, leafCondition2],
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.SHOW,
      condition: condition,
    },
  };
  const data = {
    value: 'hello',
    ruleValue1: 'bar',
    ruleValue2: 'foo',
  };
  t.is(
    evalVisibility(uischema, data, undefined, createAjv(), undefined),
    false
  );
});

test('evalVisibility show valid case based on OrCondition', (t) => {
  const leafCondition1: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue1',
    expectedValue: 'bar',
  };
  const leafCondition2: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue2',
    expectedValue: 'foo',
  };
  const condition: OrCondition = {
    type: 'OR',
    conditions: [leafCondition1, leafCondition2],
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.SHOW,
      condition: condition,
    },
  };
  const data = {
    value: 'hello',
    ruleValue1: 'bar1',
    ruleValue2: 'foo',
  };
  t.is(evalVisibility(uischema, data, undefined, createAjv(), undefined), true);
});

test('evalVisibility show invalid case based on OrCondition', (t) => {
  const leafCondition1: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue1',
    expectedValue: 'foo',
  };
  const leafCondition2: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue2',
    expectedValue: 'bar',
  };
  const condition: OrCondition = {
    type: 'OR',
    conditions: [leafCondition1, leafCondition2],
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.SHOW,
      condition: condition,
    },
  };
  const data = {
    value: 'hello',
    ruleValue1: 'bar',
    ruleValue2: 'foo',
  };
  t.is(
    evalVisibility(uischema, data, undefined, createAjv(), undefined),
    false
  );
});

test('evalVisibility show valid case based on schema condition', (t) => {
  const condition: SchemaBasedCondition = {
    scope: '#/properties/ruleValue',
    schema: {
      const: 'bar',
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.SHOW,
      condition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };
  t.is(evalVisibility(uischema, data, undefined, createAjv(), undefined), true);
});

test('evalVisibility show valid case based on schema condition and enum', (t) => {
  const condition: SchemaBasedCondition = {
    scope: '#/properties/ruleValue',
    schema: {
      enum: ['bar', 'baz'],
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.SHOW,
      condition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };
  t.is(evalVisibility(uischema, data, undefined, createAjv(), undefined), true);
  t.is(
    evalVisibility(
      uischema,
      { ...data, ruleValue: 'baz' },
      undefined,
      createAjv(),
      undefined
    ),
    true
  );
  t.is(
    evalVisibility(
      uischema,
      { ...data, ruleValue: 'foo' },
      undefined,
      createAjv(),
      undefined
    ),
    false
  );
});

test('evalVisibility show invalid case', (t) => {
  const leafCondition: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue',
    expectedValue: 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.SHOW,
      condition: leafCondition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'foobar',
  };
  t.deepEqual(
    evalVisibility(uischema, data, undefined, createAjv(), undefined),
    false
  );
});
test('evalVisibility hide valid case', (t) => {
  const leafCondition: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue',
    expectedValue: 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.HIDE,
      condition: leafCondition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };
  t.is(
    evalVisibility(uischema, data, undefined, createAjv(), undefined),
    false
  );
});

test('evalVisibility hide invalid case', (t) => {
  const leafCondition: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue',
    expectedValue: 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.HIDE,
      condition: leafCondition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'foobar',
  };
  t.is(evalVisibility(uischema, data, undefined, createAjv(), undefined), true);
});

test('evalEnablement enable valid case', (t) => {
  const leafCondition: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue',
    expectedValue: 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.ENABLE,
      condition: leafCondition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };
  t.is(evalEnablement(uischema, data, undefined, createAjv(), undefined), true);
});

test('evalEnablement show valid case based on AndCondition', (t) => {
  const leafCondition1: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue1',
    expectedValue: 'bar',
  };
  const leafCondition2: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue2',
    expectedValue: 'foo',
  };
  const condition: AndCondition = {
    type: 'AND',
    conditions: [leafCondition1, leafCondition2],
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.ENABLE,
      condition: condition,
    },
  };
  const data = {
    value: 'hello',
    ruleValue1: 'bar',
    ruleValue2: 'foo',
  };
  t.is(evalEnablement(uischema, data, undefined, createAjv(), undefined), true);
});

test('evalEnablement show invalid case based on AndCondition', (t) => {
  const leafCondition1: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue1',
    expectedValue: 'bar',
  };
  const leafCondition2: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue2',
    expectedValue: 'bar',
  };
  const condition: AndCondition = {
    type: 'AND',
    conditions: [leafCondition1, leafCondition2],
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.ENABLE,
      condition: condition,
    },
  };
  const data = {
    value: 'hello',
    ruleValue1: 'bar',
    ruleValue2: 'foo',
  };
  t.is(
    evalEnablement(uischema, data, undefined, createAjv(), undefined),
    false
  );
});

test('evalEnablement show valid case based on OrCondition', (t) => {
  const leafCondition1: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue1',
    expectedValue: 'bar',
  };
  const leafCondition2: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue2',
    expectedValue: 'foo',
  };
  const condition: OrCondition = {
    type: 'OR',
    conditions: [leafCondition1, leafCondition2],
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.ENABLE,
      condition: condition,
    },
  };
  const data = {
    value: 'hello',
    ruleValue1: 'bar1',
    ruleValue2: 'foo',
  };
  t.is(evalEnablement(uischema, data, undefined, createAjv(), undefined), true);
});

test('evalEnablement show invalid case based on OrCondition', (t) => {
  const leafCondition1: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue1',
    expectedValue: 'foo',
  };
  const leafCondition2: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue2',
    expectedValue: 'bar',
  };
  const condition: OrCondition = {
    type: 'OR',
    conditions: [leafCondition1, leafCondition2],
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.ENABLE,
      condition: condition,
    },
  };
  const data = {
    value: 'hello',
    ruleValue1: 'bar',
    ruleValue2: 'foo',
  };
  t.is(
    evalEnablement(uischema, data, undefined, createAjv(), undefined),
    false
  );
});

test('evalEnablement enable invalid case', (t) => {
  const leafCondition: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue',
    expectedValue: 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.ENABLE,
      condition: leafCondition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'foobar',
  };
  t.is(
    evalEnablement(uischema, data, undefined, createAjv(), undefined),
    false
  );
});
test('evalEnablement disable valid case', (t) => {
  const leafCondition: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue',
    expectedValue: 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.DISABLE,
      condition: leafCondition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };
  t.is(
    evalEnablement(uischema, data, undefined, createAjv(), undefined),
    false
  );
});

// Add test case for ValidateFunctionCondition with evalEnablement (valid enable case)
test('evalEnablement enable valid case based on ValidateFunctionCondition', (t) => {
  const condition: ValidateFunctionCondition = {
    scope: '#/properties/ruleValue',
    validate: (context: ValidateFunctionContext) => context.data === 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.ENABLE,
      condition: condition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };
  t.is(evalEnablement(uischema, data, undefined, createAjv(), undefined), true);
});

// Add test case for ValidateFunctionCondition with evalEnablement (invalid enable case)
test('evalEnablement enable invalid case based on ValidateFunctionCondition', (t) => {
  const condition: ValidateFunctionCondition = {
    scope: '#/properties/ruleValue',
    validate: (context: ValidateFunctionContext) => context.data === 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.ENABLE,
      condition: condition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'foobar',
  };
  t.is(
    evalEnablement(uischema, data, undefined, createAjv(), undefined),
    false
  );
});

// Add test case for ValidateFunctionCondition with evalEnablement (valid disable case)
test('evalEnablement disable valid case based on ValidateFunctionCondition', (t) => {
  const condition: ValidateFunctionCondition = {
    scope: '#/properties/ruleValue',
    validate: (context: ValidateFunctionContext) => context.data === 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.DISABLE,
      condition: condition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };
  t.is(
    evalEnablement(uischema, data, undefined, createAjv(), undefined),
    false
  );
});

// Add test case for ValidateFunctionCondition with evalEnablement (invalid disable case)
test('evalEnablement disable invalid case based on ValidateFunctionCondition', (t) => {
  const condition: ValidateFunctionCondition = {
    scope: '#/properties/ruleValue',
    validate: (context: ValidateFunctionContext) => context.data === 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.DISABLE,
      condition: condition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'foobar',
  };
  t.is(evalEnablement(uischema, data, undefined, createAjv(), undefined), true);
});

// Test context properties for ValidateFunctionCondition
test('ValidateFunctionCondition correctly passes context parameters', (t) => {
  const condition: ValidateFunctionCondition = {
    scope: '#/properties/ruleValue',
    validate: (context: ValidateFunctionContext) => {
      // Verify all context properties are passed correctly
      return (
        context.data === 'bar' &&
        (context.fullData as any).value === 'foo' &&
        context.path === undefined &&
        (context.uischemaElement as any).scope === '#/properties/value' &&
        typeof (context.config as any).externalValidator === 'function'
      );
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.ENABLE,
      condition: condition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };
  const config = {
    externalValidator: (_context: ValidateFunctionContext): boolean => {
      return true;
    },
  };
  t.is(evalEnablement(uischema, data, undefined, createAjv(), config), true);
});

test('evalEnablement disable invalid case', (t) => {
  const leafCondition: LeafCondition = {
    type: 'LEAF',
    scope: '#/properties/ruleValue',
    expectedValue: 'bar',
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.DISABLE,
      condition: leafCondition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'foobar',
  };
  t.is(evalEnablement(uischema, data, undefined, createAjv(), undefined), true);
});

test('evalEnablement disable invalid case based on schema condition', (t) => {
  const condition: SchemaBasedCondition = {
    scope: '#/properties/ruleValue',
    schema: {
      enum: ['bar', 'baz'],
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.DISABLE,
      condition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };
  t.is(
    evalEnablement(uischema, data, undefined, createAjv(), undefined),
    false
  );
  t.is(
    evalEnablement(
      uischema,
      { ...data, ruleValue: 'baz' },
      undefined,
      createAjv(),
      undefined
    ),
    false
  );
  t.is(
    evalEnablement(
      uischema,
      { ...data, ruleValue: 'foo' },
      undefined,
      createAjv(),
      undefined
    ),
    true
  );
});

test('evalEnablement fail on failWhenUndefined', (t) => {
  const condition: SchemaBasedCondition = {
    scope: '#/properties/ruleValue',
    schema: {
      enum: ['bar', 'baz'],
    },
  };
  const failConditionTrue: SchemaBasedCondition = {
    ...condition,
    failWhenUndefined: true,
  };
  const failConditionFalse: SchemaBasedCondition = {
    ...condition,
    failWhenUndefined: false,
  };

  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.DISABLE,
      condition: failConditionTrue,
    },
  };
  const failConditionTrueUischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.DISABLE,
      condition: failConditionTrue,
    },
  };
  const failConditionFalseUischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.DISABLE,
      condition: failConditionFalse,
    },
  };
  const data = {
    value: 'foo',
  };
  t.is(
    evalEnablement(
      failConditionTrueUischema,
      data,
      undefined,
      createAjv(),
      undefined
    ),
    true
  );
  t.is(
    evalEnablement(
      failConditionFalseUischema,
      data,
      undefined,
      createAjv(),
      undefined
    ),
    evalEnablement(uischema, data, undefined, createAjv(), undefined)
  );
});

test('evalReadonly readonly valid case', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.READONLY,
      condition: {
        type: 'LEAF',
        scope: '#/properties/ruleValue',
        expectedValue: 'bar',
      },
    },
  };

  t.true(
    evalReadonly(
      uischema,
      { value: 'foo', ruleValue: 'bar' },
      undefined,
      createAjv(),
      undefined
    )
  );
});

test('evalReadonly writable valid and invalid cases', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.WRITABLE,
      condition: {
        type: 'LEAF',
        scope: '#/properties/ruleValue',
        expectedValue: 'bar',
      },
    },
  };

  t.false(
    evalReadonly(
      uischema,
      { value: 'foo', ruleValue: 'bar' },
      undefined,
      createAjv(),
      undefined
    )
  );
  t.true(
    evalReadonly(
      uischema,
      { value: 'foo', ruleValue: 'baz' },
      undefined,
      createAjv(),
      undefined
    )
  );
});

test('hasReadonlyRule detects readonly and writable rules', (t) => {
  t.true(
    hasReadonlyRule({
      type: 'Control',
      scope: '#/properties/value',
      rule: {
        effect: RuleEffect.READONLY,
        condition: {
          type: 'LEAF',
          scope: '#/properties/ruleValue',
          expectedValue: 'bar',
        },
      },
    })
  );
  t.true(
    hasReadonlyRule({
      type: 'Control',
      scope: '#/properties/value',
      rule: {
        effect: RuleEffect.WRITABLE,
        condition: {
          type: 'LEAF',
          scope: '#/properties/ruleValue',
          expectedValue: 'bar',
        },
      },
    })
  );
  t.false(
    hasReadonlyRule({
      type: 'Control',
      scope: '#/properties/value',
      rule: {
        effect: RuleEffect.ENABLE,
        condition: {
          type: 'LEAF',
          scope: '#/properties/ruleValue',
          expectedValue: 'bar',
        },
      },
    })
  );
});

test('isReadonly defaults to false without rule', (t) => {
  t.false(
    isReadonly(
      {
        type: 'Control',
        scope: '#/properties/value',
      },
      {},
      undefined,
      createAjv(),
      undefined
    )
  );
});

test('isReadonly evaluates readonly rules', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.READONLY,
      condition: {
        type: 'LEAF',
        scope: '#/properties/ruleValue',
        expectedValue: 'bar',
      },
    },
  };

  t.true(
    isReadonly(
      uischema,
      { value: 'foo', ruleValue: 'bar' },
      undefined,
      createAjv(),
      undefined
    )
  );
});

test('isInherentlyEnabled disabled globally in legacy mode', (t) => {
  t.false(
    isInherentlyEnabled(
      { jsonforms: { readonly: true } },
      null,
      null as any,
      undefined,
      null,
      { separateReadonlyFromDisabled: false }
    )
  );
});

test('isInherentlyEnabled ignores global readonly by default', (t) => {
  t.true(
    isInherentlyEnabled(
      { jsonforms: { readonly: true } },
      null,
      null as any,
      undefined,
      null,
      null
    )
  );
});

test('isInherentlyEnabled disabled by ownProps', (t) => {
  t.false(
    isInherentlyEnabled(
      null as any,
      { enabled: false },
      null as any,
      undefined,
      null,
      null
    )
  );
});

test('isInherentlyEnabled enabled by ownProps', (t) => {
  t.true(
    isInherentlyEnabled(
      null as any,
      { enabled: true },
      null as any,
      undefined,
      null,
      null
    )
  );
});

test('isInherentlyEnabled disabled by uischema in legacy mode', (t) => {
  t.false(
    isInherentlyEnabled(
      null as any,
      null,
      { options: { readonly: true } } as unknown as ControlElement,
      undefined,
      null,
      { separateReadonlyFromDisabled: false }
    )
  );
});

test('isInherentlyEnabled ignores readonly uischema by default', (t) => {
  t.true(
    isInherentlyEnabled(
      null as any,
      null,
      { options: { readonly: true } } as unknown as ControlElement,
      undefined,
      null,
      null
    )
  );
});

test('isInherentlyEnabled disabled by uischema over ownProps in legacy mode', (t) => {
  t.false(
    isInherentlyEnabled(
      null as any,
      { enabled: true },
      { options: { readonly: true } } as unknown as ControlElement,
      undefined,
      null,
      { separateReadonlyFromDisabled: false }
    )
  );
});

test('isInherentlyEnabled enabled by uischema over schema in legacy mode', (t) => {
  t.true(
    isInherentlyEnabled(
      null as any,
      null,
      { options: { readonly: false } } as unknown as ControlElement,
      { readOnly: true },
      null,
      { separateReadonlyFromDisabled: false }
    )
  );
});

test('isInherentlyEnabled disabled by ownProps over schema enablement', (t) => {
  t.false(
    isInherentlyEnabled(
      null as any,
      { enabled: false },
      null as any,
      { readOnly: false },
      null,
      null
    )
  );
});

test('isInherentlyEnabled disabled by uischema over schema in legacy mode', (t) => {
  t.false(
    isInherentlyEnabled(
      null as any,
      null,
      { options: { readonly: true } } as unknown as ControlElement,
      { readOnly: false },
      null,
      { separateReadonlyFromDisabled: false }
    )
  );
});

test('isInherentlyEnabled disabled by schema in legacy mode', (t) => {
  t.false(
    isInherentlyEnabled(
      null as any,
      null,
      null as any,
      { readOnly: true },
      null,
      { separateReadonlyFromDisabled: false }
    )
  );
});

test('isInherentlyEnabled ignores readonly schema by default', (t) => {
  t.true(
    isInherentlyEnabled(
      null as any,
      null,
      null as any,
      { readOnly: true },
      null,
      null
    )
  );
});

test('isInherentlyEnabled disabled by schema over ownProps in legacy mode', (t) => {
  t.false(
    isInherentlyEnabled(
      null as any,
      { enabled: true },
      null as any,
      { readOnly: true },
      null,
      { separateReadonlyFromDisabled: false }
    )
  );
});

test('isInherentlyEnabled disabled by rule', (t) => {
  const leafCondition: SchemaBasedCondition = {
    scope: '#/properties/ruleValue',
    schema: { type: 'string', pattern: 'bar' },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.DISABLE,
      condition: leafCondition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };

  t.false(
    isInherentlyEnabled(
      { jsonforms: { core: { ajv: createAjv() } as JsonFormsCore } },
      null,
      uischema,
      undefined,
      data,
      null
    )
  );
});

test('isInherentlyEnabled disabled by global over rule in legacy mode', (t) => {
  const leafCondition: SchemaBasedCondition = {
    scope: '#/properties/ruleValue',
    schema: { type: 'string', pattern: 'bar' },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.ENABLE,
      condition: leafCondition,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };

  t.false(
    isInherentlyEnabled(
      {
        jsonforms: {
          readonly: true,
          core: { ajv: createAjv() } as JsonFormsCore,
        },
      },
      null,
      uischema,
      undefined,
      data,
      { separateReadonlyFromDisabled: false }
    )
  );
});

test('isInherentlyEnabled disabled by config in legacy mode', (t) => {
  t.false(
    isInherentlyEnabled(null as any, null, null as any, undefined, null, {
      readonly: true,
      separateReadonlyFromDisabled: false,
    })
  );
});

test('isInherentlyEnabled ignores readonly config by default', (t) => {
  t.true(
    isInherentlyEnabled(null as any, null, null as any, undefined, null, {
      readonly: true,
    })
  );
});

test('isInherentlyEnabled enabled by config over ownProps in legacy mode', (t) => {
  t.true(
    isInherentlyEnabled(
      null as any,
      { enabled: false },
      null as any,
      undefined,
      null,
      {
        readonly: false,
        separateReadonlyFromDisabled: false,
      }
    )
  );
});

test('isInherentlyEnabled enabled by uischema over config in legacy mode', (t) => {
  t.true(
    isInherentlyEnabled(
      null as any,
      null,
      { options: { readonly: false } } as unknown as ControlElement,
      undefined,
      null,
      { readonly: true, separateReadonlyFromDisabled: false }
    )
  );
});

test('isInherentlyEnabled prefer readonly over readOnly in legacy mode', (t) => {
  t.true(
    isInherentlyEnabled(
      null as any,
      null,
      {
        options: { readonly: false, readOnly: true },
      } as unknown as ControlElement,
      undefined,
      null,
      { separateReadonlyFromDisabled: false }
    )
  );
  t.false(
    isInherentlyEnabled(
      null as any,
      null,
      {
        options: { readonly: true, readOnly: false },
      } as unknown as ControlElement,
      undefined,
      null,
      { separateReadonlyFromDisabled: false }
    )
  );
});

test('isInherentlyEnabled enabled', (t) => {
  t.true(
    isInherentlyEnabled(null as any, null, null as any, undefined, null, null)
  );
});

test('isInherentlyReadonly readonly globally', (t) => {
  t.true(
    isInherentlyReadonly(
      { jsonforms: { readonly: true } },
      null,
      null as any,
      undefined,
      null,
      null
    )
  );
});

test('isInherentlyReadonly readonly by uischema option', (t) => {
  t.true(
    isInherentlyReadonly(
      null as any,
      { readonly: false },
      { options: { readonly: true } } as unknown as ControlElement,
      undefined,
      null,
      null
    )
  );
});

test('isInherentlyReadonly prefer readonly over readOnly', (t) => {
  t.false(
    isInherentlyReadonly(
      null as any,
      null,
      {
        options: { readonly: false, readOnly: true },
      } as unknown as ControlElement,
      undefined,
      null,
      null
    )
  );
  t.true(
    isInherentlyReadonly(
      null as any,
      null,
      {
        options: { readonly: true, readOnly: false },
      } as unknown as ControlElement,
      undefined,
      null,
      null
    )
  );
});

test('isInherentlyReadonly readonly by schema', (t) => {
  t.true(
    isInherentlyReadonly(
      null as any,
      null,
      null as any,
      { readOnly: true },
      null,
      null
    )
  );
});

test('isInherentlyReadonly readonly by ownProps', (t) => {
  t.true(
    isInherentlyReadonly(
      null as any,
      { readonly: true },
      null as any,
      undefined,
      null,
      null
    )
  );
});

test('isInherentlyReadonly evaluates readonly and writable rules', (t) => {
  const readonlyRule: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.READONLY,
      condition: {
        type: 'LEAF',
        scope: '#/properties/ruleValue',
        expectedValue: 'bar',
      },
    },
  };
  const writableRule: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rule: {
      effect: RuleEffect.WRITABLE,
      condition: {
        type: 'LEAF',
        scope: '#/properties/ruleValue',
        expectedValue: 'bar',
      },
    },
  };
  const state = {
    jsonforms: {
      core: { ajv: createAjv() } as JsonFormsCore,
    },
  };
  const data = {
    value: 'foo',
    ruleValue: 'bar',
  };

  t.true(
    isInherentlyReadonly(state, null, readonlyRule, undefined, data, null)
  );
  t.false(
    isInherentlyReadonly(state, null, writableRule, undefined, data, null)
  );
  t.true(
    isInherentlyReadonly(
      state,
      null,
      writableRule,
      undefined,
      { ...data, ruleValue: 'baz' },
      null
    )
  );
});

test('getRules normalizes rule and rules', (t) => {
  t.deepEqual(getRules(null as any), []);
  t.deepEqual(getRules({} as any), []);

  const rule1: Rule = {
    effect: RuleEffect.HIDE,
    condition: { type: 'LEAF', scope: '#/properties/a', expectedValue: 1 },
  };
  const rule2: Rule = {
    effect: RuleEffect.DISABLE,
    condition: { type: 'LEAF', scope: '#/properties/b', expectedValue: 2 },
  };

  t.deepEqual(getRules({ type: 'Control', rule: rule1 } as any), [rule1]);
  t.deepEqual(getRules({ type: 'Control', rules: [rule1, rule2] } as any), [
    rule1,
    rule2,
  ]);
  t.deepEqual(
    getRules({ type: 'Control', rule: rule1, rules: [rule2] } as any),
    [rule1, rule2]
  );
});

test('multi-rule visibility Restrictive Override matrix', (t) => {
  const showRule: Rule = {
    effect: RuleEffect.SHOW,
    condition: { type: 'LEAF', scope: '#/properties/show', expectedValue: true },
  };
  const hideRule: Rule = {
    effect: RuleEffect.HIDE,
    condition: { type: 'LEAF', scope: '#/properties/hide', expectedValue: true },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rules: [showRule, hideRule],
  };

  // Both fulfilled: SHOW wants visible, HIDE wants hidden -> restrictive HIDE wins
  t.false(
    evalVisibility(
      uischema,
      { show: true, hide: true },
      undefined,
      createAjv(),
      undefined
    )
  );

  // SHOW fulfilled, HIDE unfulfilled: both want visible -> visible
  t.true(
    evalVisibility(
      uischema,
      { show: true, hide: false },
      undefined,
      createAjv(),
      undefined
    )
  );

  // SHOW unfulfilled, HIDE unfulfilled: SHOW wants hidden, HIDE neutral -> restrictive HIDE wins
  t.false(
    evalVisibility(
      uischema,
      { show: false, hide: false },
      undefined,
      createAjv(),
      undefined
    )
  );

  // SHOW unfulfilled, HIDE fulfilled: both want hidden -> hidden
  t.false(
    evalVisibility(
      uischema,
      { show: false, hide: true },
      undefined,
      createAjv(),
      undefined
    )
  );
});

test('multi-rule enablement Restrictive Override matrix', (t) => {
  const enableRule: Rule = {
    effect: RuleEffect.ENABLE,
    condition: {
      type: 'LEAF',
      scope: '#/properties/enable',
      expectedValue: true,
    },
  };
  const disableRule: Rule = {
    effect: RuleEffect.DISABLE,
    condition: {
      type: 'LEAF',
      scope: '#/properties/disable',
      expectedValue: true,
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rules: [enableRule, disableRule],
  };

  // Both fulfilled: ENABLE wants enabled, DISABLE wants disabled -> restrictive DISABLE wins
  t.false(
    evalEnablement(
      uischema,
      { enable: true, disable: true },
      undefined,
      createAjv(),
      undefined
    )
  );

  // ENABLE fulfilled, DISABLE unfulfilled: both want enabled -> enabled
  t.true(
    evalEnablement(
      uischema,
      { enable: true, disable: false },
      undefined,
      createAjv(),
      undefined
    )
  );

  // ENABLE unfulfilled, DISABLE unfulfilled: ENABLE wants disabled -> restrictive DISABLE wins
  t.false(
    evalEnablement(
      uischema,
      { enable: false, disable: false },
      undefined,
      createAjv(),
      undefined
    )
  );

  // ENABLE unfulfilled, DISABLE fulfilled: both want disabled -> disabled
  t.false(
    evalEnablement(
      uischema,
      { enable: false, disable: true },
      undefined,
      createAjv(),
      undefined
    )
  );
});

test('multi-rule readonly Restrictive Override matrix', (t) => {
  const readonlyRule: Rule = {
    effect: RuleEffect.READONLY,
    condition: {
      type: 'LEAF',
      scope: '#/properties/readonly',
      expectedValue: true,
    },
  };
  const writableRule: Rule = {
    effect: RuleEffect.WRITABLE,
    condition: {
      type: 'LEAF',
      scope: '#/properties/writable',
      expectedValue: true,
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rules: [readonlyRule, writableRule],
  };

  // Both fulfilled: READONLY wants readonly, WRITABLE wants writable -> restrictive READONLY wins
  t.true(
    evalReadonly(
      uischema,
      { readonly: true, writable: true },
      undefined,
      createAjv(),
      undefined
    )
  );

  // READONLY unfulfilled, WRITABLE fulfilled: both want writable -> writable (false)
  t.false(
    evalReadonly(
      uischema,
      { readonly: false, writable: true },
      undefined,
      createAjv(),
      undefined
    )
  );

  // READONLY unfulfilled, WRITABLE unfulfilled: WRITABLE wants readonly -> restrictive READONLY wins
  t.true(
    evalReadonly(
      uischema,
      { readonly: false, writable: false },
      undefined,
      createAjv(),
      undefined
    )
  );

  // READONLY fulfilled, WRITABLE unfulfilled: both want readonly -> readonly (true)
  t.true(
    evalReadonly(
      uischema,
      { readonly: true, writable: false },
      undefined,
      createAjv(),
      undefined
    )
  );
});

test('overlapping dynamic states across different domains', (t) => {
  const disableRule: Rule = {
    effect: RuleEffect.DISABLE,
    condition: {
      type: 'LEAF',
      scope: '#/properties/disable',
      expectedValue: true,
    },
  };
  const readonlyRule: Rule = {
    effect: RuleEffect.READONLY,
    condition: {
      type: 'LEAF',
      scope: '#/properties/readonly',
      expectedValue: true,
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rules: [disableRule, readonlyRule],
  };

  t.true(hasEnableRule(uischema));
  t.true(hasReadonlyRule(uischema));
  t.false(hasShowRule(uischema));

  const ajv = createAjv();

  // Both fulfilled: element is disabled AND readonly, while visible by default
  const dataBoth = { disable: true, readonly: true };
  t.false(evalEnablement(uischema, dataBoth, undefined, ajv, undefined));
  t.true(evalReadonly(uischema, dataBoth, undefined, ajv, undefined));
  t.true(evalVisibility(uischema, dataBoth, undefined, ajv, undefined));
  t.false(isEnabled(uischema, dataBoth, undefined, ajv, undefined));
  t.true(isReadonly(uischema, dataBoth, undefined, ajv, undefined));
  t.true(isVisible(uischema, dataBoth, undefined, ajv, undefined));

  // Only readonly fulfilled: element is enabled AND readonly
  const dataReadonlyOnly = { disable: false, readonly: true };
  t.true(evalEnablement(uischema, dataReadonlyOnly, undefined, ajv, undefined));
  t.true(evalReadonly(uischema, dataReadonlyOnly, undefined, ajv, undefined));
  t.true(isEnabled(uischema, dataReadonlyOnly, undefined, ajv, undefined));
  t.true(isReadonly(uischema, dataReadonlyOnly, undefined, ajv, undefined));

  // Neither fulfilled: element is enabled AND writable
  const dataNeither = { disable: false, readonly: false };
  t.true(evalEnablement(uischema, dataNeither, undefined, ajv, undefined));
  t.false(evalReadonly(uischema, dataNeither, undefined, ajv, undefined));
  t.true(isEnabled(uischema, dataNeither, undefined, ajv, undefined));
  t.false(isReadonly(uischema, dataNeither, undefined, ajv, undefined));
});

test('isInherentlyEnabled and isInherentlyReadonly support rules array', (t) => {
  const disableRule: Rule = {
    effect: RuleEffect.DISABLE,
    condition: {
      type: 'LEAF',
      scope: '#/properties/disable',
      expectedValue: true,
    },
  };
  const readonlyRule: Rule = {
    effect: RuleEffect.READONLY,
    condition: {
      type: 'LEAF',
      scope: '#/properties/readonly',
      expectedValue: true,
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    rules: [disableRule, readonlyRule],
  };

  const state = {
    jsonforms: {
      core: { ajv: createAjv() } as JsonFormsCore,
    },
  };

  // When disabled and readonly conditions are both met:
  const data1 = { value: 'test', disable: true, readonly: true };
  t.false(isInherentlyEnabled(state, null, uischema, undefined, data1, null));
  t.true(isInherentlyReadonly(state, null, uischema, undefined, data1, null));

  // When only readonly condition is met:
  const data2 = { value: 'test', disable: false, readonly: true };
  t.true(isInherentlyEnabled(state, null, uischema, undefined, data2, null));
  t.true(isInherentlyReadonly(state, null, uischema, undefined, data2, null));

  // When neither condition is met:
  const data3 = { value: 'test', disable: false, readonly: false };
  t.true(isInherentlyEnabled(state, null, uischema, undefined, data3, null));
  t.false(isInherentlyReadonly(state, null, uischema, undefined, data3, null));
});

test('isInherentlyEnabled disabled by options.disabled', (t) => {
  t.false(
    isInherentlyEnabled(
      null as any,
      null,
      { options: { disabled: true } } as unknown as ControlElement,
      undefined,
      null,
      null
    )
  );
});

test('isInherentlyEnabled enabled by options.disabled: false over ownProps', (t) => {
  t.true(
    isInherentlyEnabled(
      null as any,
      { enabled: false },
      { options: { disabled: false } } as unknown as ControlElement,
      undefined,
      null,
      null
    )
  );
});

test('isInherentlyEnabled dynamic rule takes precedence over options.disabled', (t) => {
  const leafCondition: SchemaBasedCondition = {
    scope: '#/properties/ruleValue',
    schema: { type: 'string', pattern: 'bar' },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/value',
    options: {
      disabled: true,
    },
    rule: {
      effect: RuleEffect.ENABLE,
      condition: leafCondition,
    },
  };
  const state = {
    jsonforms: { core: { ajv: createAjv() } as JsonFormsCore },
  };

  // Rule condition met -> ENABLE rule takes precedence over options.disabled
  t.true(
    isInherentlyEnabled(
      state,
      null,
      uischema,
      undefined,
      { value: 'foo', ruleValue: 'bar' },
      null
    )
  );

  // Rule condition not met -> ENABLE rule unfulfilled evaluates to disabled
  t.false(
    isInherentlyEnabled(
      state,
      null,
      uischema,
      undefined,
      { value: 'foo', ruleValue: 'baz' },
      null
    )
  );
});

test('isInherentlyEnabled disabled by config.disabled', (t) => {
  t.false(
    isInherentlyEnabled(
      null as any,
      null,
      null as any,
      undefined,
      null,
      { disabled: true }
    )
  );
});

test('isInherentlyEnabled options.disabled overrides config.disabled', (t) => {
  t.true(
    isInherentlyEnabled(
      null as any,
      null,
      { options: { disabled: false } } as unknown as ControlElement,
      undefined,
      null,
      { disabled: true }
    )
  );
});

test('isInherentlyEnabled options.disabled with schema readOnly', (t) => {
  const uischema = {
    options: { disabled: true },
  } as unknown as ControlElement;
  const schema = { readOnly: true };

  // Enabled is false due to options.disabled
  t.false(isInherentlyEnabled(null as any, null, uischema, schema, null, null));
  // Readonly is true due to schema.readOnly
  t.true(isInherentlyReadonly(null as any, null, uischema, schema, null, null));
});
