[**proyecto-e09 v1.0.0**](../../../README.md)

***

[proyecto-e09](../../../modules.md) / [hooks/useFormInput](../README.md) / useFormInput

# Function: useFormInput()

> **useFormInput**\<`T`\>(`initialValues`): `object`

Defined in: [src/client/hooks/useFormInput.ts:34](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/hooks/useFormInput.ts#L34)

Hook personalizado para manejar inputs de formularios

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `any`\>

Tipo del objeto de formulario

## Parameters

### initialValues

`T`

Valores iniciales del formulario

## Returns

`object`

Objeto con values, handleChange, reset, y setValue

### handleChange()

> **handleChange**: (`e`) => `void`

#### Parameters

##### e

`ChangeEvent`\<`HTMLInputElement` \| `HTMLTextAreaElement` \| `HTMLSelectElement`\>

#### Returns

`void`

### reset()

> **reset**: () => `void`

#### Returns

`void`

### setAllValues()

> **setAllValues**: (`newValues`) => `void`

#### Parameters

##### newValues

`Partial`\<`T`\>

#### Returns

`void`

### setValue()

> **setValue**: (`name`, `value`) => `void`

#### Parameters

##### name

keyof `T`

##### value

`any`

#### Returns

`void`

### values

> **values**: `T`

## Example

```ts
const { values, handleChange, reset } = useFormInput({
  username: '',
  password: ''
});

<input
  name="username"
  value={values.username}
  onChange={handleChange}
/>
```
