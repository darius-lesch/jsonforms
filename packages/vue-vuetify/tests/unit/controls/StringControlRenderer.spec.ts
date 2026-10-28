import { describe, it, expect, beforeEach } from 'vitest';
import { clearAllIds } from '@jsonforms/core';
import StringControlRenderer from '../../../src/controls/StringControlRenderer.vue';
import { entry as stringControlRendererEntry } from '../../../src/controls/StringControlRenderer.entry';
import { wait } from '../../../tests';
import { mountJsonForms } from '../util';

describe('StringControlRenderer.vue', () => {
  const renderers = [stringControlRendererEntry];

  const data = 'a';
  const schema = {
    type: 'string',
    title: 'My String',
  };
  const uischema = {
    type: 'Control',
    scope: '#',
    options: {
      placeholder: 'string placeholder',
    },
  };

  let wrapper: ReturnType<typeof mountJsonForms>;

  beforeEach(() => {
    // clear all ids to guarantee that the snapshots will always be generated with the same ids
    clearAllIds();
    wrapper = mountJsonForms(data, schema, renderers, uischema);
  });

  it('check if child StringControlRenderer exists', () => {
    expect(wrapper.getComponent(StringControlRenderer));
  });

  it('renders a string input', () => {
    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toEqual(true);
  });

  it('renders title as label', () => {
    expect(wrapper.find('label').text()).toEqual('My String');
  });

  it('emits a data change', async () => {
    const input = wrapper.find('input[type="text"]');
    await input.setValue('b');
    // 300 ms debounceWait
    await wait(300);
    expect(wrapper.vm.$data.event.data).toEqual('b');
  });

  it('should have a placeholder', async () => {
    const input = wrapper.find('input[type="text"]');
    const placeholder = input.attributes('placeholder');
    expect(placeholder).toEqual('string placeholder');
  });

  it('should render component and match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});

describe('StringControlRenderer.vue with suggestion', () => {
  const renderers = [stringControlRendererEntry];

  const data = '';

  const schema = {
    type: 'string',
    title: 'Select Continent',
  };
  const uischema = {
    type: 'Control',
    scope: '#',
    options: {
      placeholder: 'Enter your continent',
      suggestion: [
        'Asia',
        'Africa',
        'Europe',
        'North America',
        'South America',
        'Australia/Oceania',
        'Antarctica',
      ],
    },
  };

  let wrapper: ReturnType<typeof mountJsonForms>;

  beforeEach(() => {
    // clear all ids to guarantee that the snapshots will always be generated with the same ids
    clearAllIds();
    wrapper = mountJsonForms(data, schema, renderers, uischema);
  });

  it('check if child StringControlRenderer exists', () => {
    expect(wrapper.getComponent(StringControlRenderer));
  });

  it('renders a string input', () => {
    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toEqual(true);
    expect(input.attributes('type')).toEqual('text');
  });

  it('renders title as label', () => {
    expect(wrapper.find('label').text()).toEqual('Select Continent');
  });

  it('emits a data change', async () => {
    const input = wrapper.find('input[type="text"]');
    await input.setValue('Europe');
    // select the element
    await input.trigger('keydown.enter');
    // 300 ms debounceWait
    await wait(300);
    expect(wrapper.vm.$data.event.data).toEqual('Europe');
  });

  it.todo('should have a placeholder', async () => {
    const input = wrapper.find('input[type="text"]');
    const placeholder = input.attributes('placeholder');
    expect(placeholder).toEqual('Enter your continent');
  });

  it('should render component and match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render component and match snapshot when clicked', async () => {
    const input = wrapper.find('input[type="text"]');
    await input.trigger('click');
    expect(wrapper.html()).toMatchSnapshot();
  });
});

describe('StringControlRenderer.vue readonly vs disabled', () => {
  const renderers = [stringControlRendererEntry];
  const data = 'test value';
  const schemaWithReadOnly = {
    type: 'string',
    title: 'Readonly Field',
    readOnly: true,
  };
  const uischema = {
    type: 'Control',
    scope: '#',
  };

  it('renders input as readonly and focusable (not disabled) by default', () => {
    clearAllIds();
    const wrapper = mountJsonForms(
      data,
      schemaWithReadOnly,
      renderers,
      uischema,
    );
    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes('readonly')).toBeDefined();
    expect(input.attributes('disabled')).toBeUndefined();
  });

  it('renders input as disabled in legacy mode (separateReadonlyFromDisabled: false)', () => {
    clearAllIds();
    const wrapper = mountJsonForms(
      data,
      schemaWithReadOnly,
      renderers,
      uischema,
      { separateReadonlyFromDisabled: false },
    );
    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes('disabled')).toBeDefined();
  });

  it('renders input as disabled via options.disabled: true', () => {
    clearAllIds();
    const plainSchema = { type: 'string' };
    const uischemaWithDisabled = {
      type: 'Control',
      scope: '#',
      options: { disabled: true },
    };
    const wrapper = mountJsonForms(
      data,
      plainSchema,
      renderers,
      uischemaWithDisabled,
    );
    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes('disabled')).toBeDefined();
    expect(input.attributes('readonly')).toBeUndefined();
  });
});
